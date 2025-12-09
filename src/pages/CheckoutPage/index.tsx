import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutHeader from "./CheckoutHeader";
import OrderSummary from "./OrderSummary";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import { useCreateOrder, useRemoveFromCart } from "../../api/generated";
import type { Order, OrderItem } from "../../api/generated";
import "./index.css";

// 1. 定義預期的 API 回應介面，不用 any
interface CreateOrderResponse {
  orderID?: string;
  message?: string;
}

interface CartItem {
  id: string;
  productId?: string;
  name?: string;
  price: number;
  quantity: number;
  stock?: number;
}

interface SellerGroup {
  sellerId: string;
  sellerName?: string;
  items: CartItem[];
}

interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface CheckoutLocationState {
  orderItems?: SellerGroup[];
  shippingAddress?: ShippingAddress;
}

interface CheckoutPageProps {
  onBack?: () => void;
  onSuccess?: (orderId: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onSuccess
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as CheckoutLocationState | null;
  const orderItems: SellerGroup[] = state?.orderItems || [];
  const savedShippingAddress = state?.shippingAddress;

  useEffect(() => {
    if (orderItems.length === 0) {
      alert("購物車是空的，請先選擇商品");
      navigate('/cart');
    }
  }, [orderItems, navigate]);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    savedShippingAddress || {
      recipientName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: ""
    }
  );

  const createOrderMutation = useCreateOrder();
  const removeFromCartMutation = useRemoveFromCart();

  const totalAmount = orderItems.reduce((total, seller) => {
    return total + seller.items.reduce((sum: number, item: CartItem) =>
      sum + item.price * item.quantity, 0
    );
  }, 0);

  const hasStockIssue = orderItems.some(seller =>
    seller.items.some(item => {
      const stock = item.stock;
      return stock !== undefined && stock !== null && item.quantity > stock;
    })
  );

  const stockIssueItems = orderItems.flatMap(seller =>
    seller.items.filter(item => {
      const stock = item.stock;
      return stock !== undefined && stock !== null && item.quantity > stock;
    })
  );

  const validateForm = (): boolean => {
    if (!shippingAddress.recipientName.trim()) {
      alert("請輸入收件人姓名");
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      alert("請輸入聯絡電話");
      return false;
    }
    if (!shippingAddress.address.trim()) {
      alert("請輸入詳細地址");
      return false;
    }
    if (!shippingAddress.city.trim()) {
      alert("請輸入城市");
      return false;
    }
    return true;
  };

  const handleContactSeller = () => {
    const firstSeller = orderItems[0];
    if (firstSeller) {
      navigate('/chat', {
        state: {
          sellerId: firstSeller.sellerId,
          sellerName: firstSeller.sellerName,
          returnToCheckout: true,
          checkoutData: {
            orderItems,
            shippingAddress
          }
        }
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    if (orderItems.length === 0) {
      alert("購物車是空的");
      return;
    }

    const outOfStockItems = orderItems.flatMap(seller =>
      seller.items.filter(item => {
        const stock = item.stock;
        if (stock !== undefined && stock !== null) {
          return item.quantity > stock;
        }
        return false;
      })
    );

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.name).join(', ');
      alert(`以下商品庫存不足，無法結帳:\n${itemNames}\n\n請調整數量或移除商品後再試`);
      return;
    }

    try {
      const cartItems = orderItems.flatMap(seller =>
        seller.items.map((item: CartItem) => ({
          itemId: item.id,
          productId: item.productId || item.id,
          quantity: item.quantity
        }))
      );

      const orderItemsPayload: OrderItem[] = orderItems.flatMap(seller =>
        seller.items.map((item: CartItem) => ({
          productID: item.productId || item.id,
          quantity: item.quantity,
          sellerID: seller.sellerId,
          price: item.price,
          totalPrice: item.price * item.quantity
        }))
      );

      const orderPayload: Order = {
        orderType: "DIRECT",
        orderStatus: "PENDING",
        cart: {
          items: cartItems
        },
        orderItems: orderItemsPayload
      };

      console.log("=== 送出訂單資料 ===");
      console.log(JSON.stringify(orderPayload, null, 2));

      const response = await createOrderMutation.mutateAsync({
        data: orderPayload
      });

      console.log("✅ 訂單建立成功:", response.data);

      // 2. 使用安全的方式讀取資料，不是用 any
      const responseData = response.data as unknown as CreateOrderResponse;
      const orderId = responseData?.orderID || `ORD${Date.now()}`;

      try {
        const itemIdsToRemove = orderItems.flatMap(seller =>
          seller.items.map(item => item.id)
        );

        for (const itemId of itemIdsToRemove) {
          try {
            await removeFromCartMutation.mutateAsync({ itemId });
          } catch (err) {
            console.error(`⚠️ 刪除商品 ${itemId} 失敗:`, err);
          }
        }
      } catch (removeError) {
        console.error("⚠️ 從購物車移除商品失敗:", removeError);
      }

      navigate('/order-success', {
        state: {
          orderData: {
            orderID: orderId,
            totalAmount: totalAmount,
            orderItems: orderItemsPayload,
            orderTime: new Date().toISOString(),
            orderStatus: 'PENDING'
          }
        }
      });

      if (onSuccess) onSuccess(orderId);

    } catch (error: unknown) {
      console.error("❌ 建立訂單失敗:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
            response?: {
              data?: string | { message?: string; error?: string };
              status?: number;
            };
            request?: unknown;
            message?: string;
          };

          if (axiosError.response) {
            console.error("後端回應:", axiosError.response.data);
            const errorData = axiosError.response.data;
            let errorMsg = "訂單建立失敗";

            if (typeof errorData === 'string') {
              errorMsg = errorData;
            } else if (errorData && typeof errorData === 'object') {
              if ('message' in errorData && errorData.message) {
                errorMsg = errorData.message;
              } else if ('error' in errorData && errorData.error) {
                errorMsg = errorData.error;
              }
            }
            alert(`訂單建立失敗:\n${errorMsg}`);
          } else {
             alert("訂單建立失敗: 伺服器無回應");
          }
      } else {
        alert("訂單建立失敗");
      }
    }
  };

  return (
    <div className="checkout-container">
      <CheckoutHeader onBack={onBack} />

      {orderItems.length === 0 ? (
        <div className="checkout-loading">載入中...</div>
      ) : (
        <div className="checkout-grid">
          <div>
            <OrderSummary sellers={orderItems} />
            <ShippingForm
              address={shippingAddress}
              onChange={setShippingAddress}
            />
            <PaymentForm onContactSeller={handleContactSeller} />
          </div>

          <div>
            <div className="checkout-summary-sidebar">
              <h3 className="checkout-summary-title">訂單摘要</h3>
              {hasStockIssue && (
                <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ 庫存不足警告</div>
                  <div style={{ fontSize: '14px' }}>
                    {stockIssueItems.map((item, idx) => (
                      <div key={idx}>• {item.name}: 需要 {item.quantity} 個，庫存僅剩 {item.stock} 個</div>
                    ))}
                  </div>
                </div>
              )}
              <div className="checkout-summary-content">
                <div className="checkout-summary-row">
                  <span>商品小計</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>運費</span>
                  <span>$0</span>
                </div>
                <div className="checkout-summary-divider">
                  <div className="checkout-summary-total">
                    <span>總計</span>
                    <span className="checkout-summary-total-amount">${totalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={createOrderMutation.isPending || hasStockIssue}
                className="checkout-submit-button"
                style={{ opacity: hasStockIssue ? 0.5 : 1, cursor: hasStockIssue ? 'not-allowed' : 'pointer' }}
              >
                {createOrderMutation.isPending ? "處理中..." : hasStockIssue ? "庫存不足" : "結帳"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
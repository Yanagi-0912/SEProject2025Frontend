import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutHeader from "./CheckoutHeader";
import OrderSummary from "./OrderSummary";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import CouponSelector from "./CouponSelector";
import { useCreateOrder, useRemoveFromCart, useGetCurrentUser } from "../../api/generated";
import type { Order, OrderItem } from "../../api/generated";
import { payOrder } from "../../api/coupon";
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

  // 取得當前使用者資料
  const { data: userData } = useGetCurrentUser();
  const currentUser = userData?.data;

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    savedShippingAddress || {
      recipientName: currentUser?.nickname || "",
      phone: currentUser?.phoneNumber || "",
      address: "",
      city: "",
      postalCode: ""
    }
  );

  // 當用戶資料載入後，如果地址欄位是空的，自動填入預設值
  useEffect(() => {
    if (currentUser && !savedShippingAddress) {
      setShippingAddress(prev => ({
        ...prev,
        recipientName: prev.recipientName || currentUser.nickname || "",
        phone: prev.phone || currentUser.phoneNumber || ""
      }));
    }
  }, [currentUser, savedShippingAddress]);

  // 運費（後端預設 100 元）
  const SHIPPING_FEE = 100;

  // 優惠券狀態
  const [selectedUserCoupon, setSelectedUserCoupon] = useState<{ id: string; couponID: string } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isFreeship, setIsFreeship] = useState(false);
  const [buyOneGetOneItem, setBuyOneGetOneItem] = useState<{ id: string; name?: string; price: number } | undefined>(undefined);

  const createOrderMutation = useCreateOrder();
  const removeFromCartMutation = useRemoveFromCart();

  // 優惠券選擇處理
  const handleCouponSelect = (
    userCoupon: { id: string; couponID: string } | null, 
    discount: number,
    freeship: boolean,
    b1g1Item?: { id: string; name?: string; price: number }
  ) => {
    setSelectedUserCoupon(userCoupon);
    setDiscountAmount(discount);
    setIsFreeship(freeship);
    setBuyOneGetOneItem(b1g1Item);
  };

  // 扁平化商品列表（給 CouponSelector 使用）
  // 使用 productId || id 作為統一的商品 ID
  const flatOrderItems = orderItems.flatMap(seller =>
    seller.items.map(item => ({
      id: item.productId || item.id,  // 統一使用 productId
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      stock: item.stock  // 傳遞庫存資訊（買一送一需要檢查）
    }))
  );

  // 原始商品總價（不含買一送一的 +1）
  const baseProductTotal = orderItems.reduce((total, seller) => {
    return total + seller.items.reduce((sum: number, item: CartItem) =>
      sum + item.price * item.quantity, 0
    );
  }, 0);

  // 商品總價（如果有買一送一，需要加上送的那個商品的價格）
  // 買一送一 = 買 1 拿 2，所以總價是 2 個商品的價格
  const productTotal = buyOneGetOneItem 
    ? baseProductTotal + buyOneGetOneItem.price  // 加上送的商品價格
    : baseProductTotal;

  // 實際運費（如果使用免運券則為 0）
  const actualShippingFee = isFreeship ? 0 : SHIPPING_FEE;

  // 最終金額（商品 + 實際運費 - 折扣）
  // 買一送一：折扣 = 送的商品價格，所以最終只付一個商品的錢 + 運費
  const finalAmount = productTotal + actualShippingFee - (isFreeship ? 0 : discountAmount);

  // 庫存檢查（買一送一需要 2 件庫存）
  const hasStockIssue = orderItems.some(seller =>
    seller.items.some(item => {
      const stock = item.stock;
      const itemId = item.productId || item.id;
      // 買一送一的商品需要多 1 件庫存
      const requiredQuantity = (buyOneGetOneItem && itemId === buyOneGetOneItem.id)
        ? item.quantity + 1
        : item.quantity;
      return stock !== undefined && stock !== null && requiredQuantity > stock;
    })
  );

  const stockIssueItems = orderItems.flatMap(seller =>
    seller.items.filter(item => {
      const stock = item.stock;
      const itemId = item.productId || item.id;
      // 買一送一的商品需要多 1 件庫存
      const requiredQuantity = (buyOneGetOneItem && itemId === buyOneGetOneItem.id)
        ? item.quantity + 1
        : item.quantity;
      return stock !== undefined && stock !== null && requiredQuantity > stock;
    }).map(item => {
      const itemId = item.productId || item.id;
      // 顯示實際需要的數量
      const requiredQuantity = (buyOneGetOneItem && itemId === buyOneGetOneItem.id)
        ? item.quantity + 1
        : item.quantity;
      return { ...item, quantity: requiredQuantity };
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

      // 用於顯示的訂單商品列表（包含商品名稱）
      const orderItemsForDisplay = orderItems.flatMap(seller =>
        seller.items.map((item: CartItem) => ({
          productID: item.productId || item.id,
          productName: item.name,
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

      const response = await createOrderMutation.mutateAsync({
        data: orderPayload
      });

      // 2. 從回應中解析 orderID
      let orderId: string;
      
      if (typeof response.data === 'string') {
        const match = response.data.match(/OrderID:\s*(\S+)/);
        orderId = match ? match[1] : `ORD${Date.now()}`;
      } else {
        const responseData = response.data as unknown as CreateOrderResponse;
        orderId = responseData?.orderID || `ORD${Date.now()}`;
      }

      // 3. 付款並套用優惠券
      try {
        await payOrder(orderId, selectedUserCoupon?.id);
      } catch {
        // 即使付款失敗，訂單已建立，繼續流程
      }

      // 4. 從購物車移除已結帳商品
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

      // 如果有買一送一，把對應商品的數量 +1（後端 payOrder 會更新實際數量）
      const displayOrderItems = orderItemsForDisplay.map(item => {
        if (buyOneGetOneItem && (item.productID === buyOneGetOneItem.id)) {
          const newQuantity = item.quantity + 1;  // 買一送一：+1
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.price * newQuantity,  // 更新總價（2 個商品的價格）
            productName: item.productName || buyOneGetOneItem.name
          };
        }
        return item;
      });

      navigate('/order-success', {
        state: {
          orderData: {
            orderID: orderId,
            productTotal: productTotal,
            shippingFee: actualShippingFee,
            discountAmount: isFreeship ? SHIPPING_FEE : discountAmount,
            totalAmount: finalAmount,
            couponUsed: selectedUserCoupon ? true : false,
            isFreeship: isFreeship,
            buyOneGetOneItemId: buyOneGetOneItem?.id,  // 傳遞買一送一的商品 ID
            orderItems: displayOrderItems,
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
            <OrderSummary sellers={orderItems} buyOneGetOneItemId={buyOneGetOneItem?.id} />
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

              {/* 優惠券選擇 */}
              <CouponSelector
                productTotal={productTotal}
                shippingFee={SHIPPING_FEE}
                orderType="DIRECT"
                orderItems={flatOrderItems}
                onCouponSelect={handleCouponSelect}
              />

              <div className="checkout-summary-content">
                <div className="checkout-summary-row">
                  <span>商品小計</span>
                  <span>${productTotal}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>運費</span>
                  {isFreeship ? (
                    <span>
                      <span className="checkout-original-shipping">${SHIPPING_FEE}</span>
                      <span className="checkout-free-shipping">$0</span>
                    </span>
                  ) : (
                    <span>${SHIPPING_FEE}</span>
                  )}
                </div>
                {discountAmount > 0 && !isFreeship && !buyOneGetOneItem && (
                  <div className="checkout-summary-row checkout-discount-row">
                    <span>優惠券折扣</span>
                    <span className="checkout-discount-amount">-${discountAmount}</span>
                  </div>
                )}
                {isFreeship && (
                  <div className="checkout-summary-row checkout-discount-row">
                    <span>免運優惠</span>
                    <span className="checkout-discount-amount">-${SHIPPING_FEE}</span>
                  </div>
                )}
                {buyOneGetOneItem && (
                  <div className="checkout-summary-row checkout-discount-row">
                    <span>買一送一 ({buyOneGetOneItem.name || '商品'})</span>
                    <span className="checkout-discount-amount">-${discountAmount}</span>
                  </div>
                )}
                <div className="checkout-summary-divider">
                  <div className="checkout-summary-total">
                    <span>總計</span>
                    <span className="checkout-summary-total-amount">${finalAmount}</span>
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
// CheckoutPage/index.tsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutHeader from "./CheckoutHeader";
import OrderSummary from "./OrderSummary";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";
import { useCreateOrder, useRemoveFromCart } from "../../api/generated";
import "./index.css";

interface CartItem {
  id: string;          // 購物車項目 ID
  productId?: string;  // 商品 ID
  name?: string;
  price: number;
  quantity: number;
  stock?: number;      // 📦 庫存數量
}

interface SellerGroup {
  sellerId: string;
  sellerName?: string;
  items: CartItem[];
}

interface CheckoutPageProps {
  onBack?: () => void;
  onSuccess?: (orderId: string) => void;
  orderItems?: SellerGroup[];
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onSuccess,
  orderItems: orderItemsProp
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 優先從 props 接收，否則從 location.state 接收購物車傳來的資料
  const orderItems: SellerGroup[] = orderItemsProp || location.state?.orderItems || [];

  // 如果沒有商品,跳轉回購物車
  useEffect(() => {
    if (orderItems.length === 0) {
      alert("購物車是空的,請先選擇商品");
      navigate('/cart');
    }
  }, [orderItems, navigate]);

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");

  // 使用 generated mutations
  const createOrderMutation = useCreateOrder();
  const removeFromCartMutation = useRemoveFromCart();

  const totalAmount = orderItems.reduce((total, seller) => {
    return total + seller.items.reduce((sum: number, item: CartItem) =>
      sum + item.price * item.quantity, 0
    );
  }, 0);

  // 檢查是否有庫存不足的商品
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

  const validateForm = () => {
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

  const handleSubmitOrder = async () => {
    // 1. 前端驗證表單
    if (!validateForm()) {
      return;
    }

    // 2. 檢查是否有商品
    if (orderItems.length === 0) {
      alert("購物車是空的");
      return;
    }

    // 3. 檢查商品庫存 (如果有庫存資訊)
    const outOfStockItems = orderItems.flatMap(seller =>
      seller.items.filter(item => {
        // 如果商品有庫存資訊,檢查是否足夠
        const stock = (item as any).stock;
        if (stock !== undefined && stock !== null) {
          return item.quantity > stock;
        }
        return false;
      })
    );

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.name).join(', ');
      alert(`以下商品庫存不足,無法結帳:\n${itemNames}\n\n請調整數量或移除商品後再試`);
      return;
    }

    try {
      // 3. 準備 Cart 物件 (用於 order.cart)
      const cartItems = orderItems.flatMap(seller =>
        seller.items.map((item: CartItem) => ({
          itemId: item.id,                    // 購物車項目 ID
          productId: item.productId || item.id,  // 商品 ID
          quantity: item.quantity
        }))
      );

      // 4. 準備 OrderItems 陣列
      const orderItemsPayload = orderItems.flatMap(seller =>
        seller.items.map((item: CartItem) => ({
          productID: item.productId || item.id,
          quantity: item.quantity,
          sellerID: seller.sellerId,
          price: item.price,
          totalPrice: item.price * item.quantity
        }))
      );

      // 5. 組合完整的 Order payload
      const orderPayload = {
        orderType: "DIRECT" as const,
        orderStatus: "PENDING" as const,
        cart: {
          items: cartItems
        },
        orderItems: orderItemsPayload
      };

      console.log("=== 送出訂單資料 ===");
      console.log(JSON.stringify(orderPayload, null, 2));
      console.log("配送資訊:", shippingAddress);
      console.log("付款方式:", paymentMethod);

      // 6. 📡 呼叫後端 API 建立訂單
      const response = await createOrderMutation.mutateAsync({
        data: orderPayload
      });

      console.log("✅ 訂單建立成功:", response.data);

      const orderId: string = (response.data as any)?.orderID || `ORD${Date.now()}`;

      // 7. 訂單建立成功後,從購物車移除已結帳的商品
      try {
        const itemIdsToRemove = orderItems.flatMap(seller =>
          seller.items.map(item => item.id)
        );

        console.log("準備從購物車移除的商品:", itemIdsToRemove);

        // 🔧 改用循序刪除,避免競態條件
        for (const itemId of itemIdsToRemove) {
          try {
            await removeFromCartMutation.mutateAsync({ itemId });
            console.log(`✅ 已刪除商品: ${itemId}`);
          } catch (err) {
            console.error(`⚠️ 刪除商品 ${itemId} 失敗:`, err);
            // 繼續刪除其他商品
          }
        }

        console.log("✅ 已從購物車移除所有已結帳的商品");
      } catch (removeError) {
        console.error("⚠️ 從購物車移除商品失敗:", removeError);
        // 不阻止後續流程,因為訂單已經建立成功
      }

      // 8. 成功後跳轉或顯示成功訊息
      alert(`訂單建立成功!\n訂單編號: ${orderId}\n總金額: $${totalAmount}`);

      if (onSuccess) {
        onSuccess(orderId);
      } else {
        navigate('/');
      }

    } catch (error: unknown) {
      console.error("❌ 建立訂單失敗:", error);

      // 更詳細的錯誤訊息 (僅在為 axios 錯誤時讀取 response)
      if (axios.isAxiosError(error) && error.response) {
        console.error("後端回應:", error.response.data);
        console.error("狀態碼:", error.response.status);

        const errorData = error.response.data as unknown;
        let errorMsg = "訂單建立失敗";

        // 處理各種錯誤類型
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData && typeof errorData === 'object' && 'message' in (errorData as any) && typeof (errorData as any).message === 'string') {
          errorMsg = (errorData as any).message;
        } else if (errorData && typeof errorData === 'object' && 'error' in (errorData as any) && typeof (errorData as any).error === 'string') {
          errorMsg = (errorData as any).error;
        }

        // 特別處理庫存不足的錯誤
        if (errorMsg.includes("Out of stock") || errorMsg.includes("庫存不足")) {
          const productMatch = errorMsg.match(/product: (.+?)(?:$|,|\n)/);
          const productName = productMatch ? productMatch[1] : "某商品";

          alert(
            `⚠️ 庫存不足\n\n` +
            `商品「${productName}」的庫存不足,無法完成訂單。\n\n` +
            `請返回購物車調整數量或移除該商品後再試。`
          );
        } else {
          alert(`訂單建立失敗:\n${errorMsg}`);
        }
      } else if (error.request) {
        console.error("請求已發送但無回應:", error.request);
        alert("訂單建立失敗: 伺服器無回應,請檢查網路連線");
      } else {
        console.error("錯誤訊息:", error.message);
        alert(`訂單建立失敗: ${error.message}`);
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
            <PaymentForm
              selectedMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          <div>
            <div className="checkout-summary-sidebar">
              <h3 className="checkout-summary-title">訂單摘要</h3>

              {/* 庫存警告 */}
              {hasStockIssue && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  color: '#856404'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    ⚠️ 庫存不足警告
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {stockIssueItems.map((item, idx) => (
                      <div key={idx}>
                        • {item.name}: 需要 {item.quantity} 個,庫存僅剩 {item.stock} 個
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    請返回購物車調整數量
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
                style={{
                  opacity: hasStockIssue ? 0.5 : 1,
                  cursor: hasStockIssue ? 'not-allowed' : 'pointer'
                }}
              >
                {createOrderMutation.isPending ? "處理中..." : hasStockIssue ? "庫存不足" : "結帳"}
              </button>

              <div className="checkout-terms">
                點擊結帳即表示您同意我們的服務條款
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
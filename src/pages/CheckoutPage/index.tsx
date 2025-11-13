// 結帳頁面主組件

import React, { useState } from "react";
import CheckoutHeader from "./CheckoutHeader";
import OrderSummary from "./OrderSummary";
import ShippingForm from "./ShippingForm";
import PaymentForm from "./PaymentForm";

interface CheckoutPageProps {
  orderItems?: any[];  // 從購物車傳來的選中商品
  onBack?: () => void;
  onSuccess?: (orderId: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  orderItems = [],
  onBack,
  onSuccess
}) => {
  // ========== 前端狀態管理 ==========
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========== 前端計算 - 總金額 ==========
  const totalAmount = orderItems.reduce((total, seller) => {
    return total + seller.items.reduce((sum: number, item: any) =>
      sum + item.price * item.quantity, 0
    );
  }, 0);

  // ========== 前端驗證 ==========
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

  // ========== 前端+後端 - 送出訂單 ==========
  const handleSubmitOrder = async () => {
    // 1. 前端驗證表單
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. 整理要送給後端的資料
      const orderPayload = {
        items: orderItems.flatMap(seller =>
          seller.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        ),
        shippingAddress: {
          recipientName: shippingAddress.recipientName,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode
        },
        paymentMethod: {
          type: paymentMethod
        },
        totalAmount: totalAmount
      };

      console.log("送出訂單資料:", orderPayload);

      // 3. 📡 呼叫後端 API 建立訂單
      // TODO: 替換成真實的 API 端點
      // const response = await fetch('/api/orders/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(orderPayload)
      // });
      //
      // if (!response.ok) {
      //   throw new Error('訂單建立失敗');
      // }
      //
      // const result = await response.json();
      // const orderId = result.orderId;

      // 4. 模擬 API 回應
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockOrderId = `ORD${Date.now()}`;

      // 5. 成功後跳轉或顯示成功訊息
      alert(`訂單建立成功！\n訂單編號：${mockOrderId}\n總金額：$${totalAmount}`);

      if (onSuccess) {
        onSuccess(mockOrderId);
      }

    } catch (error) {
      console.error("建立訂單失敗:", error);
      alert("訂單建立失敗，請重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#1a1a1a" }}>
      <CheckoutHeader onBack={onBack} />

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "20px" }}>
        {/* 左側：表單區 */}
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

        {/* 右側：總金額摘要（固定位置）*/}
        <div>
          <div style={{
            position: "sticky",
            top: "20px",
            backgroundColor: "#2a2a2a",
            borderRadius: "8px",
            padding: "20px"
          }}>
            <h3 style={{ color: "white", marginBottom: "20px" }}>訂單摘要</h3>

            <div style={{ marginBottom: "20px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#aaa",
                marginBottom: "10px"
              }}>
                <span>商品小計</span>
                <span>${totalAmount}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#aaa",
                marginBottom: "10px"
              }}>
                <span>運費</span>
                <span>$0</span>
              </div>
              <div style={{
                borderTop: "1px solid #555",
                paddingTop: "15px",
                marginTop: "15px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "bold"
                }}>
                  <span>總計</span>
                  <span style={{ color: "#5227FF" }}>${totalAmount}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: isSubmitting ? "#666" : "#5227FF",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                marginBottom: "10px"
              }}
            >
              {isSubmitting ? "處理中..." : "結帳"}
            </button>

            <div style={{
              textAlign: "center",
              color: "#aaa",
              fontSize: "12px"
            }}>
              點擊結帳即表示您同意我們的服務條款
            </div>
          </div>
        </div>
      </div>

      {/* 開發提示 */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#2a2a2a",
        borderRadius: "8px",
        color: "#aaa",
        fontSize: "12px"
      }}>
        <div style={{ marginBottom: "10px", fontWeight: "bold", color: "#5227FF" }}>
          💡 前後端分工說明：
        </div>
        <div>✅ 前端負責：表單收集、驗證、計算總金額、呼叫 API</div>
        <div>✅ 後端負責：訂單建立、庫存扣減、付款處理、訂單記錄</div>
        <div style={{ marginTop: "10px", color: "#666" }}>
          📡 需要的 API: POST /api/orders/checkout
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
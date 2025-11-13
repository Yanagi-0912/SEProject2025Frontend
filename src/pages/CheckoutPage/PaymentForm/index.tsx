// 功能：付款方式選擇
// 前端負責：收集付款方式
// 後端負責：處理付款邏輯（串接金流）

import React from "react";

interface PaymentFormProps {
  selectedMethod: string;
  onChange: (method: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ selectedMethod, onChange }) => {
  const paymentMethods = [
    { id: "CREDIT_CARD", label: "信用卡", icon: "💳" },
    { id: "ATM", label: "ATM 轉帳", icon: "🏦" },
    { id: "CASH_ON_DELIVERY", label: "貨到付款", icon: "💵" }
  ];

  return (
    <div style={{
      backgroundColor: "#2a2a2a",
      borderRadius: "8px",
      padding: "20px"
    }}>
      <h3 style={{ color: "white", marginBottom: "15px" }}>2. 付款方式</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "15px",
              backgroundColor: selectedMethod === method.id ? "#444" : "#333",
              border: selectedMethod === method.id ? "2px solid #5227FF" : "2px solid #444",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onChange(e.target.value)}
              style={{ marginRight: "12px", width: "18px", height: "18px" }}
            />
            <span style={{ fontSize: "24px", marginRight: "12px" }}>{method.icon}</span>
            <span style={{ color: "white", fontSize: "16px" }}>{method.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentForm;
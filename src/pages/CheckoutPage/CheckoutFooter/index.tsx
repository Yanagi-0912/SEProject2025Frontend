// 功能：底部總金額和結帳按鈕
// 前端負責：顯示總金額、驗證表單、送出訂單
// 後端負責：接收訂單、建立訂單記錄

import React from "react";

interface CheckoutFooterProps {
  totalAmount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
  totalAmount,
  onSubmit,
  isSubmitting
}) => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "#2a2a2a",
      borderRadius: "8px"
    }}>
      <div style={{ color: "white", fontSize: "16px" }}>
        總共為：
        <strong style={{ color: "#5227FF", fontSize: "28px", marginLeft: "15px" }}>
          ${totalAmount}
        </strong> 元
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        style={{
          padding: "15px 50px",
          backgroundColor: isSubmitting ? "#666" : "#5227FF",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.5 : 1
        }}
      >
        {isSubmitting ? "處理中..." : "結帳"}
      </button>
    </div>
  );
};

export default CheckoutFooter;
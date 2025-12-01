// PaymentForm/index.tsx
import React from "react";
import "./index.css";

interface PaymentFormProps {
  onContactSeller: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onContactSeller }) => {
  return (
    <div className="payment-form-container">
      <h3 className="payment-form-title">付款方式</h3>
      <div className="payment-form-options">
        <div className="payment-form-contact-seller">
          <p className="payment-form-description">
            請與賣家聯繫確認付款方式與交易細節
          </p>
          <button
            onClick={onContactSeller}
            className="payment-form-contact-button"
            type="button"
          >
            💬 聯繫賣家討論付款方式
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
// PaymentForm/index.tsx
import React from "react";
import "./index.css";

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
    <div className="payment-form-container">
      <h3 className="payment-form-title">付款方式</h3>
      <div className="payment-form-options">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`payment-form-option ${selectedMethod === method.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onChange(e.target.value)}
              className="payment-form-radio"
            />
            <span className="payment-form-icon">{method.icon}</span>
            <span className="payment-form-label">{method.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PaymentForm;
// CheckoutHeader/index.tsx
import React from "react";
import "./index.css";

interface CheckoutHeaderProps {
  onBack?: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onBack }) => {
  return (
    <div className="checkout-header">
      <button onClick={onBack} className="checkout-header-back-button">
        ← 返回
      </button>
      <h2 className="checkout-header-title">結帳</h2>
    </div>
  );
};

export default CheckoutHeader;
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
        <img src="/home-icon.png" alt="返回" className="home-icon-img" />
      </button>
      <h2 className="checkout-header-title"> 結帳確認 </h2>
    </div>
  );
};

export default CheckoutHeader;
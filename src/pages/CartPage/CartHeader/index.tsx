import React from "react";
import "./index.css";

interface CartHeaderProps {
  onBack?: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({ onBack }) => {
  return (
    <div className="cart-header">
      <button onClick={onBack} className="cart-header-back-btn">
        ← 返回主頁
      </button>
      <h2 className="cart-header-title">購物車</h2>
      <div className="cart-header-spacer"></div>
    </div>
  );
};

export default CartHeader;
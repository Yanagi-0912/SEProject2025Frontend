import React from "react";
import "./index.css";

interface CartFooterProps {
  allSelected: boolean;
  totalPrice: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onCheckout: () => void;
}

const CartFooter: React.FC<CartFooterProps> = ({
  allSelected,
  totalPrice,
  selectedCount,
  onToggleSelectAll,
  onCheckout
}) => {
  return (
    <div className="cart-footer">
      <label className="cart-footer-select-all">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          className="cart-footer-checkbox"
        />
        全選
      </label>

      <div className="cart-footer-summary">
        已選 <strong className="cart-footer-count">{selectedCount}</strong> 件商品，
        總計：<strong className="cart-footer-price">${totalPrice}</strong>
      </div>

      <button
        onClick={onCheckout}
        disabled={selectedCount === 0}
        className="cart-footer-checkout-btn"
      >
        去結帳 ({selectedCount})
      </button>
    </div>
  );
};

export default CartFooter;
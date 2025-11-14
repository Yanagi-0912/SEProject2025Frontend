import React from "react";

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
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "#2a2a2a",
      borderRadius: "8px"
    }}>
      <label style={{ display: "flex", alignItems: "center", color: "white", fontSize: "16px" }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          style={{ marginRight: "10px", width: "18px", height: "18px" }}
        />
        全選
      </label>

      <div style={{ color: "white", fontSize: "16px" }}>
        已選 <strong style={{ color: "#5227FF" }}>{selectedCount}</strong> 件商品，
        總計：<strong style={{ color: "#5227FF", fontSize: "24px", marginLeft: "10px" }}>${totalPrice}</strong>
      </div>

      <button
        onClick={onCheckout}
        disabled={selectedCount === 0}
        style={{
          padding: "12px 40px",
          backgroundColor: selectedCount === 0 ? "#666" : "#5227FF",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: selectedCount === 0 ? "not-allowed" : "pointer",
          opacity: selectedCount === 0 ? 0.5 : 1
        }}
      >
        去結帳 ({selectedCount})
      </button>
    </div>
  );
};

export default CartFooter;
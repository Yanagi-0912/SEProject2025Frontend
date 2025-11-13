import React from "react";

interface CheckoutHeaderProps {
  onBack?: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onBack }) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
      padding: "10px",
      backgroundColor: "#2a2a2a",
      borderRadius: "8px"
    }}>
      <button
        onClick={onBack}
        style={{
          padding: "8px 16px",
          backgroundColor: "#444",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "20px"
        }}
      >
        ← 返回
      </button>
      <h2 style={{ color: "white", margin: 0 }}>結帳</h2>
    </div>
  );
};

export default CheckoutHeader;
// 功能：顯示購物車頂部標題列
// 主要內容：
// - 返回主頁按鈕
// - 購物車標題
// 接收 props：
// - onBack: 返回按鈕的點擊事件處理函數
// 需要 import：
// import React from "react";

import React from "react";

interface CartHeaderProps {
  onBack?: () => void;
}

const CartHeader: React.FC<CartHeaderProps> = ({ onBack }) => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
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
          cursor: "pointer"
        }}
      >
        ← 返回主頁
      </button>
      <h2 style={{ color: "white", margin: 0 }}>購物車</h2>
      <div style={{ width: "100px" }}></div>
    </div>
  );
};

export default CartHeader;
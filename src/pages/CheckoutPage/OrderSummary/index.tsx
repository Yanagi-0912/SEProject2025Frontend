// 功能：顯示訂單商品明細（視窗區）
// 前端負責：渲染商品列表、計算小計
// 後端負責：提供商品資料（從購物車傳來）

import React from "react";

interface OrderSummaryProps {
  sellers: any[];  // TODO: 改成真實型別
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ sellers }) => {
  return (
    <div style={{
      backgroundColor: "#2a2a2a",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "20px"
    }}>
      <h3 style={{ color: "white", marginBottom: "15px" }}>視窗</h3>
      <div style={{
        border: "2px solid #444",
        borderRadius: "8px",
        overflow: "hidden",
        maxHeight: "400px",
        overflowY: "auto"
      }}>
        {sellers.map((seller, idx) => (
          <div key={idx}>
            {/* 賣家名稱 */}
            <div style={{
              backgroundColor: "#333",
              color: "white",
              padding: "10px 15px",
              fontWeight: "bold",
              borderBottom: "1px solid #444"
            }}>
              {seller.name}
            </div>

            {/* 商品列表 */}
            {seller.items.map((item: any, itemIdx: number) => (
              <div
                key={itemIdx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "12px 15px",
                  backgroundColor: itemIdx % 2 === 0 ? "#2a2a2a" : "#252525",
                  borderBottom: "1px solid #444",
                  color: "white",
                  alignItems: "center"
                }}
              >
                <span>{item.name}</span>
                <span style={{ textAlign: "center" }}>x{item.quantity}</span>
                <span style={{ textAlign: "right", color: "#5227FF", fontWeight: "bold" }}>
                  ${item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSummary;
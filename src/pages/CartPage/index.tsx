import React from "react";

interface CartProps {
  onBack?: () => void;
}

const CartPage: React.FC<CartProps> = ({ onBack }) => {
  // 模擬資料 - 之後由其他組員的功能替換
  const mockData = {
    sellers: [
      {
        id: "a",
        name: "a 賣家",
        items: [
          { id: "a1", name: "襪子", price: 100, qty: 1, selected: false },
          { id: "a2", name: "鞋子", price: 500, qty: 2, selected: false },
          { id: "a3", name: "褲子", price: 800, qty: 1, selected: false },
        ],
      },
      {
        id: "b",
        name: "b 賣家",
        items: [
          { id: "b1", name: "襪子", price: 120, qty: 1, selected: false },
          { id: "b2", name: "鞋子", price: 600, qty: 1, selected: false },
          { id: "b3", name: "褲子", price: 900, qty: 1, selected: false },
          { id: "b4", name: "手機", price: 130, qty: 1, selected: false },
        ],
      },
    ],
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#1a1a1a" }}>
      {/* 標題列 */}
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
        <div style={{ width: "100px" }}></div> {/* 佔位保持標題居中 */}
      </div>

      {/* 購物車內容 */}
      <div style={{ backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "20px" }}>
        {mockData.sellers.map((seller) => (
          <div
            key={seller.id}
            style={{
              border: "2px solid #444",
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#333"
            }}
          >
            {/* 賣家標題 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
              borderBottom: "1px solid #555",
              paddingBottom: "10px"
            }}>
              <input
                type="checkbox"
                style={{ marginRight: "10px", width: "18px", height: "18px" }}
              />
              <span style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
                {seller.name}
              </span>
            </div>

            {/* 商品表格 */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #555" }}>
                  <th style={{ width: "50px", padding: "10px", color: "#aaa" }}></th>
                  <th style={{ padding: "10px", textAlign: "left", color: "#aaa" }}>商品</th>
                  <th style={{ width: "120px", padding: "10px", textAlign: "center", color: "#aaa" }}>價格</th>
                  <th style={{ width: "150px", padding: "10px", textAlign: "center", color: "#aaa" }}>數量</th>
                </tr>
              </thead>
              <tbody>
                {seller.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #444" }}>
                    <td style={{ textAlign: "center", padding: "15px" }}>
                      <input type="checkbox" style={{ width: "18px", height: "18px" }} />
                    </td>
                    <td style={{ padding: "15px", color: "white", fontSize: "16px" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center", color: "white" }}>
                      {item.price}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center", color: "white" }}>
                      <button style={{
                        padding: "5px 12px",
                        backgroundColor: "#555",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}>-</button>
                      <span style={{ padding: "0 15px", fontSize: "16px" }}>{item.qty}</span>
                      <button style={{
                        padding: "5px 12px",
                        backgroundColor: "#555",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}>+</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* 底部操作列 */}
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
          <input type="checkbox" style={{ marginRight: "10px", width: "18px", height: "18px" }} />
          全選
        </label>

        <div style={{ color: "white", fontSize: "18px" }}>
          商品總共為：<strong style={{ color: "#5227FF", fontSize: "24px" }}>XXX</strong> 元
        </div>

        <button
          onClick={() => alert("前端模擬：準備結帳(尚未接 API)")}
          style={{
            padding: "12px 40px",
            backgroundColor: "#5227FF",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          去結帳
        </button>
      </div>
    </div>
  );
};

export default CartPage;
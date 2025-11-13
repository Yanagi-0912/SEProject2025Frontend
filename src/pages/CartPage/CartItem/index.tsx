import React from "react";

interface CartItemProps {
  item: any;
  onToggleSelect: () => void;
  onUpdateQuantity: (delta: number) => void;
  onDelete: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onToggleSelect, 
  onUpdateQuantity,
  onDelete 
}) => {
  return (
    <tr style={{ borderBottom: "1px solid #444" }}>
      <td style={{ textAlign: "center", padding: "15px" }}>
        <input
          type="checkbox"
          checked={item.selected}
          onChange={onToggleSelect}
          style={{ width: "18px", height: "18px" }}
        />
      </td>
      <td style={{ padding: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img 
            src={item.image || "https://via.placeholder.com/60"} 
            alt={item.name}
            style={{ 
              width: "60px", 
              height: "60px", 
              objectFit: "cover",
              borderRadius: "5px",
              backgroundColor: "#555"
            }}
          />
          <div>
            <div style={{ color: "white", fontSize: "16px", marginBottom: "5px" }}>
              {item.name}
            </div>
            <div style={{ color: "#aaa", fontSize: "12px" }}>
              庫存: {item.stock}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "15px", textAlign: "center", color: "white" }}>
        ${item.price}
      </td>
      <td style={{ padding: "15px", textAlign: "center", color: "white" }}>
        <button
          onClick={() => onUpdateQuantity(-1)}
          disabled={item.quantity <= 1}
          style={{
            padding: "5px 12px",
            backgroundColor: "#555",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            opacity: item.quantity <= 1 ? 0.5 : 1
          }}
        >
          -
        </button>
        <span style={{ padding: "0 15px", fontSize: "16px" }}>{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(1)}
          disabled={item.quantity >= item.stock}
          style={{
            padding: "5px 12px",
            backgroundColor: "#555",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            opacity: item.quantity >= item.stock ? 0.5 : 1
          }}
        >
          +
        </button>
      </td>
      <td style={{ padding: "15px", textAlign: "center", color: "#5227FF", fontWeight: "bold" }}>
        ${item.price * item.quantity}
      </td>
      <td style={{ padding: "15px", textAlign: "center" }}>
        <button
          onClick={onDelete}
          style={{
            padding: "5px 10px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          刪除
        </button>
      </td>
    </tr>
  );
};

export default CartItem;

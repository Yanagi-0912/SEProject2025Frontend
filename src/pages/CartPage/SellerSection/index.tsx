import React from "react";
import CartItem from "../CartItem";

interface SellerSectionProps {
  seller: any;
  onToggleSellerSelect: (sellerId: string) => void;
  onToggleItemSelect: (sellerId: string, itemId: string) => void;
  onUpdateQuantity: (sellerId: string, itemId: string, delta: number) => void;
  onDeleteItem: (sellerId: string, itemId: string) => void;
}

const SellerSection: React.FC<SellerSectionProps> = ({
  seller,
  onToggleSellerSelect,
  onToggleItemSelect,
  onUpdateQuantity,
  onDeleteItem
}) => {
  const allSelected = seller.items.every((item: any) => item.selected);
  const someSelected = seller.items.some((item: any) => item.selected);

  return (
    <div style={{
      border: "2px solid #444",
      marginBottom: "20px",
      padding: "15px",
      borderRadius: "8px",
      backgroundColor: "#333"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "15px",
        borderBottom: "1px solid #555",
        paddingBottom: "10px"
      }}>
        <input
          type="checkbox"
          checked={allSelected}
          ref={input => {
            if (input) {
              input.indeterminate = someSelected && !allSelected;
            }
          }}
          onChange={() => onToggleSellerSelect(seller.sellerId)}
          style={{ marginRight: "10px", width: "18px", height: "18px" }}
        />
        <span style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
          {seller.sellerName}
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #555" }}>
            <th style={{ width: "50px", padding: "10px", color: "#aaa" }}></th>
            <th style={{ padding: "10px", textAlign: "left", color: "#aaa" }}>商品</th>
            <th style={{ width: "120px", padding: "10px", textAlign: "center", color: "#aaa" }}>單價</th>
            <th style={{ width: "150px", padding: "10px", textAlign: "center", color: "#aaa" }}>數量</th>
            <th style={{ width: "120px", padding: "10px", textAlign: "center", color: "#aaa" }}>小計</th>
            <th style={{ width: "80px", padding: "10px", textAlign: "center", color: "#aaa" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {seller.items.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              onToggleSelect={() => onToggleItemSelect(seller.sellerId, item.id)}
              onUpdateQuantity={(delta) => onUpdateQuantity(seller.sellerId, item.id, delta)}
              onDelete={() => onDeleteItem(seller.sellerId, item.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerSection;

// ==================== 📁 cartpage/CartItem/index.tsx ====================
// 功能：顯示單個購物車商品項目
// 主要內容：
// - 商品選取 checkbox
// - 商品圖片和名稱
// - 商品價格
// - 數量增減按鈕
// - 小計金額
// 接收 props：
// - item: 商品資料（包含 product、quantity、selected）
// - onToggleSelect: 切換選取狀態的函數
// - onUpdateQty: 更新數量的函數
// 需要 import：
// import React from "react";

import React from "react";

// 產品類型定義
interface Product {
  ProductID: string;
  SellerID: string;
  ProductName: string;
  ProductDescription: string;
  ProductPrice: number;
  ProductImage: string;
  ProductType: string;
  ProductStock: number;
  ProductCategory: string;
  ProductStatus: string;
  CreatedTime: string;
  UpdatedTime: string;
  AuctionEndTime?: string;
  NowHighestBid?: number;
  HighestBidderID?: string;
  ViewCount: number;
  AverageRating: number;
  ReviewCount: number;
  TotalSales: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
}

interface CartItemProps {
  item: CartItem;
  onToggleSelect: (productID: string) => void;
  onUpdateQty: (productID: string, delta: number) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onToggleSelect, onUpdateQty }) => {
  const { product, quantity, selected } = item;

  return (
    <tr style={{ borderBottom: "1px solid #444" }}>
      <td style={{ textAlign: "center", padding: "15px" }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.ProductID)}
          style={{ width: "18px", height: "18px" }}
        />
      </td>
      <td style={{ padding: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {product.ProductImage && (
            <img
              src={product.ProductImage}
              alt={product.ProductName}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "5px",
                backgroundColor: "#555"
              }}
            />
          )}
          <div>
            <div style={{ color: "white", fontSize: "16px", marginBottom: "5px" }}>
              {product.ProductName}
            </div>
            <div style={{ color: "#aaa", fontSize: "12px" }}>
              庫存: {product.ProductStock}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: "15px", textAlign: "center", color: "white" }}>
        ${product.ProductPrice}
      </td>
      <td style={{ padding: "15px", textAlign: "center", color: "white" }}>
        <button
          onClick={() => onUpdateQty(product.ProductID, -1)}
          disabled={quantity <= 1}
          style={{
            padding: "5px 12px",
            backgroundColor: "#555",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            opacity: quantity <= 1 ? 0.5 : 1
          }}
        >
          -
        </button>
        <span style={{ padding: "0 15px", fontSize: "16px" }}>{quantity}</span>
        <button
          onClick={() => onUpdateQty(product.ProductID, 1)}
          disabled={quantity >= product.ProductStock}
          style={{
            padding: "5px 12px",
            backgroundColor: "#555",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            opacity: quantity >= product.ProductStock ? 0.5 : 1
          }}
        >
          +
        </button>
      </td>
      <td style={{ padding: "15px", textAlign: "center", color: "#5227FF", fontWeight: "bold" }}>
        ${product.ProductPrice * quantity}
      </td>
    </tr>
  );
};

export default CartItemComponent;
// 功能：顯示單個賣家的商品區塊
// 主要內容：
// - 賣家名稱和全選 checkbox
// - 商品列表表格（表頭 + 商品項目）
// - 整合多個 CartItem 組件
// 接收 props：
// - sellerCart: 賣家購物車資料（包含賣家資訊和商品列表）
// - onToggleSellerSelect: 切換賣家全選的函數
// - onToggleItemSelect: 切換單個商品選取的函數
// - onUpdateQty: 更新商品數量的函數
// 需要 import：
// import React from "react";
// import CartItemComponent from "../CartItem";

import React from "react";
import CartItemComponent from "../CartItem";

// 產品類型定義（與 CartItem 相同）
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

interface SellerCart {
  sellerID: string;
  sellerName: string;
  items: CartItem[];
}

interface SellerSectionProps {
  sellerCart: SellerCart;
  onToggleSellerSelect: (sellerID: string) => void;
  onToggleItemSelect: (sellerID: string, productID: string) => void;
  onUpdateQty: (sellerID: string, productID: string, delta: number) => void;
}

const SellerSection: React.FC<SellerSectionProps> = ({
  sellerCart,
  onToggleSellerSelect,
  onToggleItemSelect,
  onUpdateQty
}) => {
  const allSelected = sellerCart.items.every(item => item.selected);
  const someSelected = sellerCart.items.some(item => item.selected);

  return (
    <div style={{
      border: "2px solid #444",
      marginBottom: "20px",
      padding: "15px",
      borderRadius: "8px",
      backgroundColor: "#333"
    }}>
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
          checked={allSelected}
          ref={input => {
            if (input) {
              input.indeterminate = someSelected && !allSelected;
            }
          }}
          onChange={() => onToggleSellerSelect(sellerCart.sellerID)}
          style={{ marginRight: "10px", width: "18px", height: "18px" }}
        />
        <span style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}>
          {sellerCart.sellerName}
        </span>
      </div>

      {/* 商品表格 */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #555" }}>
            <th style={{ width: "50px", padding: "10px", color: "#aaa" }}></th>
            <th style={{ padding: "10px", textAlign: "left", color: "#aaa" }}>商品</th>
            <th style={{ width: "120px", padding: "10px", textAlign: "center", color: "#aaa" }}>單價</th>
            <th style={{ width: "150px", padding: "10px", textAlign: "center", color: "#aaa" }}>數量</th>
            <th style={{ width: "120px", padding: "10px", textAlign: "center", color: "#aaa" }}>小計</th>
          </tr>
        </thead>
        <tbody>
          {sellerCart.items.map((item) => (
            <CartItemComponent
              key={item.product.ProductID}
              item={item}
              onToggleSelect={(productID) => onToggleItemSelect(sellerCart.sellerID, productID)}
              onUpdateQty={(productID, delta) => onUpdateQty(sellerCart.sellerID, productID, delta)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerSection;
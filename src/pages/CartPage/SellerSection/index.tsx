import React from "react";
import CartItemComponent from "../CartItem";
import "./index.css";

interface Product {
  productID: string;
  productName: string;
  ProductPrice: number;
  ProductImage: string;
  ProductStock: number;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selected: boolean;
}

interface Seller {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
}

interface SellerSectionProps {
  seller: Seller;
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
  const allSelected = seller.items.every(item => item.selected);
  const someSelected = seller.items.some(item => item.selected);

  return (
    <div className="seller-section">
      <div className="seller-section-header">
        <input
          type="checkbox"
          checked={allSelected}
          ref={input => {
            if (input) {
              input.indeterminate = someSelected && !allSelected;
            }
          }}
          onChange={() => onToggleSellerSelect(seller.sellerId)}
          className="seller-section-checkbox"
        />
        <span className="seller-section-name">
          {seller.sellerName}
        </span>
      </div>

      <table className="seller-section-table">
        <thead>
          <tr className="seller-section-table-header">
            <th className="seller-table-th-checkbox"></th>
            <th className="seller-table-th-product">商品</th>
            <th className="seller-table-th-price">單價</th>
            <th className="seller-table-th-quantity">數量</th>
            <th className="seller-table-th-subtotal">小計</th>
            <th className="seller-table-th-action">操作</th>
          </tr>
        </thead>
        <tbody>
          {seller.items.map((item) => (
            <CartItemComponent
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
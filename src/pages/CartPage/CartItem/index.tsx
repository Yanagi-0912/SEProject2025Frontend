import React from "react";
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

interface CartItemProps {
  item: CartItem;
  onToggleSelect: () => void;
  onUpdateQuantity: (delta: number) => void;
  onDelete: () => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onToggleSelect,
  onUpdateQuantity,
  onDelete
}) => {
  return (
    <tr className="cart-item-row">
      <td className="cart-item-checkbox-cell">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={onToggleSelect}
          className="cart-item-checkbox"
        />
      </td>
      <td className="cart-item-product-cell">
        <div className="cart-item-product-info">
          <img
            src={item.product.ProductImage || "https://via.placeholder.com/60"}
            alt={item.product.productName}
            className="cart-item-image"
          />
          <div className="cart-item-details">
            <div className="cart-item-name">
              {item.product.productName}
            </div>
          </div>
        </div>
      </td>
      <td className="cart-item-price-cell">
        ${item.product.ProductPrice}
      </td>
      <td className="cart-item-quantity-cell">
        <button
          onClick={() => onUpdateQuantity(-1)}
          disabled={item.quantity <= 1}
          className="cart-item-quantity-btn"
        >
          -
        </button>
        <span className="cart-item-quantity-value">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(1)}
          disabled={item.quantity >= item.product.ProductStock}
          className="cart-item-quantity-btn"
        >
          +
        </button>
      </td>
      <td className="cart-item-subtotal-cell">
        ${item.product.ProductPrice * item.quantity}
      </td>
      <td className="cart-item-action-cell">
        <button
          onClick={onDelete}
          className="cart-item-delete-btn"
        >
          刪除
        </button>
      </td>
    </tr>
  );
};

export default CartItemComponent;
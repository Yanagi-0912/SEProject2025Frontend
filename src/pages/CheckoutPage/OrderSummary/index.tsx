// OrderSummary/index.tsx
import React from "react";
import "./index.css";

interface CartItem {
  id: string;
  name?: string;
  price: number;
  quantity: number;
}

interface SellerGroup {
  sellerId: string;
  sellerName?: string;
  items: CartItem[];
}

interface OrderSummaryProps {
  sellers: SellerGroup[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ sellers }) => {
  return (
    <div className="order-summary-container">
      <h3 className="order-summary-title">商品明細</h3>
      <div className="order-summary-scroll">
        {sellers.map((seller, idx) => (
          <div key={seller.sellerId || idx}>
            <div className="order-summary-seller-header">
              {seller.sellerName || `賣家 ${idx + 1}`}
            </div>

            {seller.items.map((item: CartItem, itemIdx: number) => (
              <div key={item.id || itemIdx} className="order-summary-item">
                <span>{item.name || "商品"}</span>
                <span className="order-summary-item-quantity">x{item.quantity}</span>
                <span className="order-summary-item-price">
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
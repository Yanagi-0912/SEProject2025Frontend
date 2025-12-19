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
  buyOneGetOneItemId?: string;  // 買一送一選中的商品 ID
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ sellers, buyOneGetOneItemId }) => {
  return (
    <div className="order-summary-container">
      <h3 className="order-summary-title">商品明細</h3>
      <div className="order-summary-scroll">
        {sellers.map((seller, idx) => (
          <div key={seller.sellerId || idx}>
            <div className="order-summary-seller-header">
              {seller.sellerName || `賣家 ${idx + 1}`}
            </div>

            {seller.items.map((item: CartItem, itemIdx: number) => {
              const isBuyOneGetOne = item.id === buyOneGetOneItemId;
              const displayQuantity = isBuyOneGetOne ? item.quantity + 1 : item.quantity;
              const displayPrice = item.price * displayQuantity;  // 買一送一時顯示 2 個的價格
              
              return (
                <div key={item.id || itemIdx} className="order-summary-item">
                  <span className="order-summary-item-name">
                    {item.name || "商品"}
                    {isBuyOneGetOne && <span className="order-summary-b1g1-tag">送一</span>}
                  </span>
                  <span className="order-summary-item-quantity">
                    x{displayQuantity}
                    {isBuyOneGetOne && <span className="order-summary-b1g1-bonus"> (+1)</span>}
                  </span>
                  <span className="order-summary-item-price">
                    ${displayPrice}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSummary;
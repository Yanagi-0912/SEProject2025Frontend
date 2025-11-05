// 功能：購物車主組件（整合所有子組件）
// 主要內容：
// - 管理購物車所有狀態（sellerCarts）
// - 處理所有事件邏輯（選取、數量變更、全選、結帳）
// - 計算總價和已選商品數量
// - 整合並渲染所有子組件
// 接收 props：
// - onBack: 返回主頁的函數

import React, { useState } from "react";
import CartHeader from "./CartHeader";
import SellerSection from "./SellerSection";
import CartFooter from "./CartFooter";

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

interface SellerCart {
  sellerID: string;
  sellerName: string;
  items: CartItem[];
}

interface CartProps {
  onBack?: () => void;
}

const CartPage: React.FC<CartProps> = ({ onBack }) => {
  // 狀態管理：購物車資料（按賣家分組）
  const [sellerCarts, setSellerCarts] = useState<SellerCart[]>([
    {
      sellerID: "seller_a",
      sellerName: "A 賣家",
      items: [
        {
          product: {
            ProductID: "prod_a1",
            SellerID: "seller_a",
            ProductName: "經典棉質襪子",
            ProductDescription: "舒適透氣的棉質襪子",
            ProductPrice: 100,
            ProductImage: "https://via.placeholder.com/60",
            ProductType: "DIRECT",
            ProductStock: 50,
            ProductCategory: "服飾配件",
            ProductStatus: "ACTIVE",
            CreatedTime: "2024-01-01T00:00:00",
            UpdatedTime: "2024-01-01T00:00:00",
            ViewCount: 120,
            AverageRating: 4.5,
            ReviewCount: 20,
            TotalSales: 100
          },
          quantity: 1,
          selected: false
        },
        {
          product: {
            ProductID: "prod_a2",
            SellerID: "seller_a",
            ProductName: "運動休閒鞋",
            ProductDescription: "輕量化設計，適合運動與日常穿搭",
            ProductPrice: 500,
            ProductImage: "https://via.placeholder.com/60",
            ProductType: "DIRECT",
            ProductStock: 20,
            ProductCategory: "鞋類",
            ProductStatus: "ACTIVE",
            CreatedTime: "2024-01-01T00:00:00",
            UpdatedTime: "2024-01-01T00:00:00",
            ViewCount: 350,
            AverageRating: 4.8,
            ReviewCount: 45,
            TotalSales: 80
          },
          quantity: 2,
          selected: false
        }
      ]
    },
    {
      sellerID: "seller_b",
      sellerName: "B 賣家",
      items: [
        {
          product: {
            ProductID: "prod_b1",
            SellerID: "seller_b",
            ProductName: "時尚牛仔褲",
            ProductDescription: "彈性面料，舒適不緊繃",
            ProductPrice: 800,
            ProductImage: "https://via.placeholder.com/60",
            ProductType: "DIRECT",
            ProductStock: 15,
            ProductCategory: "服飾",
            ProductStatus: "ACTIVE",
            CreatedTime: "2024-01-01T00:00:00",
            UpdatedTime: "2024-01-01T00:00:00",
            ViewCount: 200,
            AverageRating: 4.3,
            ReviewCount: 30,
            TotalSales: 60
          },
          quantity: 1,
          selected: false
        },
        {
          product: {
            ProductID: "prod_b2",
            SellerID: "seller_b",
            ProductName: "智慧型手機",
            ProductDescription: "最新款旗艦機種",
            ProductPrice: 15000,
            ProductImage: "https://via.placeholder.com/60",
            ProductType: "DIRECT",
            ProductStock: 5,
            ProductCategory: "3C電子",
            ProductStatus: "ACTIVE",
            CreatedTime: "2024-01-01T00:00:00",
            UpdatedTime: "2024-01-01T00:00:00",
            ViewCount: 500,
            AverageRating: 4.7,
            ReviewCount: 80,
            TotalSales: 25
          },
          quantity: 1,
          selected: false
        }
      ]
    }
  ]);

  // 事件處理：切換單一商品選取狀態
  const handleToggleItemSelect = (sellerID: string, productID: string) => {
    setSellerCarts(sellerCarts.map(cart => {
      if (cart.sellerID === sellerID) {
        return {
          ...cart,
          items: cart.items.map(item =>
            item.product.ProductID === productID
              ? { ...item, selected: !item.selected }
              : item
          )
        };
      }
      return cart;
    }));
  };

  // 事件處理：切換賣家所有商品選取狀態
  const handleToggleSellerSelect = (sellerID: string) => {
    setSellerCarts(sellerCarts.map(cart => {
      if (cart.sellerID === sellerID) {
        const allSelected = cart.items.every(item => item.selected);
        return {
          ...cart,
          items: cart.items.map(item => ({ ...item, selected: !allSelected }))
        };
      }
      return cart;
    }));
  };

  // 事件處理：更新商品數量
  const handleUpdateQty = (sellerID: string, productID: string, delta: number) => {
    setSellerCarts(sellerCarts.map(cart => {
      if (cart.sellerID === sellerID) {
        return {
          ...cart,
          items: cart.items.map(item => {
            if (item.product.ProductID === productID) {
              const newQty = item.quantity + delta;
              if (newQty >= 1 && newQty <= item.product.ProductStock) {
                return { ...item, quantity: newQty };
              }
            }
            return item;
          })
        };
      }
      return cart;
    }));
  };

  // 事件處理：全選/取消全選
  const handleToggleSelectAll = () => {
    const allSelected = sellerCarts.every(cart =>
      cart.items.every(item => item.selected)
    );
    setSellerCarts(sellerCarts.map(cart => ({
      ...cart,
      items: cart.items.map(item => ({ ...item, selected: !allSelected }))
    })));
  };

  // 計算：總價和已選商品數量
  const { totalPrice, selectedCount } = sellerCarts.reduce((acc, cart) => {
    cart.items.forEach(item => {
      if (item.selected) {
        acc.totalPrice += item.product.ProductPrice * item.quantity;
        acc.selectedCount += item.quantity;
      }
    });
    return acc;
  }, { totalPrice: 0, selectedCount: 0 });

  // 計算：是否全選
  const allSelected = sellerCarts.length > 0 && sellerCarts.every(cart =>
    cart.items.every(item => item.selected)
  );

  // 事件處理：結帳
  const handleCheckout = () => {
    const selectedItems = sellerCarts.flatMap(cart =>
      cart.items.filter(item => item.selected)
    );
    console.log("準備結帳的商品:", selectedItems);
    alert(`準備結帳 ${selectedCount} 件商品，總金額 $${totalPrice}`);
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#1a1a1a" }}>
      <CartHeader onBack={onBack} />

      <div style={{ backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "20px" }}>
        {sellerCarts.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#888",
            fontSize: "18px"
          }}>
            購物車是空的
          </div>
        ) : (
          sellerCarts.map((cart) => (
            <SellerSection
              key={cart.sellerID}
              sellerCart={cart}
              onToggleSellerSelect={handleToggleSellerSelect}
              onToggleItemSelect={handleToggleItemSelect}
              onUpdateQty={handleUpdateQty}
            />
          ))
        )}
      </div>

      <CartFooter
        allSelected={allSelected}
        totalPrice={totalPrice}
        selectedCount={selectedCount}
        onToggleSelectAll={handleToggleSelectAll}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default CartPage;
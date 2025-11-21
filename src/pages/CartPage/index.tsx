import React, { useState, useEffect } from "react";
import CartHeader from "./CartHeader";
import SellerSection from "./SellerSection";
import CartFooter from "./CartFooter";
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

interface CartPageProps {
  onBack?: () => void;
  onCheckout?: (items: Seller[]) => void;
}

// ========== 購物車主組件 ==========
const CartPage: React.FC<CartPageProps> = ({ onBack, onCheckout }) => {
  const [cartData, setCartData] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();

      // 為每個 item 加上 selected 屬性
      const cartWithSelection = data.sellers.map((seller: Seller) => ({
        ...seller,
        items: seller.items.map((item: CartItem) => ({
          ...item,
          selected: false
        }))
      }));

      setCartData(cartWithSelection);
    } catch (error) {
      console.error("載入購物車失敗:", error);
      alert("載入購物車失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItemSelect = (sellerId: string, itemId: string) => {
    setCartData(cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.map(item =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
          )
        };
      }
      return seller;
    }));
  };

  const handleToggleSellerSelect = (sellerId: string) => {
    setCartData(cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        const allSelected = seller.items.every(item => item.selected);
        return {
          ...seller,
          items: seller.items.map(item => ({ ...item, selected: !allSelected }))
        };
      }
      return seller;
    }));
  };

  const handleToggleSelectAll = () => {
    const allSelected = cartData.every(seller =>
      seller.items.every(item => item.selected)
    );
    setCartData(cartData.map(seller => ({
      ...seller,
      items: seller.items.map(item => ({ ...item, selected: !allSelected }))
    })));
  };

  const handleUpdateQuantity = async (sellerId: string, itemId: string, delta: number) => {
    const updatedCart = cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.map(item => {
            if (item.id === itemId) {
              const newQty = item.quantity + delta;
              if (newQty >= 1 && newQty <= item.product.ProductStock) {
                return { ...item, quantity: newQty };
              }
            }
            return item;
          })
        };
      }
      return seller;
    });
    setCartData(updatedCart);

    try {
      const cartItem = updatedCart
        .find(s => s.sellerId === sellerId)?.items
        .find(i => i.id === itemId);

      if (cartItem) {
        const productId = cartItem.product.productID;
        const newQty = cartItem.quantity;

        await fetch(`/api/cart/items/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty })
        });

        console.log(`已更新商品 ${productId} 數量為 ${newQty}`);
      }
    } catch (error) {
      console.error("更新數量失敗:", error);
      fetchCartData();
    }
  };

  const handleDeleteItem = async (sellerId: string, itemId: string) => {
    if (!confirm("確定要刪除此商品？")) return;

    const cartItem = cartData
      .find(s => s.sellerId === sellerId)?.items
      .find(i => i.id === itemId);

    if (!cartItem) return;

    const productId = cartItem.product.productID;

    setCartData(cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.filter(item => item.id !== itemId)
        };
      }
      return seller;
    }));

    try {
      await fetch(`/api/cart/items/${productId}`, {
        method: 'DELETE'
      });

      console.log(`已刪除商品 ${productId}`);
    } catch (error) {
      console.error("刪除失敗:", error);
      fetchCartData();
    }
  };

  const { totalPrice, selectedCount } = cartData.reduce((acc, seller) => {
    seller.items.forEach(item => {
      if (item.selected) {
        acc.totalPrice += item.product.ProductPrice * item.quantity;
        acc.selectedCount += item.quantity;
      }
    });
    return acc;
  }, { totalPrice: 0, selectedCount: 0 });

  const allSelected = cartData.length > 0 && cartData.every(seller =>
    seller.items.every(item => item.selected)
  );

  const handleCheckout = async () => {
    const selectedItems = cartData.flatMap(seller =>
      seller.items.filter(item => item.selected)
    );

    if (selectedItems.length === 0) {
      alert("請選擇要結帳的商品");
      return;
    }

    try {
      const response = await fetch('/api/order/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedItems.map(item => ({
            productId: item.product.productID,
            quantity: item.quantity
          }))
        })
      });

      const order = await response.json();

      const checkoutData = cartData
        .map(seller => ({
          sellerId: seller.sellerId,
          sellerName: seller.sellerName,
          items: seller.items.filter(item => item.selected)
        }))
        .filter(seller => seller.items.length > 0);

      console.log("準備結帳的商品:", checkoutData);

      if (onCheckout) {
        onCheckout(checkoutData);
      }
    } catch (error) {
      console.error("結帳失敗:", error);
      alert("結帳失敗，請重試");
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-text">載入中...</div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <CartHeader onBack={onBack} />

      <div className="cart-content">
        {cartData.length === 0 ? (
          <div className="empty-cart">購物車是空的</div>
        ) : (
          cartData.map((seller) => (
            <SellerSection
              key={seller.sellerId}
              seller={seller}
              onToggleSellerSelect={handleToggleSellerSelect}
              onToggleItemSelect={handleToggleItemSelect}
              onUpdateQuantity={handleUpdateQuantity}
              onDeleteItem={handleDeleteItem}
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
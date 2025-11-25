import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartHeader from "./CartHeader";
import SellerSection from "./SellerSection";
import CartFooter from "./CartFooter";
import "./index.css";
import {
  useGetCart,
  useUpdateQuantity,
  useRemoveFromCart,
} from "../../api/generated";

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

const CartPage: React.FC<CartPageProps> = ({ onBack, onCheckout }) => {
  const [cartData, setCartData] = useState<Seller[]>([]);
  const navigate = useNavigate();

  // 使用 generated hooks
  const { data: cartResponse, isLoading, isError, error, refetch } = useGetCart();
  const updateQuantityMutation = useUpdateQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  useEffect(() => {
    if (cartResponse?.data) {
      const data = cartResponse.data;
      console.log("API 回應:", data);

      if (data.items && Array.isArray(data.items)) {
        // 按賣家 ID 分組
        const sellerMap = new Map<string, any[]>();

        data.items.forEach((item: any) => {
          const sellerId = item.sellerId;
          if (!sellerMap.has(sellerId)) {
            sellerMap.set(sellerId, []);
          }
          sellerMap.get(sellerId)!.push(item);
        });

        // 轉換成 Seller[] 格式
        const cartWithSelection: Seller[] = Array.from(sellerMap.entries()).map(([sellerId, items]) => ({
          sellerId: sellerId,
          sellerName: items[0].sellerName,
          items: items.map((item) => ({
            id: item.itemId,
            product: {
              productID: item.productId,
              productName: item.productName,
              ProductPrice: item.price,
              ProductImage: item.imageUrl,
              ProductStock: item.ProductStock
            },
            quantity: item.quantity,
            selected: false
          }))
        }));

        setCartData(cartWithSelection);
      } else {
        setCartData([]);
      }
    }
  }, [cartResponse]);

  useEffect(() => {
    if (isError) {
      console.error("載入購物車失敗:", error);
      alert("載入購物車失敗,請重試");
    }
  }, [isError, error]);

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
    // 先樂觀更新 UI
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
        // 使用 generated mutation
        await updateQuantityMutation.mutateAsync({
          itemId: itemId,
          data: { quantity: cartItem.quantity }
        });

        console.log(`已更新商品 ${itemId} 數量為 ${cartItem.quantity}`);
      }
    } catch (error) {
      console.error("更新數量失敗:", error);
      alert("更新數量失敗,請重試");
      refetch();
    }
  };

  const handleDeleteItem = async (sellerId: string, itemId: string) => {
    if (!confirm("確定要刪除此商品?")) return;

    // 先樂觀更新 UI
    const newCartData = cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.filter(item => item.id !== itemId)
        };
      }
      return seller;
    }).filter(seller => seller.items.length > 0);

    setCartData(newCartData);

    try {
      // 使用 generated mutation
      await removeFromCartMutation.mutateAsync({ itemId });
      console.log(`已刪除商品 ${itemId}`);
    } catch (error) {
      console.error("刪除失敗:", error);
      alert("刪除失敗,請重試");
      refetch();
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

    // 準備跳轉到結帳頁面的資料
    const checkoutData = cartData
      .map(seller => ({
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        items: seller.items
          .filter(item => item.selected)
          .map(item => ({
            id: item.id,  // 購物車項目 ID (用於後續刪除)
            productId: item.product.productID,  // 商品 ID
            name: item.product.productName,
            price: item.product.ProductPrice,
            quantity: item.quantity,
            stock: item.product.ProductStock  // 📦 傳遞庫存資訊
          }))
      }))
      .filter(seller => seller.items.length > 0);

    console.log("準備結帳的商品:", checkoutData);

    // 如果有 onCheckout 回調就呼叫
    if (onCheckout) {
      onCheckout(cartData
        .map(seller => ({
          sellerId: seller.sellerId,
          sellerName: seller.sellerName,
          items: seller.items.filter(item => item.selected)
        }))
        .filter(seller => seller.items.length > 0));
    }

    // 跳轉到結帳頁面,並將商品資料透過 state 傳遞
    navigate('/checkout', {
      state: { orderItems: checkoutData }
    });
  };

  if (isLoading) {
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
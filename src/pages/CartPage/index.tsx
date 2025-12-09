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

// 1. 定義符合 API 真實回傳的介面 (不包含 ProductStock)
interface CartItemAPIResponse {
  itemId: string;
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  subtotal: number;
}

// 本地使用的商品介面 (UI 仍需要 ProductStock 來判斷是否 disable 按鈕)
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

  const { data: cartResponse, isLoading, isError, error, refetch } = useGetCart();
  const updateQuantityMutation = useUpdateQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  useEffect(() => {
    if (cartResponse?.data) {
      // 這裡使用型別斷言將資料轉為我們定義的 API 結構
      // 注意：這假設 generated hook 的回傳型別較寬鬆，我們將其限縮為已知結構
      const data = cartResponse.data as unknown as { items: CartItemAPIResponse[] };
      console.log("API 回應:", data);

      if (data.items && Array.isArray(data.items)) {
        const sellerMap = new Map<string, CartItemAPIResponse[]>();

        // 2. 直接使用正確的型別遍歷，不使用 any
        data.items.forEach((item) => {
          const sellerId = item.sellerId;
          if (!sellerMap.has(sellerId)) {
            sellerMap.set(sellerId, []);
          }
          sellerMap.get(sellerId)!.push(item);
        });

        // 3. 轉換資料結構
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
              // 4. 因為 API 沒給 ProductStock，我們不讀取它，直接給預設值
              // 這樣就不需要用 any 去讀取不存在的欄位
              ProductStock: 99
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

    const checkoutData = cartData
      .map(seller => ({
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        items: seller.items
          .filter(item => item.selected)
          .map(item => ({
            id: item.id,
            productId: item.product.productID,
            name: item.product.productName,
            price: item.product.ProductPrice,
            quantity: item.quantity,
            stock: item.product.ProductStock
          }))
      }))
      .filter(seller => seller.items.length > 0);

    console.log("準備結帳的商品:", checkoutData);

    if (onCheckout) {
      onCheckout(cartData
        .map(seller => ({
          sellerId: seller.sellerId,
          sellerName: seller.sellerName,
          items: seller.items.filter(item => item.selected)
        }))
        .filter(seller => seller.items.length > 0));
    }

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
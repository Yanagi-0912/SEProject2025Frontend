import React, { useState, useEffect } from "react";
import CartHeader from "./CartHeader";
import SellerSection from "./SellerSection";
import CartFooter from "./CartFooter";

interface CartPageProps {
  onBack?: () => void;
  onCheckout?: (items: any[]) => void;
}

const CartPage: React.FC<CartPageProps> = ({ onBack, onCheckout }) => {
  // ========== 前端狀態管理 ==========
  const [cartData, setCartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ========== 從後端取得資料 ==========
  useEffect(() => {
    fetchCartData();
  }, []);

  // 📡 呼叫後端 API - 取得購物車資料
  const fetchCartData = async () => {
    try {
      setLoading(true);
      // TODO: 替換成真實的 API 端點
      // const response = await fetch('/api/cart');
      // const data = await response.json();
      // setCartData(data);
      
      // 暫時使用模擬資料
      setCartData([
        {
          sellerId: "seller_a",
          sellerName: "a 賣家",
          items: [
            { id: "1", name: "襪子", price: 100, quantity: 1, selected: false, stock: 50 },
            { id: "2", name: "鞋子", price: 500, quantity: 2, selected: false, stock: 20 },
          ]
        },
        {
          sellerId: "seller_b",
          sellerName: "b 賣家",
          items: [
            { id: "3", name: "褲子", price: 800, quantity: 1, selected: false, stock: 15 },
            { id: "4", name: "手機", price: 15000, quantity: 1, selected: false, stock: 5 },
          ]
        }
      ]);
    } catch (error) {
      console.error("載入購物車失敗:", error);
      alert("載入購物車失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  // ========== 前端邏輯 - 選取功能（不需要後端）==========
  
  // ✅ 前端處理 - 切換單一商品選取
  const handleToggleItemSelect = (sellerId: string, itemId: string) => {
    setCartData(cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.map((item: any) =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
          )
        };
      }
      return seller;
    }));
    // 注意：選取狀態不需要存到後端資料庫
  };

  // ✅ 前端處理 - 切換賣家全選
  const handleToggleSellerSelect = (sellerId: string) => {
    setCartData(cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        const allSelected = seller.items.every((item: any) => item.selected);
        return {
          ...seller,
          items: seller.items.map((item: any) => ({ ...item, selected: !allSelected }))
        };
      }
      return seller;
    }));
  };

  // ✅ 前端處理 - 全選功能
  const handleToggleSelectAll = () => {
    const allSelected = cartData.every(seller =>
      seller.items.every((item: any) => item.selected)
    );
    setCartData(cartData.map(seller => ({
      ...seller,
      items: seller.items.map((item: any) => ({ ...item, selected: !allSelected }))
    })));
  };

  // ========== 前端+後端 - 更新數量（需要同步到後端）==========
  
  // ✅ 前端處理 UI + 📡 呼叫後端 API 保存
  const handleUpdateQuantity = async (sellerId: string, itemId: string, delta: number) => {
    // 1. 先更新前端 UI（即時反應）
    const updatedCart = cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.map((item: any) => {
            if (item.id === itemId) {
              const newQty = item.quantity + delta;
              if (newQty >= 1 && newQty <= item.stock) {
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

    // 2. 然後呼叫後端 API 保存到資料庫
    try {
      // TODO: 替換成真實的 API 端點
      // const newQty = updatedCart
      //   .find(s => s.sellerId === sellerId)?.items
      //   .find(i => i.id === itemId)?.quantity;
      
      // await fetch(`/api/cart/items/${itemId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ quantity: newQty })
      // });
      
      console.log(`已更新商品 ${itemId} 數量（待整合 API）`);
    } catch (error) {
      console.error("更新數量失敗:", error);
      // 如果後端更新失敗，可以回復前端狀態
      fetchCartData();
    }
  };

  // ========== 前端+後端 - 刪除商品（需要同步到後端）==========
  
  const handleDeleteItem = async (sellerId: string, itemId: string) => {
    if (!confirm("確定要刪除此商品？")) return;

    // 1. 先更新前端 UI
    setCartData(cartData.map(seller => {
      if (seller.sellerId === sellerId) {
        return {
          ...seller,
          items: seller.items.filter((item: any) => item.id !== itemId)
        };
      }
      return seller;
    }));

    // 2. 呼叫後端 API 刪除
    try {
      // TODO: 替換成真實的 API 端點
      // await fetch(`/api/cart/items/${itemId}`, {
      //   method: 'DELETE'
      // });
      
      console.log(`已刪除商品 ${itemId}（待整合 API）`);
    } catch (error) {
      console.error("刪除失敗:", error);
      fetchCartData();
    }
  };

  // ========== 前端計算 - 總價和數量（不需要後端）==========
  
  // ✅ 前端即時計算
  const { totalPrice, selectedCount } = cartData.reduce((acc, seller) => {
    seller.items.forEach((item: any) => {
      if (item.selected) {
        acc.totalPrice += item.price * item.quantity;
        acc.selectedCount += item.quantity;
      }
    });
    return acc;
  }, { totalPrice: 0, selectedCount: 0 });

  const allSelected = cartData.length > 0 && cartData.every(seller =>
    seller.items.every((item: any) => item.selected)
  );

  // ========== 前端+後端 - 結帳（需要後端處理）==========
  
  const handleCheckout = () => {
    // 1. 前端收集選中的商品
    console.log("onCheckout 是否存在:", onCheckout);
    const selectedItems = cartData.flatMap(seller =>
      seller.items.filter((item: any) => item.selected)
    );

    if (selectedItems.length === 0) {
      alert("請選擇要結帳的商品");
      return;
    }

    // 2. 呼叫後端 API 建立訂單
    //try
      // TODO: 替換成真實的 API 端點
      // const response = await fetch('/api/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     items: selectedItems.map(item => ({
      //       productId: item.id,
      //       quantity: item.quantity
      //     }))
      //   })
      // });
      // const order = await response.json();
      const checkoutData = cartData
            .map(seller => ({
                id: seller.sellerId,
                name: seller.sellerName,
                items: seller.items.filter((item: any) => item.selected)
            }))
            .filter(seller => seller.items.length > 0);
      
      console.log("準備結帳的商品:", selectedItems);
      
      // 3. 前端跳轉到結帳頁面
      if (onCheckout) {
        onCheckout(checkoutData);
      } else {
        alert(`準備結帳 ${selectedCount} 件商品，總金額 $${totalPrice}\n（待整合 API）`);
      }
    //catch (error) {
      //console.error("結帳失敗:", error);
      //alert("結帳失敗，請重試");
    //}
  };

  // ========== 渲染 UI ==========
  
  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        minHeight: "100vh", 
        backgroundColor: "#1a1a1a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ color: "white", fontSize: "18px" }}>載入中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#1a1a1a" }}>
      <CartHeader onBack={onBack} />

      <div style={{ backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "20px" }}>
        {cartData.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "60px 20px", 
            color: "#888",
            fontSize: "18px" 
          }}>
            購物車是空的
          </div>
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

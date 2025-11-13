//用來管理CART和CHECKOUT的狀態，用來切換兩者，並傳遞必要的參數，可以寫在main裡面，但這樣會讓main變的臃腫，所以寫在外面
import React, { useState } from "react";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

interface ShoppingProps {
  onBackToMain?: () => void;
}

const Shopping: React.FC<ShoppingProps> = ({ onBackToMain }) => {
  const [currentPage, setCurrentPage] = useState<"cart" | "checkout">("cart");
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

  if (currentPage === "checkout") {
    return (
      <CheckoutPage
        orderItems={checkoutItems}
        onBack={() => setCurrentPage("cart")}
      />
    );
  }

  return (
    <CartPage
      onBack={onBackToMain}
      onCheckout={(items) => {
        setCheckoutItems(items);
        setCurrentPage("checkout");
      }}
    />
  );
};

export default Shopping;
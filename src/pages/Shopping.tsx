import React, { useState } from "react";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

interface ShoppingProps {
  onBackToMain?: () => void;
}

const Shopping: React.FC<ShoppingProps> = ({ onBackToMain }) => {
  const [currentPage, setCurrentPage] = useState<"cart" | "checkout">("cart");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

  if (currentPage === "checkout") {
    return (
      <CheckoutPage
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
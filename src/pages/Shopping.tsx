import React, { useState } from "react";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";

interface ShoppingProps {
  onBackToMain?: () => void;
}

const Shopping: React.FC<ShoppingProps> = ({ onBackToMain }) => {
  const [currentPage, setCurrentPage] = useState<"cart" | "checkout">("cart");

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
      onCheckout={() => {
        setCurrentPage("checkout");
      }}
    />
  );
};

export default Shopping;
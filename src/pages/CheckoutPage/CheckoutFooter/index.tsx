// CheckoutFooter/index.tsx
import React from "react";
import "./index.css";

interface CheckoutFooterProps {
  totalAmount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
  totalAmount,
  onSubmit,
  isSubmitting
}) => {
  return (
    <div className="checkout-footer">
      <div className="checkout-footer-amount">
        總共為：
        <strong className="checkout-footer-amount-value">
          ${totalAmount}
        </strong> 元
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="checkout-footer-button"
      >
        {isSubmitting ? "處理中..." : "結帳"}
      </button>
    </div>
  );
};

export default CheckoutFooter;
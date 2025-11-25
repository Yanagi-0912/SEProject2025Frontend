// ShippingForm/index.tsx
import React from "react";
import "./index.css";

interface ShippingAddress {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface ShippingFormProps {
  address: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ address, onChange }) => {
  const handleChange = (field: keyof ShippingAddress, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="shipping-form-container">
      <h3 className="shipping-form-title">收貨地址</h3>
      <div className="shipping-form-fields">
        <input
          type="text"
          placeholder="收件人姓名"
          value={address.recipientName}
          onChange={(e) => handleChange("recipientName", e.target.value)}
          className="shipping-form-input"
        />
        <input
          type="tel"
          placeholder="聯絡電話"
          value={address.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="shipping-form-input"
        />
        <div className="shipping-form-row">
          <input
            type="text"
            placeholder="城市/縣市"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="shipping-form-input"
          />
          <input
            type="text"
            placeholder="郵遞區號"
            value={address.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className="shipping-form-input"
          />
        </div>
        <textarea
          placeholder="詳細地址"
          value={address.address}
          onChange={(e) => handleChange("address", e.target.value)}
          rows={3}
          className="shipping-form-input shipping-form-textarea"
        />
      </div>
    </div>
  );
};

export default ShippingForm;
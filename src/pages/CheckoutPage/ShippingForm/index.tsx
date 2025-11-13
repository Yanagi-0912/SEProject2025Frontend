// 功能：收貨地址表單
// 前端負責：表單驗證、收集資料
// 後端負責：儲存地址資訊（在訂單中）

import React from "react";

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

  const inputStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#333",
    border: "1px solid #555",
    borderRadius: "5px",
    color: "white",
    fontSize: "14px"
  };

  return (
    <div style={{
      backgroundColor: "#2a2a2a",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "20px"
    }}>
      <h3 style={{ color: "white", marginBottom: "15px" }}>1. 收貨地址</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="收件人姓名"
          value={address.recipientName}
          onChange={(e) => handleChange("recipientName", e.target.value)}
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="聯絡電話"
          value={address.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
          <input
            type="text"
            placeholder="城市/縣市"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="郵遞區號"
            value={address.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            style={inputStyle}
          />
        </div>
        <textarea
          placeholder="詳細地址"
          value={address.address}
          onChange={(e) => handleChange("address", e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>
    </div>
  );
};

export default ShippingForm;
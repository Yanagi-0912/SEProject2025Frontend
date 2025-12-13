import React from 'react';

interface ControlPanelProps {
  onCouponsClick?: () => void;
  onChangePasswordClick?: () => void;
  onSellerDashboardClick?: () => void;
  onHistoryClick?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onCouponsClick,
  onChangePasswordClick,
  onSellerDashboardClick,
  onHistoryClick
}) => {
  return (
    <div>
      <h2>功能選單</h2>
      <div>
        <button onClick={onCouponsClick}>
            <h3>優惠券</h3>
        </button>

        <button onClick={onChangePasswordClick}>
            <h3>修改密碼</h3>
        </button>

        <button onClick={onSellerDashboardClick}>
            <h3>賣家後台</h3>
        </button>

        <button onClick={onHistoryClick}>
            <h3>歷史紀錄</h3>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;

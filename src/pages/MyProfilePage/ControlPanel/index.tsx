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
    <div className="control-panel">
      <h2 className="control-panel-title">功能選單</h2>
      <div className="control-panel-grid">
        <button 
          className="control-panel-button coupons"
          onClick={onCouponsClick}
        >
          <div className="button-icon">🎟️</div>
          <div className="button-text">
            <h3>優惠券</h3>
            <p>查看我的優惠券</p>
          </div>
        </button>

        <button 
          className="control-panel-button password"
          onClick={onChangePasswordClick}
        >
          <div className="button-icon">🔐</div>
          <div className="button-text">
            <h3>修改密碼</h3>
            <p>更改登入密碼</p>
          </div>
        </button>

        <button 
          className="control-panel-button seller"
          onClick={onSellerDashboardClick}
        >
          <div className="button-icon">🏪</div>
          <div className="button-text">
            <h3>賣家後台</h3>
            <p>管理我的商品</p>
          </div>
        </button>

        <button 
          className="control-panel-button history"
          onClick={onHistoryClick}
        >
          <div className="button-icon">📜</div>
          <div className="button-text">
            <h3>歷史紀錄</h3>
            <p>查看交易記錄</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;

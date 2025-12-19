import React from 'react';
import './ControlPanel.css';

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
        <button className="control-panel-btn" onClick={onCouponsClick}>
          優惠券
        </button>

        <button className="control-panel-btn" onClick={onChangePasswordClick}>
          修改密碼
        </button>

        <button className="control-panel-btn" onClick={onSellerDashboardClick}>
          賣家後台
        </button>

        <button className="control-panel-btn" onClick={onHistoryClick}>
          歷史紀錄
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;

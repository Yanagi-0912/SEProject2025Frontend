// OrderSuccessPage/index.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

interface OrderItem {
  productID: string;
  quantity: number;
  sellerID: string;
  price: number;
  totalPrice: number;
  productName?: string;
}

interface OrderSuccessData {
  orderID: string;
  totalAmount: number;
  orderItems: OrderItem[];
  orderTime: string;
  orderStatus: string;
  buyOneGetOneItemId?: string;  // 買一送一的商品 ID
}

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const orderData = location.state?.orderData as OrderSuccessData | undefined;

  if (!orderData) {
    return (
      <div className="order-success-container">
        <div className="order-success-error">
          <h2>找不到訂單資訊</h2>
          <button onClick={() => navigate('/')}>返回首頁</button>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待處理',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消',
      'REFUNDED': '已退款'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        {/* 成功圖示 */}
        <div className="order-success-icon">
          <div className="success-checkmark">✓</div>
        </div>

        {/* 標題 */}
        <h1 className="order-success-title">訂單建立成功！</h1>
        <p className="order-success-subtitle">感謝您的購買</p>

        {/* 訂單資訊 */}
        <div className="order-info-section">
          <div className="order-info-row">
            <span className="order-info-label">訂單編號：</span>
            <span className="order-info-value">{orderData.orderID}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">訂單時間：</span>
            <span className="order-info-value">{formatDateTime(orderData.orderTime)}</span>
          </div>
          <div className="order-info-row">
            <span className="order-info-label">訂單狀態：</span>
            <span className="order-info-value order-status">
              {getStatusText(orderData.orderStatus)}
            </span>
          </div>
        </div>

        {/* 商品明細 */}
        <div className="order-items-section">
          <h3 className="section-title">商品明細</h3>
          <div className="order-items-list">
            {orderData.orderItems.map((item, index) => {
              const isBuyOneGetOne = item.productID === orderData.buyOneGetOneItemId;
              return (
                <div key={index} className="order-item">
                  <div className="order-item-info">
                    <span className="order-item-name">
                      {item.productName || `商品 ${item.productID}`}
                      {isBuyOneGetOne && <span className="order-b1g1-tag">送一</span>}
                    </span>
                    <span className="order-item-quantity">
                      x {item.quantity}
                      {isBuyOneGetOne && <span className="order-b1g1-bonus"> (+1)</span>}
                    </span>
                  </div>
                  <span className="order-item-price">${item.totalPrice}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 總金額 */}
        <div className="order-total-section">
          <div className="order-total-row">
            <span className="order-total-label">總金額</span>
            <span className="order-total-amount">${orderData.totalAmount}</span>
          </div>
        </div>

        {/* 提示訊息 */}
        <div className="order-notice">
          <p>📌 請記住您的訂單編號以便查詢</p>
          <p>📌 請聯繫賣家確認付款方式與交易細節</p>
        </div>

        {/* 操作按鈕 */}
        <div className="order-actions">
          <button
            onClick={() => navigate('/orders')}
            className="btn-view-orders"
          >
            查看我的訂單
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-back-home"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
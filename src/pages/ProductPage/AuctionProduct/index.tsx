import './AuctionProduct.css';
import { useState, useEffect } from 'react';
//import { placeBid } from '../../../api/generated';

interface AuctionProps {
    productName?: string;
    productDescription?: string;
    productPrice?: number;
    productImage?: string;
    productStock?: number;
  productID?: string;
    productStatus?: ProductStatuses | string;
    averageRating?: number;
    auctionEndTime?: string;
    nowHighestBid?: number;
    highestBidderID?: string;
    onBack?: () => void;
}

type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';

function AuctionProduct(props: AuctionProps) {
    const [countdown, setCountdown] = useState<string>('');

    useEffect(() => {
        const calculateCountdown = () => {
            if (!props.auctionEndTime) {
                setCountdown('未設定');
                return;
            }

            const endTime = new Date(props.auctionEndTime).getTime();
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setCountdown('已結束');
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const totalMinutes = Math.floor(totalSeconds / 60);
            const totalHours = Math.floor(totalMinutes / 60);
            const totalDays = Math.floor(totalHours / 24);

            // 計算總年數（大約）
            const totalYears = Math.floor(totalDays / 365);
            
            if (totalYears > 0) {
                setCountdown(`${totalYears}年以上`);
                return;
            }

            const days = totalDays;
            const hours = totalHours % 24;
            const minutes = totalMinutes % 60;
            const seconds = totalSeconds % 60;

            setCountdown(
                `${String(days).padStart(2, '0')}天${String(hours).padStart(2, '0')}時${String(minutes).padStart(2, '0')}分${String(seconds).padStart(2, '0')}秒`
            );
        };

        calculateCountdown();
        const timer = setInterval(calculateCountdown, 1000);

        return () => clearInterval(timer);
    }, [props.auctionEndTime]);

    return (
      <div className="auction-card">
        <div className="auction-image-container">
          <img src={props.productImage} alt={props.productName} />
          <div className={`status-badge ${props.productStatus?.toLowerCase()}`}>
            {props.productStatus === 'ACTIVE' ? '競標中' : props.productStatus === 'INACTIVE' ? '已下架' : props.productStatus === 'SOLD' ? '已售出' : '已禁用'}
          </div>
        </div>

        <div className="auction-content">
          <div className="auction-header">
            <h2 className="auction-title">{props.productName}</h2>
            <div className="auction-rating">
              ⭐ {props.averageRating?.toFixed(1) ?? 'N/A'}
            </div>
          </div>

          <div className="countdown-section">
            <div className="countdown-label">剩餘時間</div>
            <div className={`countdown-display ${countdown === '已結束' ? 'ended' : ''}`}>
              {countdown}
            </div>
            <div className="countdown-units">
              {!countdown.includes('年以上') && !countdown.includes('已結束') && !countdown.includes('未設定')}
            </div>
          </div>

          <div className="price-section">
            <div className="price-item">
              <span className="price-label">直購價格</span>
              <span className="price-value">${props.productPrice?.toLocaleString()}</span>
            </div>
            <div className="price-item highlight">
              <span className="price-label">目前最高出價</span>
              <span className="price-value current-bid">${props.nowHighestBid?.toLocaleString()}</span>
            </div>
          </div>

          {props.productStatus === 'ACTIVE' ? (
            <div className="bid-section">
              <input 
                type="number" 
                placeholder="輸入出價金額" 
                className="bid-input"
                min={props.nowHighestBid ? props.nowHighestBid + 1 : 0}
              />
              <button className="bid-button">
                <span>🔨</span> 立即出價
              </button>
            </div>
          ) : (
            <div className="warning-message">
              ⚠️ 此商品目前無法競標
            </div>
          )}
        </div>
      </div>
    );
}

export default AuctionProduct;
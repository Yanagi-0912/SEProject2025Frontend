import './AuctionProduct.css';
import { useState, useEffect, useRef } from 'react';
import { placeBid, terminateAuction, useGetCurrentUser } from '../../../api/generated';

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
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentBid, setCurrentBid] = useState<number | undefined>(props.nowHighestBid);
  const [terminated, setTerminated] = useState<boolean>(false);
  const terminatedRef = useRef<boolean>(false);

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

                // 如果還沒呼叫過 terminate，則呼叫一次
                if (!terminatedRef.current && props.productID) {
                  terminatedRef.current = true;
                  setTerminated(true);
                  const pid = props.productID;
                  (async () => {
                    try {
                      await terminateAuction(pid);
                      setMessage('競標已結束，伺服器已處理終止。');
                    } catch (err) {
                      console.error('terminateAuction error', err);
                      setMessage('競標已結束，但終止 API 發生錯誤');
                    }
                  })();
                }

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
    }, [props.auctionEndTime, props.productID]);

    // keep local currentBid in sync with prop changes
    useEffect(() => {
      setCurrentBid(props.nowHighestBid);
    }, [props.nowHighestBid]);

    // 取得目前使用者（若已登入）
    const { data: currentUserResp } = useGetCurrentUser();
    const currentUserId = currentUserResp?.data?.id;

    const handlePlaceBid = async () => {
      setMessage(null);
      if (props.productID == null) {
        setMessage('商品ID缺失，無法出價');
        return;
      }

      const price = Number(bidAmount);
      if (!bidAmount || isNaN(price) || price <= 0) {
        setMessage('請輸入有效的出價金額');
        return;
      }

      const base = currentBid ?? props.nowHighestBid ?? 0;
      if (price <= base) {
        setMessage('出價需高於目前最高價');
        return;
      }

      // 先使用從 hook 取得的 user id，若沒有則退回到 localStorage 的 username 或 userId
      const bidderId = currentUserId || localStorage.getItem('userId') || localStorage.getItem('username') || '';
      if (!bidderId) {
        setMessage('請先登入以出價');
        return;
      }

      setLoading(true);
      try {
        await placeBid(props.productID, { price, bidderId });
        setMessage('出價成功');
        setCurrentBid(price);
        setBidAmount('');
      } catch (err) {
        console.error('placeBid error', err);
        setMessage('出價失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="auction-card">
        <div className="auction-image-container">
          {props.productImage ? (
            <img src={props.productImage} alt={props.productName} />
          ) : (
            <div className="image-placeholder" aria-hidden>沒有圖片</div>
          )}
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
              <span className="price-value current-bid">${currentBid !== undefined ? currentBid.toLocaleString() : (props.nowHighestBid ? props.nowHighestBid.toLocaleString() : '0')}</span>
            </div>
          </div>

          {props.productStatus === 'ACTIVE' && !terminated ? (
            <div className="bid-section">
              <input
                type="number"
                placeholder="輸入出價金額"
                className="bid-input"
                min={(currentBid ?? 0) + 1}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                disabled={loading || terminated}
              />
              <button className="bid-button" onClick={handlePlaceBid} disabled={loading || terminated}>
                {loading ? '出價中...' : (<><span>🔨</span> 立即出價</>)}
              </button>
              {message && <div className="bid-message">{message}</div>}
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

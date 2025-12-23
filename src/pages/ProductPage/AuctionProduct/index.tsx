import './AuctionProduct.css';
import { useState, useEffect, useRef } from 'react';
import { placeBid, terminateAuction, useGetCurrentUser, useIsFavorited, useAddToFavorites, useRemoveFromFavorites, useCreateBidHistory, getGetBidHistoriesByUserIdQueryKey } from '../../../api/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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
  const navigator = useRef(useNavigate()).current;
  const [countdown, setCountdown] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentBid, setCurrentBid] = useState<number | undefined>(props.nowHighestBid);
  const [terminated, setTerminated] = useState<boolean>(false);
  const terminatedRef = useRef<boolean>(false);
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const createBidHistoryMutation = useCreateBidHistory();
  const queryClient = useQueryClient();

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

    // 檢查是否已收藏
    const { data: isFavoritedResp, refetch: refetchFavorited } = useIsFavorited(
        currentUserId || '',
        props.productID || '',
        { query: { enabled: !!currentUserId && !!props.productID } }
    );
    const isFavorite = isFavoritedResp?.data === true;

    const handleToggleFavorite = async () => {
        const userId = currentUserId || localStorage.getItem('userId') || localStorage.getItem('username') || '';
        if (!userId) {
            alert('請先登入');
            navigator('/login');
            return;
        }

        if (!props.productID) {
            alert('商品ID無效');
            return;
        }

        try {
            if (isFavorite) {
                await removeFromFavoritesMutation.mutateAsync({
                    userId,
                    productId: props.productID
                });
            } else {
                await addToFavoritesMutation.mutateAsync({
                    userId,
                    productId: props.productID
                });
            }
            refetchFavorited();
        } catch (error) {
            console.error('收藏操作失敗:', error);
            alert('收藏操作失敗，請稍後再試');
        }
    };

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

      const top = props.productPrice ?? Infinity;
      if (price > top) {
        setMessage(`出價不可高於直購價格 $${top.toLocaleString()}`);
        return;
      }

      // 先使用從 hook 取得的 user id，若沒有則退回到 localStorage 的 username 或 userId
      const bidderId = currentUserId || localStorage.getItem('userId') || localStorage.getItem('username') || '';
      if (!bidderId) {
        setMessage('請先登入以出價');
        alert('請先登入以出價');
        navigator('/login');
        return;
      }

      setLoading(true);
      try {
        await placeBid(props.productID, { price, bidderId });
        setCurrentBid(price);
        setBidAmount('');
        
        // 建立競標歷史記錄（包含出價金額）
        try {
          await createBidHistoryMutation.mutateAsync({
            data: {
              productID: props.productID,
              bidAmount: price
            }
          });
          console.info('createBidHistory success', { productID: props.productID, bidAmount: price });
          if (currentUserId) {
            queryClient.invalidateQueries({ queryKey: getGetBidHistoriesByUserIdQueryKey(currentUserId) });
          }
        } catch (historyErr) {
          console.error('創建競標歷史失敗:', historyErr);
          // 不影響出價成功的提示
        }

        // 若出價等於直購價，視為直接得標並結束競標
        if (top !== Infinity && price === top && props.productID) {
          try {
            await terminateAuction(props.productID);
            terminatedRef.current = true;
            setTerminated(true);
            setMessage('出價等於直購價，您已直接得標，競標已結束！');
          } catch (endErr) {
            console.error('terminateAuction (direct win) error', endErr);
            setMessage('出價成功並達到直購價，但結束競標時發生錯誤，請稍後確認訂單狀態');
          }
        } else {
          setMessage('出價成功');
        }
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
              <div className="bid-actions">
                <button className="bid-button" onClick={handlePlaceBid} disabled={loading || terminated}>
                  {loading ? '出價中...' : (<><span>🔨</span> 立即出價</>)}
                </button>
                <button 
                  className="favorite-button-auction" 
                  onClick={handleToggleFavorite}
                  disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                >
                  <span>{isFavorite ? '❤️' : '🤍'}</span>
                  {isFavorite ? '移除收藏' : '加入收藏'}
                </button>
              </div>
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

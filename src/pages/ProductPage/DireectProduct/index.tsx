import { useNavigate } from 'react-router-dom'
import './DireectProduct.css';
import { useState, useEffect } from 'react';
import { useAddToCart, useGetCurrentUser, useIsFavorited, useAddToFavorites, useRemoveFromFavorites } from '../../../api/generated';

interface DirectProps {
    productID?: string;
    productName?: string;
    productDescription?: string;
    productPrice?: number;
    productImage?: string;
    productStock?: number;
    productStatus?: ProductStatuses | string;
    averageRating?: number;
    onBack?: () => void;
}
type ProductStatuses = 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'BANNED';


function DirectProduct(props: DirectProps) {
    const navigate = useNavigate()
    const addToCartMutation = useAddToCart();
    const addToFavoritesMutation = useAddToFavorites();
    const removeFromFavoritesMutation = useRemoveFromFavorites();
    
    const [quantity, setQuantity] = useState<number>(() => {
        const stock = props.productStock;
        return (typeof stock === 'number') ? Math.min(1, Math.max(0, stock)) : 1;
    });
    
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

    // 當 props.productStock 改變時調整 quantity（不超過庫存，若庫存為 0 設為 0）
    useEffect(() => {
        const stock = props.productStock;
        if (typeof stock === 'number') {
            setQuantity(prev => {
                if (stock <= 0) return 0;
                return Math.min(prev, stock);
            });
        }
    }, [props.productStock]);

    const handleAddToCart = async (showAlert: boolean = true): Promise<boolean> => {
        if (!props.productID) {
            alert('商品ID無效');
        return false;
        }
        
      // 先使用從 hook 取得的 user id，若沒有則退回到 localStorage 的 username 或 userId
      const userId = currentUserId || localStorage.getItem('userId') || localStorage.getItem('username') || '';
      if (!userId) {
        alert('請先登入');
        navigate('/login');
      return false;
      }

      const stock = props.productStock;
      if (typeof stock === 'number') {
        if (stock <= 0) {
          alert('庫存不足，無法加入購物車');
          return false;
        }
        if (quantity > stock) {
          alert('庫存不足，請調整數量');
          return false;
        }
      }


        try {
            await addToCartMutation.mutateAsync({
                data: {
                    productId: props.productID,
                    quantity: quantity
                }
            });
            if (showAlert) {
                alert('成功加入購物車！');
            }
        return true;
        } catch (error) {
            console.error('加入購物車失敗:', error);
            alert('加入購物車失敗，請稍後再試');
        return false;
        }
    };

    const handleToggleFavorite = async () => {
        const userId = currentUserId || localStorage.getItem('userId') || localStorage.getItem('username') || '';
        if (!userId) {
            alert('請先登入');
            navigate('/login');
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

    return (
      <div className="direct-card">
        <div className="direct-image-container">
          {props.productImage ? (
            <img src={props.productImage} alt={props.productName} />
          ) : (
            <div className="image-placeholder" aria-hidden>沒有圖片</div>
          )}
          <div className={`status-badge ${props.productStatus?.toLowerCase()}`}>
            {props.productStatus === 'ACTIVE' ? '販售中' : props.productStatus === 'INACTIVE' ? '已下架' : props.productStatus === 'SOLD' ? '已售出' : '已禁用'}
          </div>
        </div>

        <div className="direct-content">
          <div className="direct-header">
            <h2 className="direct-title">{props.productName}</h2>
            <div className="direct-rating">
              {props.averageRating?.toFixed(1) ?? 'N/A'}
            </div>
          </div>

          <div className={`stock-section ${(props.productStock ?? 0) <= 10 ? 'low' : ''}`}>
            <div className="stock-label">庫存狀況</div>
            <div className={`stock-display ${(props.productStock ?? 0) <= 10 ? 'low' : ''}`}>
              {props.productStock ?? 0} 件
            </div>
            {(props.productStock ?? 0) <= 10 && (props.productStock ?? 0) > 0 && (
              <div className="stock-warning">庫存不足</div>
            )}
          </div>

          <div className="price-section-direct">
            <div className="price-label">商品價格</div>
            <div className="price-value-large">${props.productPrice?.toLocaleString()}</div>
          </div>

          {props.productStatus === 'ACTIVE' ? (
            <div className="purchase-section">
              <div className="quantity-control">
                <span className="quantity-label">購買數量</span>
                <div className="quantity-selector">
                  <button
                    type="button"
                    className="quantity-btn minus"
                    onClick={(e) => { e.preventDefault(); setQuantity(prev => Math.max(1, prev - 1)); }}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    type="button"
                    className="quantity-btn plus"
                    onClick={(e) => { e.preventDefault(); setQuantity(prev => Math.min((props.productStock ?? Infinity), prev + 1)); }}
                    disabled={typeof props.productStock === 'number' ? quantity >= props.productStock : false}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  type="button" 
                  className="cart-button" 
                  onClick={async (e) => { e.preventDefault(); await handleAddToCart(); }}
                  disabled={
                    quantity <= 0 ||
                    addToCartMutation.isPending ||
                    (typeof props.productStock === 'number' && quantity > (props.productStock ?? 0))
                  }
                >
                  {addToCartMutation.isPending ? '加入中...' : '加入購物車'}
                </button>
                <button
                  type="button"
                  className="buy-button"
                  onClick={async () => {
                    const ok = await handleAddToCart(false);
                    if (ok) navigate('/cart');
                  }}
                  disabled={quantity <= 0}
                >
                  立即購買
                </button>
                <button
                  type="button"
                  className="favorite-button"
                  onClick={handleToggleFavorite}
                  disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                >
                  {isFavorite ? '移除收藏' : '加入收藏'}
                </button>
              </div>
            </div>
          ) : (
            <div className="warning-message">
              此商品目前無法購買
            </div>
          )}
        </div>
      </div>    
    );
}

export default DirectProduct;
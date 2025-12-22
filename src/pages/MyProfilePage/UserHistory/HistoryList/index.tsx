import React, { useState, useEffect } from 'react';
import type { HistoryTab } from '../ControlPanel';
import type { AxiosError, AxiosResponse } from 'axios';
import './index.css';
import {
  useGetOrderByBuyerId,
  useGetReviewHistoriesByUserId,
  useGetPurchaseHistoriesByUserId,
  useGetBidHistoriesByUserId,
  useGetBrowseHistoriesByUserId,
  useGetProductById,
  usePayOrder,
  getGetOrderByBuyerIdQueryKey,
  useCreatePurchaseHistory,
  type GetOrderByBuyerIdQueryResult,
  type GetProductByIdQueryResult,
  type GetPurchaseHistoriesByUserIdQueryResult,
  type GetBidHistoriesByUserIdQueryResult,
  type GetReviewHistoriesByUserIdQueryResult,
  type GetBrowseHistoriesByUserIdQueryResult,
  type Coupon
} from '../../../../api/generated';
import type { Order, PurchaseHistory, BidHistory, ReviewHistory, BrowseHistory, Product } from '../../../../api/generated';
import { useQueryClient } from '@tanstack/react-query';
import { getUserCouponsByUserId, getAllCoupons, type UserCouponItem } from '../../../../api/coupon';

interface Props {
  selected: HistoryTab;
  userId?: string;
}

const HistoryList: React.FC<Props> = ({ selected, userId }) => {
  // Call hooks unconditionally so their call order is stable; hooks should handle an undefined userId internally
  const orderQuery = useGetOrderByBuyerId({ buyerId: userId ?? '' });
  const reviewQuery = useGetReviewHistoriesByUserId(userId ?? '', {
    // Allow 404 to resolve so we can treat it as "no records" without noisy retries
    axios: { validateStatus: (status) => status === 200 || status === 404 },
    query: { retry: false }
  });
  const purchaseQuery = useGetPurchaseHistoriesByUserId(userId ?? '', {
    // Allow 404 to resolve so we can treat it as "no records" without noisy retries
    axios: { validateStatus: (status) => status === 200 || status === 404 },
    query: { retry: false }
  });
  const bidQuery = useGetBidHistoriesByUserId(userId ?? '', {
    // Allow 404 to resolve so we can treat it as "no records" without noisy retries
    axios: { validateStatus: (status) => status === 200 || status === 404 },
    query: { retry: false }
  });
  useEffect(() => {
    if (bidQuery?.data) console.info('bid histories response', bidQuery.data);
    if (bidQuery?.error) console.warn('bid histories error', bidQuery.error);
  }, [bidQuery?.data, bidQuery?.error]);
  const browseQuery = useGetBrowseHistoriesByUserId(userId ?? '', {
    // Allow 404 to resolve so we can treat it as "no records" without noisy retries
    axios: { validateStatus: (status) => status === 200 || status === 404 },
    query: { retry: false }
  });
  useEffect(() => {
    if (browseQuery?.data) console.info('browse histories response', browseQuery.data);
    if (browseQuery?.error) console.warn('browse histories error', browseQuery.error);
  }, [browseQuery?.data, browseQuery?.error]);

  // A compact display shape for rendering — fields are optional because API shapes vary.
  // (display mapping will use the typed API interfaces directly)

  const [expanded, setExpanded] = useState<string | null>(null);
  const [userCoupons, setUserCoupons] = useState<UserCouponItem[]>([]);
  const [couponTemplates, setCouponTemplates] = useState<Map<string, Coupon>>(new Map());

  // 載入使用者優惠券和優惠券模板
  useEffect(() => {
    if (!userId) return;
    
    const loadCoupons = async () => {
      try {
        // 載入優惠券模板
        const templatesRes = await getAllCoupons();
        const templateMap = new Map<string, Coupon>();
        if (Array.isArray(templatesRes)) {
          templatesRes.forEach(t => {
            if (t.couponID) templateMap.set(t.couponID, t);
          });
        }
        setCouponTemplates(templateMap);

        // 載入使用者優惠券
        const userCouponsRes = await getUserCouponsByUserId(userId);
        setUserCoupons(userCouponsRes);
      } catch (error) {
        console.error('載入優惠券失敗:', error);
      }
    };

    loadCoupons();
  }, [userId]);

  const toggleExpand = (id?: string) => {
    if (!id) return;
    setExpanded((prev) => (prev === id ? null : id));
  };

  const orderStatusLabel = (status?: string) => {
    if (!status) return '-';
    if (status === 'PENDING') return '待處理';
    if (status === 'COMPLETED') return '已完成';
    if (status === 'CANCELLED') return '已取消';
    if (status === 'REFUNDED') return '已退款';
    return status;
  };

  const queryClient = useQueryClient();
  const payOrderMutation = usePayOrder();
  const createPurchaseHistoryMutation = useCreatePurchaseHistory();

  const handleConfirmOrder = (orderID: string, order?: Order) => {
    if (!orderID) return;
    payOrderMutation.mutate(
      { orderID, params: {} },
      {
        onSuccess: async () => {
          // Invalidate order query for current user so list refreshes
          try {
            const key = getGetOrderByBuyerIdQueryKey({ buyerId: userId ?? '' });
            queryClient.invalidateQueries({ queryKey: key });
          } catch {
            queryClient.invalidateQueries();
          }

          // 建立購買紀錄
          if (userId && order?.orderID && order.orderItems) {
            try {
              // 收集所有商品 ID
              const productIDs = order.orderItems
                .map(item => item.productID)
                .filter((id): id is string => !!id);
              
              // 計算總商品數量
              const totalQuantity = order.orderItems
                .reduce((sum, item) => sum + (item.quantity || 0), 0);

              if (productIDs.length > 0) {
                await createPurchaseHistoryMutation.mutateAsync({
                  data: {
                    productID: productIDs,
                    productQuantity: totalQuantity
                  }
                });
              }
            } catch (historyErr) {
              console.error('建立購買紀錄失敗:', historyErr);
            }
          }
        }
      }
    );
  };

  // 根據訂單 ID 找出使用的優惠券
  const getCouponForOrder = (orderID?: string): { userCoupon: UserCouponItem; template: Coupon | undefined } | null => {
    if (!orderID) return null;
    const userCoupon = userCoupons.find(uc => uc.orderID === orderID);
    if (!userCoupon) return null;
    const template = userCoupon.couponID ? couponTemplates.get(userCoupon.couponID) : undefined;
    return { userCoupon, template };
  };

  // 取得優惠券顯示名稱
  const getCouponDisplayName = (coupon: { userCoupon: UserCouponItem; template: Coupon | undefined }): string => {
    return coupon.template?.couponName || coupon.userCoupon.couponName || coupon.userCoupon.couponID || '優惠券';
  };

  // 取得優惠券折扣描述
  const getCouponDiscountDesc = (coupon: { userCoupon: UserCouponItem; template: Coupon | undefined }): string => {
    const template = coupon.template;
    const discountType = template?.discountType || coupon.userCoupon.discountType;
    const discountValue = template?.discountValue || coupon.userCoupon.discountValue;

    if (!discountType || discountValue === undefined) return '';

    switch (discountType) {
      case 'PERCENT':
        return `${discountValue}折`;
      case 'FIXED':
        return `折抵 $${discountValue}`;
      case 'FREESHIP':
        return '免運費';
      case 'BUY_ONE_GET_ONE':
        return '買一送一';
      default:
        return '';
    }
  };

  const renderOrderDetail = (order: Order | undefined) => {
    if (!order) return null;
    const couponInfo = getCouponForOrder(order.orderID);
    
    return (
      <div className="user-history-detail">
        <div><strong>訂單編號：</strong>{order.orderID}</div>
        <div><strong>訂單時間：</strong>{order.orderTime}</div>
        <div><strong>狀態：</strong>{orderStatusLabel(order.orderStatus)}</div>
        {couponInfo && (
          <div className="user-history-coupon-info">
            <strong>使用優惠券：</strong>
            <span className="user-history-coupon-name">{getCouponDisplayName(couponInfo)}</span>
            {getCouponDiscountDesc(couponInfo) && (
              <span className="user-history-coupon-discount">({getCouponDiscountDesc(couponInfo)})</span>
            )}
          </div>
        )}
        <div><strong>總金額：</strong>{order.totalPrice ?? '-'}</div>
        <div><strong>運費：</strong>{order.shippingFee ?? '-'}</div>
        {order.orderItems && order.orderItems.length > 0 && (
          <div className="user-history-detail-items">
            <strong>訂單項目：</strong>
            <ul>
              {order.orderItems.map((it, i) => (
                <li key={i}>
                  <ProductName productId={it.productID} /> × {it.quantity} @ {it.price} (小計 {it.totalPrice})
                </li>
              ))}
            </ul>
          </div>
        )}
          {/* 確認訂單按鈕：只在待處理 (PENDING) 顯示 */}
          {order.orderStatus === 'PENDING' && (
            <div className="user-history-confirm-section">
              <button
                className="user-history-confirm-button"
                onClick={() => {
                  if (!order.orderID) return;
                  if (!window.confirm('確定要確認付款此訂單嗎？')) return;
                  handleConfirmOrder(order.orderID, order);
                }}
                disabled={payOrderMutation.isPending}
              >
                {payOrderMutation.isPending ? '處理中...' : '確認訂單'}
              </button>
              {payOrderMutation.isError && (
                <div className="user-history-message error">付款失敗，請稍後重試</div>
              )}
              {payOrderMutation.isSuccess && (
                <div className="user-history-message success">付款成功</div>
              )}
            </div>
          )}
      </div>
    );
  };

  const ProductName: React.FC<{ productId?: string }> = ({ productId }) => {
    const q = useGetProductById(productId ?? '');
    const raw = q.data as GetProductByIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    const product = data as Product | undefined;
    if (!productId) return <>-</>;
    if (q.isLoading) return <>載入中</>;
    if (q.isError) return <>{product?.productName ?? '-'}</>;
    return <>{product?.productName ?? '-'}</>;
  };

  const renderHistoryDetail = (item: PurchaseHistory | BidHistory | ReviewHistory | BrowseHistory | undefined) => {
    if (!item) return null;
    // PurchaseHistory contains historyItems
    const ph = item as PurchaseHistory;
    if (ph.historyItems && ph.historyItems.length) {
      return (
        <div className="user-history-detail">
          <div><strong>時間：</strong>{ph.timeStamp}</div>
          <div><strong>項目：</strong></div>
          <ul>
            {ph.historyItems.map((hi, i) => (
              <li key={i}>{hi.productName} × {hi.productQuantity} - 單價 {hi.productPrice} / 小計 {hi.totalPrice}</li>
            ))}
          </ul>
        </div>
      );
    }

    const bh = item as BidHistory;
    if (typeof bh.bidAmount !== 'undefined' || bh.historyItem) {
      return (
        <div className="user-history-detail">
          <div><strong>時間：</strong>{bh.timeStamp}</div>
          <div><strong>出價：</strong>{bh.bidAmount ?? '-'}</div>
          {bh.historyItem ? (
            <div><strong>商品：</strong>{bh.historyItem.productName} ({bh.historyItem.productQuantity})</div>
          ) : (
            <div><strong>商品：</strong>{bh.productID ?? '-'}</div>
          )}
        </div>
      );
    }

    const rh = item as ReviewHistory;
    if (rh.reviewID || rh.actionType) {
      return (
        <div className="user-history-detail">
          <div><strong>時間：</strong>{rh.timeStamp}</div>
          <div><strong>評論 ID：</strong>{rh.reviewID}</div>
          <div><strong>動作：</strong>{rh.actionType}</div>
        </div>
      );
    }

    const br = item as BrowseHistory;
    if (br.historyItem || br.productID) {
      return (
        <div className="user-history-detail">
          <div><strong>時間：</strong>{br.timeStamp}</div>
          <div><strong>商品：</strong>{br.historyItem?.productName ?? br.productID ?? '-'}</div>
        </div>
      );
    }

    return null;
  };

  const renderLoading = () => <div className="user-history-empty">載入中…</div>;
  const renderError = (err?: unknown) => {
    // If the server returned 404, treat it as "no records" and show a friendly message.
    const axiosErr = err as AxiosError | undefined;
    if (axiosErr?.response?.status === 404) return <div className="user-history-empty">尚沒有紀錄</div>;
    return <div className="user-history-message error">載入失敗</div>;
  };

  const renderOrders = () => {
    if (!userId) return <div className="user-history-empty">找不到使用者 ID</div>;
    const isLoading = orderQuery?.isLoading;
    const isError = orderQuery?.isError;
    const raw = orderQuery?.data as GetOrderByBuyerIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(orderQuery?.error);
    const orderItems: Order[] = Array.isArray(data) ? data : (data && typeof data === 'object' && 'orderID' in data) ? [data as Order] : [];
    if (!orderItems.length) return <div className="user-history-empty">沒有訂單紀錄</div>;
    // 依時間排序：最新的在前
    const sortedOrders = [...orderItems].sort((a, b) => {
      const timeA = a.orderTime ? new Date(a.orderTime).getTime() : 0;
      const timeB = b.orderTime ? new Date(b.orderTime).getTime() : 0;
      return timeB - timeA; // 降序：新的在前
    });
    return (
      <ul>
        {sortedOrders.map((o, idx) => {
          const id = o.orderID ?? String(idx);
          return (
            <li key={id}>
              <div className="user-history-list-item-header">
                <div className="user-history-list-item-info">
                  <div className="user-history-list-item-title">{o.orderID}</div>
                  <div className="user-history-list-item-time">— {o.orderTime}</div>
                  <div className="user-history-list-item-meta">狀態：{orderStatusLabel(o.orderStatus)}</div>
                </div>
                <button 
                  className="user-history-list-item-button"
                  onClick={() => toggleExpand(id)}
                >
                  {expanded === id ? '收起' : '查看詳情'}
                </button>
              </div>
              {expanded === id && renderOrderDetail(o)}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderPurchases = () => {
    if (!userId) return <div className="user-history-empty">找不到使用者 ID</div>;
    const isLoading = purchaseQuery?.isLoading;
    const isError = purchaseQuery?.isError;
    const raw = purchaseQuery?.data as GetPurchaseHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(purchaseQuery?.error);
    const purchaseItems: PurchaseHistory[] = Array.isArray(data) ? data.filter((item) => item && '_id' in item) : (data && '_id' in data) ? [data] : [];
    if (!purchaseItems.length) return <div className="user-history-empty">沒有購買紀錄</div>;
    // 依時間排序：最新的在前
    const sortedPurchases = [...purchaseItems].sort((a, b) => {
      const timeA = a.timeStamp ? new Date(a.timeStamp).getTime() : 0;
      const timeB = b.timeStamp ? new Date(b.timeStamp).getTime() : 0;
      return timeB - timeA; // 降序：新的在前
    });
    return (
      <ul>
        {sortedPurchases.map((p, idx) => {
          const id = p._id ?? String(idx);
          return (
            <li key={id}>
              <div className="user-history-list-item-header">
                <div className="user-history-list-item-info">
                  <div className="user-history-list-item-title">{p._id}</div>
                  <div className="user-history-list-item-time">— {p.timeStamp}</div>
                  <div className="user-history-list-item-meta">合計商品數：{p.productQuantity ?? '-'}</div>
                </div>
                <button 
                  className="user-history-list-item-button"
                  onClick={() => toggleExpand(id)}
                >
                  {expanded === id ? '收起' : '查看詳情'}
                </button>
              </div>
              {expanded === id && renderHistoryDetail(p)}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderBids = () => {
    if (!userId) return <div className="user-history-empty">找不到使用者 ID</div>;
    const isLoading = bidQuery?.isLoading;
    const isError = bidQuery?.isError;
    const raw = bidQuery?.data as GetBidHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(bidQuery?.error);
    const bidItems: BidHistory[] = Array.isArray(data) ? data.filter((item) => item && '_id' in item) : (data && '_id' in data) ? [data] : [];
    if (!bidItems.length) return <div className="user-history-empty">沒有競標紀錄</div>;
    // 依時間排序：最新的在前
    const sortedBids = [...bidItems].sort((a, b) => {
      const timeA = a.timeStamp ? new Date(a.timeStamp).getTime() : 0;
      const timeB = b.timeStamp ? new Date(b.timeStamp).getTime() : 0;
      return timeB - timeA; // 降序：新的在前
    });
    return (
      <ul>
        {sortedBids.map((b, idx) => {
          const id = b._id ?? String(idx);
          const pid = b.historyItem?.productID ?? b.productID;
          const title = b.historyItem?.productName ?? b.historyItem?.productID ?? pid ?? '未取得商品資訊';
          return (
            <li key={id}>
              <div className="user-history-list-item-header">
                <div className="user-history-list-item-info">
                  <div className="user-history-list-item-title">{title}</div>
                  <div className="user-history-list-item-time">— {b.timeStamp}</div>
                  <div className="user-history-list-item-meta">出價：{b.bidAmount ?? '-'}</div>
                  <div className="user-history-list-item-meta">商品 ID：{pid ?? '-'}</div>
                </div>
                <button 
                  className="user-history-list-item-button"
                  onClick={() => toggleExpand(id)}
                >
                  {expanded === id ? '收起' : '查看詳情'}
                </button>
              </div>
              {expanded === id && renderHistoryDetail(b)}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderReviews = () => {
    if (!userId) return <div className="user-history-empty">找不到使用者 ID</div>;
    const isLoading = reviewQuery?.isLoading;
    const isError = reviewQuery?.isError;
    const raw = reviewQuery?.data as GetReviewHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    const status = (raw as AxiosResponse | undefined)?.status;
    if (isLoading) return renderLoading();
    if (status === 404) return <div className="user-history-empty">沒有評論紀錄</div>;
    if (isError) return renderError(reviewQuery?.error);
    const reviewItems: ReviewHistory[] = Array.isArray(data) ? data : (data && typeof data === 'object' && '_id' in data) ? [data as ReviewHistory] : [];
    if (!reviewItems.length) return <div className="user-history-empty">沒有評論紀錄</div>;
    // 依時間排序：最新的在前
    const sortedReviews = [...reviewItems].sort((a, b) => {
      const timeA = a.timeStamp ? new Date(a.timeStamp).getTime() : 0;
      const timeB = b.timeStamp ? new Date(b.timeStamp).getTime() : 0;
      return timeB - timeA; // 降序：新的在前
    });
    return (
      <ul>
        {sortedReviews.map((r, idx) => {
          const id = r._id ?? r.reviewID ?? String(idx);
          return (
            <li key={id}>
              <div className="user-history-list-item-header">
                <div className="user-history-list-item-info">
                  <div className="user-history-list-item-title">{r.reviewID ?? r._id}</div>
                  <div className="user-history-list-item-time">— {r.timeStamp}</div>
                  <div className="user-history-list-item-meta">動作：{r.actionType ?? '-'}</div>
                </div>
                <button 
                  className="user-history-list-item-button"
                  onClick={() => toggleExpand(id)}
                >
                  {expanded === id ? '收起' : '查看詳情'}
                </button>
              </div>
              {expanded === id && renderHistoryDetail(r)}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderBrowses = () => {
    if (!userId) return <div className="user-history-empty">找不到使用者 ID</div>;
    const isLoading = browseQuery?.isLoading;
    const isError = browseQuery?.isError;
    const raw = browseQuery?.data as GetBrowseHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(browseQuery?.error);
    const browseItems: BrowseHistory[] = Array.isArray(data) ? data : (data && typeof data === 'object' && '_id' in data) ? [data as BrowseHistory] : [];
    if (!browseItems.length) return <div className="user-history-empty">沒有瀏覽紀錄</div>;
    const sortedBrowses = [...browseItems].sort((a, b) => {
      const timeA = a.timeStamp ? new Date(a.timeStamp).getTime() : 0;
      const timeB = b.timeStamp ? new Date(b.timeStamp).getTime() : 0;
      return timeB - timeA;
    });
    return (
      <ul>
        {sortedBrowses.map((br, idx) => {
          const id = br._id ?? String(idx);
          const pid = br.historyItem?.productID ?? br.productID;
          const title = br.historyItem?.productName ?? br.historyItem?.productID ?? pid ?? '未取得商品資訊';
          return (
            <li key={id}>
              <div className="user-history-list-item-header">
                <div className="user-history-list-item-info">
                  <div className="user-history-list-item-title">{title}</div>
                  <div className="user-history-list-item-time">— {br.timeStamp}</div>
                  <div className="user-history-list-item-meta">商品 ID：{pid ?? '-'}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderList = () => {
    switch (selected) {
      case 'OrderHistory':
        return renderOrders();
      case 'PurchaseHistory':
        return renderPurchases();
      case 'BidHistory':
        return renderBids();
      case 'ReviewHistory':
        return renderReviews();
      case 'BrowseHistory':
        return renderBrowses();
      default:
        return <div className="user-history-empty">沒有資料</div>;
    }
  };

  return <div className="user-history-list">{renderList()}</div>;
};

export default HistoryList;

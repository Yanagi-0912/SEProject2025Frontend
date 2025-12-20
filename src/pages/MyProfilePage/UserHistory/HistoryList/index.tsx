import React, { useState } from 'react';
import type { HistoryTab } from '../ControlPanel';
import type { AxiosError } from 'axios';
import {
  useGetOrderByBuyerId,
  useGetReviewHistoriesByUserId,
  useGetPurchaseHistoriesByUserId,
  useGetBidHistoriesByUserId,
  useGetProductById,
  usePayOrder,
  getGetOrderByBuyerIdQueryKey,
  type GetOrderByBuyerIdQueryResult,
  type GetProductByIdQueryResult,
  type GetPurchaseHistoriesByUserIdQueryResult,
  type GetBidHistoriesByUserIdQueryResult,
  type GetReviewHistoriesByUserIdQueryResult
} from '../../../../api/generated';
import type { Order, PurchaseHistory, BidHistory, ReviewHistory, BrowseHistory, Product } from '../../../../api/generated';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  selected: HistoryTab;
  userId?: string;
}

const HistoryList: React.FC<Props> = ({ selected, userId }) => {
  // Call hooks unconditionally so their call order is stable; hooks should handle an undefined userId internally
  const orderQuery = useGetOrderByBuyerId({ buyerId: userId ?? '' });
  const reviewQuery = useGetReviewHistoriesByUserId(userId ?? '');
  const purchaseQuery = useGetPurchaseHistoriesByUserId(userId ?? '');
  const bidQuery = useGetBidHistoriesByUserId(userId ?? '');

  // A compact display shape for rendering — fields are optional because API shapes vary.
  // (display mapping will use the typed API interfaces directly)

  const [expanded, setExpanded] = useState<string | null>(null);

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

  const handleConfirmOrder = (orderID: string) => {
    if (!orderID) return;
    payOrderMutation.mutate(
      { orderID, params: {} },
      {
        onSuccess: () => {
          // Invalidate order query for current user so list refreshes
          try {
            const key = getGetOrderByBuyerIdQueryKey({ buyerId: userId ?? '' });
            queryClient.invalidateQueries({ queryKey: key });
          } catch {
            queryClient.invalidateQueries();
          }
        }
      }
    );
  };

  const renderOrderDetail = (order: Order | undefined) => {
    if (!order) return null;
    return (
      <div style={{ padding: 8, background: '#f9fafb', borderRadius: 6, marginTop: 8 }}>
        <div><strong>訂單編號：</strong>{order.orderID}</div>
        <div><strong>訂單時間：</strong>{order.orderTime}</div>
        <div><strong>狀態：</strong>{orderStatusLabel(order.orderStatus)}</div>
        <div><strong>總金額：</strong>{order.totalPrice ?? '-'}</div>
        <div><strong>運費：</strong>{order.shippingFee ?? '-'}</div>
        {order.orderItems && order.orderItems.length > 0 && (
          <div style={{ marginTop: 8 }}>
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
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => {
                  if (!order.orderID) return;
                  if (!window.confirm('確定要確認付款此訂單嗎？')) return;
                  handleConfirmOrder(order.orderID ?? '');
                }}
                disabled={payOrderMutation.isPending}
              >
                {payOrderMutation.isPending ? '處理中...' : '確認訂單'}
              </button>
              {payOrderMutation.isError && (
                <div style={{ color: 'crimson', marginTop: 8 }}>付款失敗，請稍後重試</div>
              )}
              {payOrderMutation.isSuccess && (
                <div style={{ color: 'green', marginTop: 8 }}>付款成功</div>
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
        <div style={{ padding: 8, background: '#f9fafb', borderRadius: 6, marginTop: 8 }}>
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
        <div style={{ padding: 8, background: '#f9fafb', borderRadius: 6, marginTop: 8 }}>
          <div><strong>時間：</strong>{bh.timeStamp}</div>
          <div><strong>出價：</strong>{bh.bidAmount ?? '-'}</div>
          {bh.historyItem && (
            <div><strong>商品：</strong>{bh.historyItem.productName} ({bh.historyItem.productQuantity})</div>
          )}
        </div>
      );
    }

    const rh = item as ReviewHistory;
    if (rh.reviewID || rh.actionType) {
      return (
        <div style={{ padding: 8, background: '#f9fafb', borderRadius: 6, marginTop: 8 }}>
          <div><strong>時間：</strong>{rh.timeStamp}</div>
          <div><strong>評論 ID：</strong>{rh.reviewID}</div>
          <div><strong>動作：</strong>{rh.actionType}</div>
        </div>
      );
    }

    const br = item as BrowseHistory;
    if (br.historyItem) {
      return (
        <div style={{ padding: 8, background: '#f9fafb', borderRadius: 6, marginTop: 8 }}>
          <div><strong>時間：</strong>{br.timeStamp}</div>
          <div><strong>商品：</strong>{br.historyItem.productName}</div>
        </div>
      );
    }

    return null;
  };

  const renderLoading = () => <div>載入中…</div>;
  const renderError = (err?: unknown) => {
    // If the server returned 404, treat it as "no records" and show a friendly message.
    const axiosErr = err as AxiosError | undefined;
    if (axiosErr?.response?.status === 404) return <div>尚沒有紀錄</div>;
    return <div style={{ color: 'crimson' }}>載入失敗</div>;
  };

  const renderOrders = () => {
    if (!userId) return <div>找不到使用者 ID</div>;
    const isLoading = orderQuery?.isLoading;
    const isError = orderQuery?.isError;
    const raw = orderQuery?.data as GetOrderByBuyerIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(orderQuery?.error);
    const orderItems: Order[] = Array.isArray(data) ? data : (data && typeof data === 'object' && 'orderID' in data) ? [data as Order] : [];
    if (!orderItems.length) return <div>沒有訂單紀錄</div>;
    return (
      <ul>
        {orderItems.map((o, idx) => {
          const id = o.orderID ?? String(idx);
          return (
            <li key={id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{o.orderID}</strong> <span style={{ color: '#6b7280' }}>— {o.orderTime}</span>
                  <div style={{ fontSize: 13, color: '#374151' }}>狀態：{orderStatusLabel(o.orderStatus)}</div>
                </div>
                <button onClick={() => toggleExpand(id)} style={{ marginLeft: 12 }}>
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
    if (!userId) return <div>找不到使用者 ID</div>;
    const isLoading = purchaseQuery?.isLoading;
    const isError = purchaseQuery?.isError;
    const raw = purchaseQuery?.data as GetPurchaseHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(purchaseQuery?.error);
    const purchaseItems: PurchaseHistory[] = Array.isArray(data) ? data.filter((item) => item && '_id' in item) : (data && '_id' in data) ? [data] : [];
    if (!purchaseItems.length) return <div>沒有購買紀錄</div>;
    return (
      <ul>
        {purchaseItems.map((p, idx) => {
          const id = p._id ?? String(idx);
          return (
            <li key={id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p._id}</strong> <span style={{ color: '#6b7280' }}>— {p.timeStamp}</span>
                  <div style={{ fontSize: 13, color: '#374151' }}>合計商品數：{p.productQuantity ?? '-'}</div>
                </div>
                <button onClick={() => toggleExpand(id)} style={{ marginLeft: 12 }}>
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
    if (!userId) return <div>找不到使用者 ID</div>;
    const isLoading = bidQuery?.isLoading;
    const isError = bidQuery?.isError;
    const raw = bidQuery?.data as GetBidHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(bidQuery?.error);
    const bidItems: BidHistory[] = Array.isArray(data) ? data.filter((item) => item && '_id' in item) : (data && '_id' in data) ? [data] : [];
    if (!bidItems.length) return <div>沒有競標紀錄</div>;
    return (
      <ul>
        {bidItems.map((b, idx) => {
          const id = b._id ?? String(idx);
          return (
            <li key={id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{b._id}</strong> <span style={{ color: '#6b7280' }}>— {b.timeStamp}</span>
                  <div style={{ fontSize: 13, color: '#374151' }}>出價：{b.bidAmount ?? '-'}</div>
                </div>
                <button onClick={() => toggleExpand(id)} style={{ marginLeft: 12 }}>
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
    if (!userId) return <div>找不到使用者 ID</div>;
    const isLoading = reviewQuery?.isLoading;
    const isError = reviewQuery?.isError;
    const raw = reviewQuery?.data as GetReviewHistoriesByUserIdQueryResult | undefined;
    const data = raw?.data ?? raw;
    if (isLoading) return renderLoading();
    if (isError) return renderError(reviewQuery?.error);
    const reviewItems: ReviewHistory[] = Array.isArray(data) ? data : (data && typeof data === 'object' && '_id' in data) ? [data as ReviewHistory] : [];
    if (!reviewItems.length) return <div>沒有評論紀錄</div>;
    return (
      <ul>
        {reviewItems.map((r, idx) => {
          const id = r._id ?? r.reviewID ?? String(idx);
          return (
            <li key={id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.reviewID ?? r._id}</strong> <span style={{ color: '#6b7280' }}>— {r.timeStamp}</span>
                  <div style={{ fontSize: 13, color: '#374151' }}>動作：{r.actionType ?? '-'}</div>
                </div>
                <button onClick={() => toggleExpand(id)} style={{ marginLeft: 12 }}>
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
      default:
        return <div>沒有資料</div>;
    }
  };

  return <div className="user-history-list">{renderList()}</div>;
};

export default HistoryList;

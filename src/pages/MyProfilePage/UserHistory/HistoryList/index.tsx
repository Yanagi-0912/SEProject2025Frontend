import React from 'react';
import type { HistoryTab } from '../ControlPanel';
import {
  useGetOrderByBuyerId,
  useGetReviewHistoriesByUserId,
  useGetPurchaseHistoriesByUserId,
  useGetBidHistoriesByUserId,
  type GetOrderByBuyerIdQueryResult,
  type GetPurchaseHistoriesByUserIdQueryResult,
  type GetBidHistoriesByUserIdQueryResult,
  type GetReviewHistoriesByUserIdQueryResult
} from '../../../../api/generated';

interface Props {
  selected: HistoryTab;
  userId?: string;
}

const HistoryList: React.FC<Props> = ({ selected, userId }) => {
  // Each hook is called unconditionally; the conditional logic is handled by the hooks themselves
  const orderQuery = useGetOrderByBuyerId({ buyerId: userId || '' });
  const reviewQuery = useGetReviewHistoriesByUserId(userId || '');
  const purchaseQuery = useGetPurchaseHistoriesByUserId(userId || '');
  const bidQuery = useGetBidHistoriesByUserId(userId || '');

  // A compact display shape for rendering — fields are optional because API shapes vary.
  type DisplayItem = {
    id?: string;
    orderID?: string;
    createdAt?: string;
    date?: string;
    status?: string;
    orderStatus?: string;
    amount?: string | number;
    total?: string | number;
    price?: string | number;
    highestBid?: string | number;
    title?: string;
    productName?: string;
    comment?: string;
    text?: string;
    reviewId?: string;
    purchaseId?: string;
    bidID?: string;
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
    if (isError) return renderError();
    const items: DisplayItem[] = Array.isArray(data) ? data : data ? [data] : [];
    if (!items.length) return <div>沒有訂單紀錄</div>;
    return (
      <ul>
        {items.map((o, idx) => (
          <li key={o.id ?? o.orderID ?? idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <strong>{o.id ?? o.orderID}</strong> <span style={{ color: '#6b7280' }}>— {o.createdAt ?? o.date}</span>
            <div style={{ fontSize: 13, color: '#374151' }}>狀態：{o.status ?? o.orderStatus}</div>
          </li>
        ))}
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
    if (isError) return renderError();
    const items: DisplayItem[] = (Array.isArray(data) ? data : data ? [data] : []) as DisplayItem[];
    if (!items.length) return <div>沒有購買紀錄</div>;
    return (
      <ul>
        {items.map((p, idx) => (
          <li key={p.id ?? p.purchaseId ?? idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <strong>{p.id ?? p.purchaseId}</strong> <span style={{ color: '#6b7280' }}>— {p.createdAt ?? p.date}</span>
            <div style={{ fontSize: 13, color: '#374151' }}>金額：{p.amount ?? p.total ?? '-'}</div>
          </li>
        ))}
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
    if (isError) return renderError();
    const items: DisplayItem[] = Array.isArray(data) ? data : data ? [data] : [];
    if (!items.length) return <div>沒有競標紀錄</div>;
    return (
      <ul>
        {items.map((b, idx) => (
          <li key={b.id ?? b.bidID ?? idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <strong>{b.id ?? b.bidID}</strong> <span style={{ color: '#6b7280' }}>— {b.createdAt ?? b.date}</span>
            <div style={{ fontSize: 13, color: '#374151' }}>出價：{b.price ?? b.highestBid}</div>
          </li>
        ))}
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
    if (isError) return renderError();
    const items: DisplayItem[] = (Array.isArray(data) ? data : data ? [data] : []) as DisplayItem[];
    if (!items.length) return <div>沒有評論紀錄</div>;
    return (
      <ul>
        {items.map((r, idx) => (
          <li key={r.id ?? r.reviewId ?? idx} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <strong>{r.title ?? r.productName ?? `評論 ${r.id ?? ''}`}</strong> <span style={{ color: '#6b7280' }}>— {r.createdAt ?? r.date}</span>
            <div style={{ fontSize: 13, color: '#374151' }}>{r.comment ?? r.text ?? '-'}</div>
          </li>
        ))}
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

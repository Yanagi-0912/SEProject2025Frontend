import React from 'react';

export type HistoryTab =
  | 'OrderHistory'
  | 'PurchaseHistory'
  | 'BidHistory'
  | 'ReviewHistory';

interface Props {
  selected: HistoryTab;
  onSelect: (tab: HistoryTab) => void;
}

const tabLabels: Record<HistoryTab, string> = {
  OrderHistory: '訂單紀錄 (OrderHistory)',
  PurchaseHistory: '買購紀錄 (PurchaseHistory)',
  BidHistory: '競標紀錄 (BidHistory)',
  ReviewHistory: '評論紀錄 (ReviewHistory)'
};

const ControlPanel: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="user-history-controlpanel" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {(Object.keys(tabLabels) as HistoryTab[]).map((key) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: selected === key ? '2px solid #2563eb' : '1px solid #d1d5db',
            background: selected === key ? '#eff6ff' : '#fff',
            cursor: 'pointer'
          }}
        >
          {tabLabels[key]}
        </button>
      ))}
    </div>
  );
};

export default ControlPanel;

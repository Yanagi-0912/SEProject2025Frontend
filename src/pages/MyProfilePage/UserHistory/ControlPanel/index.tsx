import React from 'react';
import './index.css';

export type HistoryTab =
  | 'OrderHistory'
 // | 'PurchaseHistory'
 // | 'BidHistory'
 // | 'ReviewHistory'
  | 'BrowseHistory';

interface Props {
  selected: HistoryTab;
  onSelect: (tab: HistoryTab) => void;
}

const tabLabels: Record<HistoryTab, string> = {
  OrderHistory: '訂單紀錄',
//  PurchaseHistory: '購買紀錄',
//  BidHistory: '競標紀錄',
//  ReviewHistory: '評論紀錄',
  BrowseHistory: '瀏覽紀錄'
};

const ControlPanel: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="user-history-controlpanel">
      {(Object.keys(tabLabels) as HistoryTab[]).map((key) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={selected === key ? 'user-history-tab-active' : 'user-history-tab'}
        >
          {tabLabels[key]}
        </button>
      ))}
    </div>
  );
};

export default ControlPanel;

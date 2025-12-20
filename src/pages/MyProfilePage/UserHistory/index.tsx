import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ControlPanel, { type HistoryTab } from './ControlPanel';
import HistoryList from './HistoryList';
import Header from '../../Main/Header';
import { useGetCurrentUser } from '../../../api/generated';
import './index.css';

const UserHistory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as HistoryTab | null;
  const [selected, setSelected] = useState<HistoryTab>(tabParam || 'OrderHistory');
  const currentUserQuery = useGetCurrentUser();
  const userId = currentUserQuery?.data?.data?.id;

  // 同步 URL 參數與內部狀態
  useEffect(() => {
    if (tabParam && tabParam !== selected) {
      setSelected(tabParam);
    }
  }, [tabParam]);

  // 當選中標籤改變時，更新 URL 參數
  const handleTabSelect = (tab: HistoryTab) => {
    setSelected(tab);
    setSearchParams({ tab });
  };

  return (
    <div>
			<Header showSearch={false} />
      <div className="user-history">
      	<h2>我的紀錄</h2>
      	<ControlPanel selected={selected} onSelect={handleTabSelect} />
        <div className="user-history-content">
          <HistoryList selected={selected} userId={userId} />
        </div>
      </div>
    </div>
    
  );
};

export default UserHistory;

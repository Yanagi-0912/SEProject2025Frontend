import React, { useState } from 'react';
import ControlPanel, { type HistoryTab } from './ControlPanel';
import HistoryList from './HistoryList';
import Header from '../../Main/Header';
import { useGetCurrentUser } from '../../../api/generated';


const UserHistory: React.FC = () => {
  const [selected, setSelected] = useState<HistoryTab>('OrderHistory');
  const currentUserQuery = useGetCurrentUser();
  const userId = currentUserQuery?.data?.data?.id;

  return (
    <div>
			<Header showSearch={false} />
      <div className="user-history" style={{ padding: 12 }}>
      	<h2 style={{ marginBottom: 8 }}>我的紀錄</h2>
      	<ControlPanel selected={selected} onSelect={setSelected} />
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <HistoryList selected={selected} userId={userId} />
        </div>
      </div>
    </div>
    
  );
};

export default UserHistory;

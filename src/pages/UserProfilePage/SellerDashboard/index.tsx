import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCurrentUser } from '../../../api/generated';
import Header from '../../Main/Header';
import SellerInfo from './SellerInfo';
import ControlPanel from './ControlPanel';
import ProductManage from './ProductManage';
import './SellerDashboard.css';

type ViewMode = 'list' | 'create' | 'edit';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: userData } = useGetCurrentUser();
  const user = userData?.data;

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleViewAll = () => {
    setViewMode('list');
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setViewMode('list');
  };

  const handleBack = () => {
    navigate('/user/me');
  };

  return (
    <div className="seller-dashboard-page">
      <Header page={0} onBack={handleBack} />
      
      <div className="seller-dashboard-container">
        <h1 className="dashboard-title">賣家後台</h1>
        
        {/* 賣家資訊 */}
        <SellerInfo 
          averageRating={user?.averageRating ?? 0}
          ratingCount={user?.ratingCount ?? 0}
        />
        
        {/* 控制面板 */}
        <ControlPanel 
          onCreateNew={handleCreateNew}
          onViewAll={handleViewAll}
          onSearch={handleSearch}
        />
        
        {/* 商品管理 */}
        <ProductManage 
          viewMode={viewMode}
          searchQuery={searchQuery}
          onModeChange={setViewMode}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;



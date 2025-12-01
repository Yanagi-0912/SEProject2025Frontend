import { useState } from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  onCreateNew: () => void;
  onViewAll: () => void;
  onSearch: (query: string) => void;
}

const ControlPanel = ({ onCreateNew, onViewAll, onSearch }: ControlPanelProps) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="control-panel-card">
      <div className="control-panel-actions">
        <button 
          onClick={onCreateNew}
          className="control-btn create-btn"
        >
          <span className="btn-icon">➕</span>
          建立新商品
        </button>
        
        <button 
          onClick={onViewAll}
          className="control-btn view-all-btn"
        >
          <span className="btn-icon">📋</span>
          檢視所有商品
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="搜尋商品名稱..."
          className="search-input"
        />
        <button type="submit" className="search-btn">
          🔍 搜尋
        </button>
      </form>
    </div>
  );
};

export default ControlPanel;

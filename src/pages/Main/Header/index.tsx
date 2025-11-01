import './Header.css'

interface HeaderProps {
  page: number;
  onBack?: () => void;
}

function Header({ page, onBack }: HeaderProps) {
  return (
    <div className="header-container">
      <button onClick={onBack} className="back-button">
        icon 回首頁 <br></br>
      </button>
      <div className="page-title-section">
        <h1>第 {page} 主頁</h1>
      </div>
      <div className="search-section">
        <input  type="text" placeholder="搜尋" className="search-input" />
      </div>
      <div className="actions-section">
        <button className="action-button">我的帳號</button>
        <button className="action-button">購物車</button>
        <button className="action-button">訊息</button>
      </div>
    </div>
  );
}

export default Header;

import './Header.css'
interface HeaderProps {
  page: number;
  onBack?: () => void;
  onCartClick?: () => void;
}

function Header({ page, onBack, onCartClick}: HeaderProps) {
    const handleCart = () => {
        if (onCartClick) {
            onCartClick();
        }
    };
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
      <div style={{ flex: 1 }}>
        <button type="button" onClick={handleCart} style={{ borderRadius: '10px' }}>購物車</button>
        <button style={{ borderRadius: '10px' }}>訊息</button>
      </div>
    </div>
  );
}

export default Header;
import './Header.css'
interface HeaderProps {
  page: number;
  onBack?: () => void;
  onCartClick?: () => void;
  onAccountClick?: () => void;
  onLoginClick?: () => void;
}

function Header({ page, onBack, onCartClick, onAccountClick, onLoginClick }: HeaderProps) {
    const handleCart = () => {
        if (onCartClick) {
            onCartClick();
        }
    };
    
    const handleAccount = () => {
        if (onAccountClick) {
            onAccountClick();
        }
    };
    const handlelogin = () => {
        if (onLoginClick) {
            onLoginClick();
        }
    }
    
  return (
    <div className="header-container">
      <button onClick={onBack} className="back-button">
        <img src="/home-icon.png" alt="回首頁" className="home-icon-img" />
      </button>
      <div className="page-title-section">
        <h1>第 {page} 頁</h1>
      </div>
      <div className="search-section">
        <input  type="text" placeholder="搜尋" className="search-input" />
      </div>
      <div className="actions-section">
        <button type="button" onClick={handlelogin} className="action-button">登入</button>
        <button type="button" onClick={handleAccount} className="action-button">我的帳號</button>
        <button type="button" onClick={handleCart} className="action-button">購物車</button>
        <button className="action-button">訊息</button>
      </div>
    </div>
  );
}

export default Header;
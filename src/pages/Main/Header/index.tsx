import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Header.css'

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 檢查登入狀態
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleCart = () => {
        navigate('/cart');
    };
    
    const handleAccount = () => {
        navigate('/user/me'); 
        window.location.reload();
    };

    const handleLogin = () => {
        navigate('/login');
    }

    const handleLogout = () => {
        if (confirm('確定要登出嗎？')) {
            // 清除 localStorage 中的認證資料
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            setIsLoggedIn(false);
            alert('已成功登出');
            // 導向登入頁
            navigate('/');
        }
    };
    
  return (
    <div className="header-container">
      <button onClick={() => { navigate('/'); window.location.reload(); }} className="back-button">
        <img src="/home-icon.png" alt="回到首頁" className="home-icon-img" />
      </button>
      <div className="search-section">
        <input  type="text" placeholder="搜尋" className="search-input" />
      </div>
      <div className="actions-section">
        {isLoggedIn ? (
          <button type="button" onClick={handleLogout} className="action-button">登出</button>
        ) : (
          <button type="button" onClick={handleLogin} className="action-button">登入</button>
        )}
        <button type="button" onClick={handleAccount} className="action-button">我的帳號</button>
        <button type="button" onClick={handleCart} className="action-button">購物車</button>
        <button className="action-button">訊息</button>
      </div>
    </div>
  );
}

export default Header;
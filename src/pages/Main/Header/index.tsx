import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Header.css'
import { ragSearch } from '../../../api/search';

interface HeaderProps {
    backUrl?: string;
}

function Header({ backUrl }: HeaderProps = {}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 檢查登入狀態
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleCart = () => {
        navigate('/cart');
    };

    const handleChat = () => {
        navigate('/chat');
    };
    const handleFavorite = () => {
        navigate('/favorites/me');
    }
    
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
    
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value;
        setSearchKeyword(newKeyword);
        
        if (newKeyword.trim() === '') {
            navigate('/');
        } else {
            navigate(`/?keyword=${newKeyword}`);
        }
    };

    const handleRagSearch = async () => {
        if (!searchKeyword.trim()) {
            alert('請輸入搜尋內容');
            return;
        }

        try {
            const ids = await ragSearch(searchKeyword);
            if (ids && ids.length > 0) {
                const idString = ids.join(',');
                // 使用新的參數名稱 ragIds，避免污染一般搜尋的 keyword
                navigate(`/?ragIds=${idString}`);
            } else {
                alert('找不到相關商品');
            }
        } catch (error) {
            console.error('RAG Search failed:', error);
            alert('RAG 搜尋失敗');
        }
    };

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      // 檢查是否在 UserProfilePage 且有 productId
      const productId = (location.state as { productId?: string })?.productId;
      if (productId) {
        navigate(`/product/${productId}`);
      } else {
        navigate('/');
        window.location.reload();
      }
    }
  };

  return (
    <div className="header-container">
      <button onClick={handleBack} className="back-button">
        <img src="/home-icon.png" alt="回到首頁" className="home-icon-img" />
      </button>
      <div className="search-section">
        <input 
          type="text" 
          placeholder="搜尋，輸入商品名稱或描述" 
          className="search-input" 
          value={searchKeyword}
          onChange={handleSearchChange}
        />
        <button className="search-btn rag-btn" onClick={handleRagSearch}>
          RAG 搜尋
        </button>
      </div>
      <div className="actions-section">
        {isLoggedIn ? (
          <>
            <button type="button" onClick={handleLogout} className="action-button">登出</button>
            <button type="button" onClick={handleAccount} className="action-button">我的帳號</button>
            <button type="button" onClick={handleCart} className="action-button">購物車</button>
            <button type="button" onClick={handleFavorite} className="action-button">我的最愛</button>
            <button type="button" onClick={handleChat} className="action-button">訊息</button>
          </>
        ) : (
          <button type="button" onClick={handleLogin} className="action-button">登入</button>
        )}
      </div>
    </div>
  );
}

export default Header;
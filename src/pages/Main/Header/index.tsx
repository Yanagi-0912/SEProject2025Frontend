import React from 'react';
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
    <div style={{ display: 'flex' ,border: '2px solid black'  }}>
      <button onClick={onBack} style={{ flex: 0.5}}>
        icon 回首頁 <br></br>
      </button>
      <div style={{ flex:1}}>
        <h1>第 {page} 主頁</h1>
      </div>
      <div style={{ flex:5 , fontSize: '3rem' }}>
        <input type="text" placeholder="搜尋" style={{ fontSize: '4rem' ,borderRadius: '10px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <button type="button" onClick={handleCart} style={{ borderRadius: '10px' }}>購物車</button>
        <button style={{ borderRadius: '10px' }}>訊息</button>
      </div>
    </div>
  );
}

export default Header;

import { useState, useEffect } from 'react';
import Filter from './Filter';
import Header from './Header';
import Products from './Products';
import Pagination from './Pagination';
import CartPage from '../CartPage';
import ProductPage from '../ProductPage';

interface MainProps {
  onBack?: () => void;
}

function Main({ onBack }: MainProps) {
  const [page, setPage] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const total = 10;

  // 顯示購物車頁面
  if (showCart) {
    return <CartPage onBack={() => setShowCart(false)} />;
  }

  // 顯示商品詳情頁面
  if (showProduct) {
    return <ProductPage onBack={() => setShowProduct(false)} />;
  }

  return (
    <div style={{ border: '2px solid yellowgreen', backgroundColor: 'gray', color: 'white'}}>
      <Header page={page} onBack={onBack} onCartClick={() => setShowCart(true)} />
      
      <div style={{ display: 'flex' ,alignItems: 'stretch' }}>

        <div style={{ flex: 1  ,border: '6px solid purple'}}>
          <Filter />
        </div>

        <div style={{ flex: 5 }}>
          <Products page={page} onProductClick={() => setShowProduct(true)} />//沒有這一行不會跳轉到商品詳情 需要把這個函數傳到products頁面才能跳轉

        </div>

      </div>

      <Pagination page={page} total={total} setPage={setPage} />
    </div>
  );
}

export default Main



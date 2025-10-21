import { useState } from 'react';
import Filter from './Filter';
import Header from './Header';
import Products from './Products';
import Pagination from './Pagination';
import CartPage from '../CartPage';

interface MainProps {
  onBack?: () => void;
}

function Main({ onBack }: MainProps) {
  const [page, setPage] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const total = 10;

   if (showCart) {
      return <CartPage onBack={() => setShowCart(false)} />;
    }

  return (
    <div style={{ backgroundColor: 'gray', color: 'white', height: '100vh' }}>
      <Header page={page} onBack={onBack} onCartClick={() => setShowCart(true)} />
      
      <div style={{ display: 'flex' ,alignItems: 'stretch' }}>

        <div style={{ flex: 1  ,border: '6px solid purple'}}>
          <Filter />
        </div>

        <div style={{ flex: 5 }}>
          <Products page={page} />
        </div>

      </div>

      <Pagination page={page} total={total} setPage={setPage} />
    </div>
  );
}

export default Main



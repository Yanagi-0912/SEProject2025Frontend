import { useState } from 'react';
import Filter from './Filter';
import Header from './Header';
import Products from './Products';
import Pagination from './Pagination';

interface MainProps {
  onBack?: () => void;
}

function Main({ onBack }: MainProps) {
  const [page, setPage] = useState(1);
  const total = 10;

  return (
    <div style={{ backgroundColor: 'gray', color: 'white', height: '100vh' }}>
      <Header page={page} onBack={onBack} />
      
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



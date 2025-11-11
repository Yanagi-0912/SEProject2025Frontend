import { useState } from 'react';
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
  const [selectedProductID, setSelectedProductID] = useState<string | null>(null);
  const total = 10;

  // 顯示購物車頁面
  if (showCart) {
    return <CartPage onBack={() => setShowCart(false)} />;
  }

  // 顯示商品詳情頁面
  if (showProduct) {
    return (
      <ProductPage
        productID={selectedProductID ?? undefined}
        onBack={() => {
          setShowProduct(false);
          setSelectedProductID(null);
        }}
      />
    );
  }

  return (
    <div style={{ border: '2px solid yellowgreen', backgroundColor: 'rgb(62, 64, 68)', color: 'white'}}>
      <Header page={page} onBack={onBack} onCartClick={() => setShowCart(true)} />
      
      <div style={{ display: 'flex' ,alignItems: 'stretch' }}>

        <div style={{ flex: 1  , backgroundColor: 'white'}}>
          <Filter />
        </div>

        <div style={{ flex: 5 }}>
          <Products
            page={page}
            onProductClick={(p: { id?: string | number; productID?: string | number }) => {
              // p 來自後端或 mock 的 product 資訊，優先使用 product.id 或 product.productID
              const id = p.id ?? p.productID ?? null;
              if (id) setSelectedProductID(String(id));
              setShowProduct(true);
            }}
          />
        </div>

      </div>

      <Pagination page={page} total={total} setPage={setPage} />
    </div>
  );
}

export default Main



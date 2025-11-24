import './Products.css'
import { useGetAllProduct, type Product } from '../../../api/generated'

interface ProductItem {
  id: string | number;
  name: string;
  price?: number;
  image?: string;
  [key: string]: unknown;
}

interface ProductsProps {
  page: number;
  onProductClick?: (product: ProductItem) => void;
}

function Products({ page, onProductClick }: ProductsProps) {
  const { data, isLoading, error } = useGetAllProduct({ page, pageSize: 20 });

  // 正規化資料
  const products: ProductItem[] = data?.data 
    ? (Array.isArray(data.data) ? data.data : [data.data]).map((p: Product) => ({
        id: p.productID ?? '',
        name: p.productName ?? '未命名商品',
        price: p.productPrice ?? 0,
        image: p.productImage ?? `https://picsum.photos/300/300?random=${p.productID}`,
        ...p
      }))
    : [];

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>載入失敗：{error.message}</div>;

  return (
    <div className="products-container">
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="products-card">
            <img 
              src={product.image} 
              alt={product.name} 
              className="products-card-image"
              onClick={() => onProductClick && onProductClick(product)}
            />
            <h4>{product.name}</h4>
            <p>價格: ${product.price ?? '-'}</p>
            <button className="add-to-cart-button">加入購物車</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products


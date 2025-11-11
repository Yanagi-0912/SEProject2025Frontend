import './Products.css'
import { useEffect, useState } from 'react'

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
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 若後端支援分頁，可以傳 page 作為 query，否則拿全部
        const resp = await fetch(`http://localhost:8080/products/?page=${page}`, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        if (!resp.ok) throw new Error(`API returned ${resp.status}`);
        const data = await resp.json();
        // 假設 data 為陣列
        const list = Array.isArray(data) ? data : data.items ?? [];
        // 簡單正規化常用欄位
        const normalized = list.map((p: Record<string, unknown>) => ({
          id: (p['id'] ?? p['_id'] ?? p['productID']) as string | number,
          name: (p['productName'] ?? p['name'] ?? p['title'] ?? `商品 ${p['id'] ?? ''}`) as string,
          price: (p['productPrice'] ?? p['price']) as number | undefined,
          image: (p['productImage'] ?? p['image'] ?? `https://picsum.photos/300/300?random=${String(p['id'] ?? Math.random())}`) as string,
          ...p
        } as ProductItem));
        setProducts(normalized);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [page]);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>載入失敗：{error}</div>;

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


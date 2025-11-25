import './Products.css'
import { useGetAllProduct, useAddToCart, type Product } from '../../../api/generated'

interface ProductItem {
  id: string;
  name: string;
  price?: number;
  image?: string;
  productType?: string;
  nowHighestBid?: number;
  auctionEndTime?: string;
  averageRating?: number;
}

interface ProductsProps {
  page: number;
  onProductClick?: (product: ProductItem) => void;
}

function Products({ page, onProductClick }: ProductsProps) {
  const { data, isLoading, error } = useGetAllProduct({ page, pageSize: 20 });
  const addToCartMutation = useAddToCart();
  // 正規化資料
  const products: ProductItem[] = data?.data 
    ? (Array.isArray(data.data) ? data.data : [data.data]).map((p: Product) => ({
        id: p.productID ?? '',
        name: p.productName ?? '未命名商品',
        price: p.productPrice ?? 0,
        image: p.productImage ?? `https://picsum.photos/300/300?random=${p.productID}`,
        productType: p.productType,
        nowHighestBid: p.nowHighestBid,
        auctionEndTime: p.auctionEndTime,
        averageRating: p.averageRating,
        ...p
      }))
    : [];

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>載入失敗：{error.message}</div>;
  
  const handleAddToCart = async (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (!product.id) {
      alert('商品ID無效');
      return;
    }
        
    try {
      await addToCartMutation.mutateAsync({
        data: {
          productId: product.id,
          quantity: 1
        }
      });
      alert('成功加入購物車！');
    } catch (error) {
      console.error('加入購物車失敗:', error);
      alert('加入購物車失敗，請稍後再試');
    }
  };

  return (
    <div className="products-container">
      <div className="products-grid">
        {products.map(product => (
          <div 
            key={product.id} 
            className="products-card"
            onClick={() => onProductClick && onProductClick(product)}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="products-card-image"
            />
            <h4>{product.name}</h4>
            
            {product.productType === 'AUCTION' ? (
              <>
                <p className="highest-bid">目前最高出價: ${product.nowHighestBid ?? product.price ?? '-'}</p>
                <p className="auction-end-time">
                  結束時間: {product.auctionEndTime 
                    ? new Date(product.auctionEndTime).toLocaleString('zh-TW') 
                    : '未設定'}
                </p>
                <button 
                  className="add-to-auction-button"
                >
                  加入競標
                </button>
              </>
            ) : (
              <>
                <p>價格: ${product.price ?? '-'}</p>
                <p className="average-rating">
                  ⭐ 評分: {product.averageRating?.toFixed(1) ?? '尚無評分'}
                </p>
                <button 
                  className="add-to-cart-button"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  加入購物車
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products


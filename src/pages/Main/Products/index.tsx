import './Products.css'
import { useGetAllProduct, useAddToCart, type Product } from '../../../api/generated'
import { useSearchParams } from 'react-router-dom'
import { useBlurSearch, useGetProductsByIds } from '../../../api/search'

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
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');
  const ragIdsParam = searchParams.get('ragIds');

  // 簡化：有 ragIds 就用 RAG，有 keyword 就用模糊搜尋，都沒有就顯示全部
  const ragIds = ragIdsParam ? ragIdsParam.split(',') : [];

  // 1. 全部商品
  const { data: allData, isLoading: isAllLoading, error: allError } = useGetAllProduct(
    { page, pageSize: 20 },
    { query: { enabled: !keyword && ragIds.length === 0 } }
  );

  // 2. 模糊搜尋
  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useBlurSearch(
    keyword || '',
    { query: { enabled: !!keyword && ragIds.length === 0 } }
  );

  // 3. RAG 搜尋
  const ragQueries = useGetProductsByIds(ragIds);
  const isRagLoading = ragIds.length > 0 && ragQueries.some(q => q.isLoading);
  const ragError = ragIds.length > 0 && ragQueries.find(q => q.error)?.error;

  // 整合 RAG 資料
  let ragData: { data: Product[] } | undefined;
  if (ragIds.length > 0) {
    const products = ragQueries
      .map(q => q.data?.data)
      .filter((p): p is Product => !!p);
    if (products.length > 0) {
      ragData = { data: products };
    }
  }

  // 決定顯示的資料和狀態
  const data = ragIds.length > 0 ? ragData : (keyword ? searchData : allData);
  const isLoading = ragIds.length > 0 
    ? (ragData === undefined && isRagLoading)
    : (keyword ? isSearchLoading : isAllLoading);
  const error = ragIds.length > 0 ? ragError : (keyword ? searchError : allError);

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
  if (error) {
    const errorMessage = (error as Error).message || '發生未知錯誤';
    return <div>載入失敗：{errorMessage}</div>;
  }

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
                <button className="add-to-auction-button">
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

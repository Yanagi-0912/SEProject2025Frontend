import './Products.css'
import { useGetAllProduct, useAddToCart, type Product } from '../../../api/generated'
import { useSearchParams } from 'react-router-dom'
import { useBlurSearch, useGetProductsByIds } from '../../../api/search'
import { useEffect } from 'react'

interface ProductItem {
  id: string;
  name: string;
  price?: number;
  image?: string;
  productType?: string;
  nowHighestBid?: number;
  auctionEndTime?: string;
  averageRating?: number;
  productCategory?: string;
  productStatus?: string;
}

interface ProductsProps {
  page: number;
  onProductClick?: (product: ProductItem) => void;
  onTotalPagesChange?: (totalPages: number) => void;
}

function Products({ page, onProductClick, onTotalPagesChange }: ProductsProps) {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');
  const ragIdsParam = searchParams.get('ragIds');
  const categoryParam = searchParams.get('category');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const minRatingParam = searchParams.get('minRating');

  // 簡化：有 ragIds 就用 RAG，有 keyword 就用模糊搜尋，都沒有就顯示全部
  const ragIds = ragIdsParam ? ragIdsParam.split(',') : [];
  const selectedCategory = categoryParam && categoryParam !== 'all' ? categoryParam : undefined;
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const minRating = minRatingParam ? Number(minRatingParam) : undefined;

  // 檢查是否有篩選條件
  const hasFilter = selectedCategory || minPrice !== undefined || maxPrice !== undefined || minRating !== undefined;
  
  // 1. 全部商品
  // 如果有篩選條件，載入所有商品（使用大 pageSize）以便前端篩選和分頁
  // 如果沒有篩選條件，使用後端分頁
  const { data: allData, isLoading: isAllLoading, error: allError } = useGetAllProduct(
    hasFilter ? { page: 1, pageSize: 1000 } : { page, pageSize: 20 },
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
  let products: ProductItem[] = data?.data 
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

  // 只顯示 ACTIVE 狀態的商品
  products = products.filter(product => product.productStatus === 'ACTIVE');

  // 根據分類篩選商品（只在有選擇分類時才篩選）
  if (selectedCategory) {
    products = products.filter(product => {
      // 檢查商品的分類是否符合選擇的分類
      return product.productCategory === selectedCategory;
    });
  }

  // 根據價格區間篩選商品（只在有設定價格時才篩選）
  if (minPrice !== undefined || maxPrice !== undefined) {
    products = products.filter(product => {
      // 對於拍賣商品，使用最高出價；對於一般商品，使用價格
      const productPrice = product.productType === 'AUCTION' 
        ? (product.nowHighestBid ?? product.price ?? 0)
        : (product.price ?? 0);
      
      // 檢查是否符合價格區間
      const meetsMinPrice = minPrice === undefined || productPrice >= minPrice;
      const meetsMaxPrice = maxPrice === undefined || productPrice <= maxPrice;
      
      return meetsMinPrice && meetsMaxPrice;
    });
  }

  // 根據評價篩選商品（只在有設定最低評價時才篩選）
  if (minRating !== undefined) {
    products = products.filter(product => {
      // 如果商品沒有評分，則不符合篩選條件
      if (product.averageRating === undefined || product.averageRating === null) {
        return false;
      }
      return product.averageRating >= minRating;
    });
  }

  // 前端分頁：計算總頁數和當前頁的商品
  const pageSize = 20;
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // 通知父組件總頁數變化
  useEffect(() => {
    if (onTotalPagesChange) {
      onTotalPagesChange(totalPages);
    }
  }, [totalPages, onTotalPagesChange]);

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
        {paginatedProducts.map(product => (
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

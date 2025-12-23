import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../../api/generated';
import { useAddToCart } from '../../../api/generated';
import './index.css';

interface ProductListProps {
	products: Product[];
	isLoading?: boolean;
	error?: Error | null;
}

export default function ProductList({ products, isLoading, error }: ProductListProps) {
	const navigate = useNavigate();
	const addToCartMutation = useAddToCart();

	const handleProductClick = (productId?: string) => {
		if (productId) {
			navigate(`/product/${productId}`);
		}
	};

	const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
		e.stopPropagation(); // 阻止事件冒泡
		
		if (!product.productID) {
			alert('商品ID無效');
			return;
		}
			
		try {
			await addToCartMutation.mutateAsync({
				data: {
					productId: product.productID,
					quantity: 1
				}
			});
			alert('成功加入購物車！');
		} catch (error) {
			console.error('加入購物車失敗:', error);
			alert('加入購物車失敗，請稍後再試');
		}
	};

	if (isLoading) {
		return <div className="product-list-loading">載入中...</div>;
	}

	if (error) {
		const errorMessage = error.message || '發生未知錯誤';
		return <div className="product-list-error">載入失敗：{errorMessage}</div>;
	}

	if (!products || products.length === 0) {
		return <div className="product-list-empty">目前沒有商品</div>;
	}

	// 排序：已售出的商品排到最底下
	const sortedProducts = [...products].sort((a, b) => {
		const aIsSold = a.productStatus === 'SOLD';
		const bIsSold = b.productStatus === 'SOLD';
		if (aIsSold && !bIsSold) return 1; // a 是已售出，b 不是，a 排後面
		if (!aIsSold && bIsSold) return -1; // a 不是已售出，b 是，b 排後面
		return 0; // 其他情況保持原順序
	});

	return (
		<div className="product-list-container">
			<div className="product-list-grid">
				{sortedProducts.map(product => {
					const isSold = product.productStatus === 'SOLD';
					return (
					<div 
						key={product.productID} 
						className={`product-list-card ${isSold ? 'product-sold' : ''}`}
						onClick={() => handleProductClick(product.productID)}
					>
						<img 
							src={product.productImage || `https://picsum.photos/300/300?random=${product.productID}`} 
							alt={product.productName || '商品圖片'} 
							className="product-list-card-image"
						/>
						<h4>{product.productName || '未命名商品'}</h4>
						
						{product.productType === 'AUCTION' ? (
							<>
								<p className="highest-bid">目前最高出價: ${product.nowHighestBid ?? product.productPrice ?? '-'}</p>
								{product.auctionEndTime && (
									<p className="auction-end-time">
										結束時間: {new Date(product.auctionEndTime).toLocaleString('zh-TW')}
									</p>
								)}
								<button className="add-to-auction-button">
									加入競標
								</button>
							</>
						) : (
							<>
								<p>價格: ${product.productPrice ?? '-'}</p>
								{product.averageRating !== undefined && (
									<p className="average-rating">
										⭐ 評分: {product.averageRating.toFixed(1)}
									</p>
								)}
								<button 
									className="add-to-cart-button"
									onClick={(e) => handleAddToCart(product, e)}
									disabled={addToCartMutation.isPending || product.productStatus !== 'ACTIVE'}
								>
									{addToCartMutation.isPending ? '加入中...' : '加入購物車'}
								</button>
							</>
						)}
						
						{product.productStatus && (
							<div className={`product-status ${isSold ? 'product-status-sold' : ''}`}>
								狀態: {
									product.productStatus === 'ACTIVE' ? '上架中' :
									product.productStatus === 'INACTIVE' ? '已下架' :
									product.productStatus === 'SOLD' ? '已售出' :
									product.productStatus === 'BANNED' ? '已封禁' :
									product.productStatus === 'TERMINATE' ? '已終止' :
									product.productStatus
								}
							</div>
						)}
					</div>
					);
				})}
			</div>
		</div>
	);
}


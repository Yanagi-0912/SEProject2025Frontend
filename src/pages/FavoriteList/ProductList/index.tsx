import type { FavoriteItemDTO } from '../../../api/generated'
import { useAddToCart, useRemoveFromFavorites } from '../../../api/generated'
import '../FavoriteList.css'

interface ProductListProps {
	items: FavoriteItemDTO[];
	userId?: string;
}

export default function ProductList({ items, userId }: ProductListProps) {
	const addToCartMutation = useAddToCart()
	const removeFavMutation = useRemoveFromFavorites()

	const handleAddToCart = async (productId?: string) => {
		if (!productId) return alert('商品 ID 無效')
		try {
			await addToCartMutation.mutateAsync({ data: { productId, quantity: 1 } })
			alert('已加入購物車')
		} catch (err) {
			console.error('加入購物車失敗', err)
			alert('加入購物車失敗')
		}
	}

	const handleRemoveFavorite = async (productId?: string) => {
		if (!productId) return
		if (!userId) {
			alert('請先登入')
			return
		}

		try {
			await removeFavMutation.mutateAsync({ userId, productId })
			alert('已從最愛移除')
			// 簡單方式：重新整理頁面，父元件可改為 refetch
			window.location.reload()
		} catch (err) {
			console.error('移除最愛失敗', err)
			alert('移除最愛失敗')
		}
	}

	if (!items || items.length === 0) return <div>目前沒有最愛商品</div>

	return (
		<div className="fav-grid">
			{items.map(it => (
				<div key={it.productId} className="fav-card">
					{it.productImage ? (
						<img src={it.productImage} alt={it.productName} className="fav-image" />
					) : (
						<div className="fav-image-placeholder">沒有圖片</div>
					)}

					<h4 className="fav-title">{it.productName ?? '未命名商品'}</h4>
					<div className="fav-seller">{it.sellerName ? `賣家：${it.sellerName}` : null}</div>
					<div className="fav-meta">
						<div className="fav-price">${it.productPrice ?? 0}</div>
						<div className="fav-status">{it.productStatus === 'ACTIVE' ? '上架' : (it.productStatus ?? '')}</div>
					</div>

					<div className="fav-actions">
						<button onClick={() => handleAddToCart(it.productId)} className="fav-btn" disabled={addToCartMutation.isPending}>
							{addToCartMutation.isPending ? '加入中...' : '加入購物車'}
						</button>
						<button onClick={() => handleRemoveFavorite(it.productId)} className="fav-btn secondary" disabled={removeFavMutation.isPending}>
							移除
						</button>
					</div>
				</div>
			))}
		</div>
	)
}
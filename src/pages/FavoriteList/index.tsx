import Header from '../Main/Header'
import ProductList from './ProductList'
import Search from './Search'
import './FavoriteList.css'
import { useGetCurrentUser, useGetUserFavorites, useGetFavoritesCount, useClearFavorites } from '../../api/generated'
import type { FavoriteItemDTO } from '../../api/generated'
import { useState, useMemo } from 'react'

export default function FavoriteList() {
	const { data: userResp } = useGetCurrentUser()
	const currentUserId = userResp?.data?.id

	const favoritesQuery = useGetUserFavorites(currentUserId ?? '', {
		query: { enabled: !!currentUserId }
	})
	const favoritesCountQuery = useGetFavoritesCount(currentUserId ?? '', {
		query: { enabled: !!currentUserId }
	})
	const clearFavoritesMutation = useClearFavorites()

	const [keyword, setKeyword] = useState('')
	const [sort, setSort] = useState<'priceAsc' | 'priceDesc' | 'addedAt'>('addedAt')
	const [filter, setFilter] = useState<'ALL' | 'DIRECT' | 'AUCTION'>('ALL')

	const filtered = useMemo(() => {
		const items = (favoritesQuery.data?.data?.items ?? []) as FavoriteItemDTO[]
		let list = items.slice()
		if (keyword.trim()) {
			const k = keyword.trim().toLowerCase()
			list = list.filter((i: FavoriteItemDTO) => (i.productName ?? '').toLowerCase().includes(k))
		}

		if (filter !== 'ALL') {
			list = list.filter((i: FavoriteItemDTO) => (i.productType ?? '') === filter)
		}

		if (sort === 'priceAsc') list.sort((a: FavoriteItemDTO, b: FavoriteItemDTO) => (a.productPrice ?? 0) - (b.productPrice ?? 0))
		else if (sort === 'priceDesc') list.sort((a: FavoriteItemDTO, b: FavoriteItemDTO) => (b.productPrice ?? 0) - (a.productPrice ?? 0))

		return list
	}, [favoritesQuery.data, keyword, sort, filter])

	const handleClearAll = async () => {
		if (!currentUserId) {
			alert('請先登入')
			return
		}

		if (!confirm('確定要清除所有收藏嗎？')) {
			return
		}

		try {
			await clearFavoritesMutation.mutateAsync({
				userId: currentUserId
			})
			alert('已清除所有收藏')
			favoritesQuery.refetch()
			favoritesCountQuery.refetch()
		} catch (error) {
			console.error('清除收藏失敗:', error)
			alert('清除收藏失敗，請稍後再試')
		}
	}

	return (
		<div>
			<Header showSearch={false} />
			<div className="fav-container">
				<div className="fav-header">
					<h2>我的最愛 ({String(favoritesCountQuery.data?.data ?? 0)})</h2>
					<button 
						onClick={handleClearAll}
						disabled={clearFavoritesMutation.isPending || (filtered.length === 0)}
						className="clear-all-btn"
					>
						{clearFavoritesMutation.isPending ? '清除中...' : '清除全部'}
					</button>
				</div>
				<Search
					onSearch={(k) => setKeyword(k)}
					onSort={(s) => setSort(s)}
					onFilter={(f) => setFilter(f)}
				/>

				{favoritesQuery.isLoading ? (
					<div>載入中...</div>
				) : favoritesQuery.isError ? (
					<div>讀取失敗</div>
				) : (
					<ProductList items={filtered} userId={currentUserId} />
				)}
			</div>
		</div>
	)
}

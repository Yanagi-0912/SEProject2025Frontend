import Header from '../Main/Header'
import ProductList from './ProductList'
import Search from './Search'
import './FavoriteList.css'
import { useGetCurrentUser, useGetUserFavorites } from '../../api/generated'
import type { FavoriteItemDTO } from '../../api/generated'
import { useState, useMemo } from 'react'

export default function FavoriteList() {
	const { data: userResp } = useGetCurrentUser()
	const currentUserId = userResp?.data?.id

	const favoritesQuery = useGetUserFavorites(currentUserId ?? '')


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

	return (
		<div>
			<Header />
			<div className="fav-container">
				<h2>我的最愛</h2>
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

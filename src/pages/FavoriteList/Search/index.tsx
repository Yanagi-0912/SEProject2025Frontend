import { useState } from 'react'

interface SearchProps {
  onSearch?: (keyword: string) => void
  onSort?: (sort: 'priceAsc' | 'priceDesc' | 'addedAt') => void
  onFilter?: (filter: 'ALL' | 'DIRECT' | 'AUCTION') => void
}

export default function Search({ onSearch, onSort, onFilter }: SearchProps) {
  const [keyword, setKeyword] = useState('')

  return (
    <div className="fav-search-row">
      <input
        type="text"
        placeholder="搜尋最愛商品"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch?.(keyword) }}
        className="fav-search-input"
      />

      <button onClick={() => onSearch?.(keyword)} className="fav-btn">搜尋</button>

      <select onChange={(e) => onSort?.(e.target.value as 'priceAsc' | 'priceDesc' | 'addedAt')} defaultValue="addedAt" className="fav-search-input">
        <option value="addedAt">依加入時間</option>
        <option value="priceAsc">價格：由低到高</option>
        <option value="priceDesc">價格：由高到低</option>
      </select>

      <select onChange={(e) => onFilter?.(e.target.value as 'ALL' | 'DIRECT' | 'AUCTION')} defaultValue="ALL" className="fav-search-input">
        <option value="ALL">全部</option>
        <option value="DIRECT">直購</option>
        <option value="AUCTION">競標</option>
      </select>
    </div>
  )
}
//搜尋欄、排序(價格/更新時間)、篩選(直購/拍賣/全部)
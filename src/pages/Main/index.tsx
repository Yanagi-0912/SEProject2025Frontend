import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Filter from './Filter'
import Header from './Header'
import Products from './Products'
import Pagination from './Pagination'
import './Main.css'

function Main() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  const [totalPages, setTotalPages] = useState(10)
  const prevFilterKeyRef = useRef<string>('')

  // 生成篩選條件的唯一 key，用於檢測篩選是否改變
  const getFilterKey = () => {
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const minRating = searchParams.get('minRating') || ''
    const keyword = searchParams.get('keyword') || ''
    const ragIds = searchParams.get('ragIds') || ''
    return `${category}-${minPrice}-${maxPrice}-${minRating}-${keyword}-${ragIds}`
  }

  // 當篩選條件改變時，記錄篩選 key
  useEffect(() => {
    const currentFilterKey = getFilterKey()
    if (prevFilterKeyRef.current !== currentFilterKey && prevFilterKeyRef.current !== '') {
      // 篩選條件改變了，但先不重置頁碼，等待 totalPages 更新
      // 如果當前頁在有效範圍內，應該保持在當前頁
    }
    prevFilterKeyRef.current = currentFilterKey
  }, [searchParams.toString()])

  // 當總頁數更新後，檢查當前頁是否還有結果
  // 如果當前頁超過總頁數，才重置到第一頁
  // 如果當前頁在有效範圍內（1 <= page <= totalPages），保持在當前頁
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(1)
    }
    // 如果 page <= totalPages，保持在當前頁（不需要做任何事）
  }, [totalPages, page])

  return (
    <div className="main-container">
      <Header />

      {/* 手機版篩選按鈕 */}
      <button 
        className="mobile-filter-toggle"
        onClick={() => setShowFilter(!showFilter)}
      >
        {showFilter ? '收起篩選 ▲' : '展開篩選 ▼'}
      </button>

      <div className="main-content">
        <div className={`main-sidebar ${showFilter ? 'show' : ''}`}>
          <Filter />
        </div>
        <div className="main-products">
          <Products
            page={page}
            onProductClick={(p: { id?: string | number; productID?: string | number }) => {
              const id = p.id ?? p.productID ?? null
              if (id) navigate(`/product/${id}`)
            }}
            onTotalPagesChange={setTotalPages}
          />
          <Pagination page={page} total={totalPages} setPage={setPage} />
        </div>
      </div>
    </div>
  )
}

export default Main
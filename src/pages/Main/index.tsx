import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Filter from './Filter'
import Header from './Header'
import Products from './Products'
import Pagination from './Pagination'
import './Main.css'

function Main() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  const [totalPages, setTotalPages] = useState(10)

  // 當總頁數更新後，檢查當前頁是否還有結果
  // 如果當前頁超過總頁數，才重置到第一頁
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
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
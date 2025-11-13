import { useState } from 'react'
import './Filter.css'

function Filter() {
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedReview, setSelectedReview] = useState('all')
  const [showAllDepartments, setShowAllDepartments] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(50000)

  const departments = [
    { id: 'all', label: '全部' },
    { id: 'devices', label: '電子裝置與配件' },
    { id: 'baby', label: '嬰兒用品' },
    { id: 'bags', label: '包包、錢包與行李箱' },
    { id: 'beauty', label: '美妝保養' },
    { id: 'books', label: '書籍' },
    { id: 'electronics', label: '電子產品' },
    { id: 'fashion', label: '時尚服飾' }
  ]

  const brands = [
    { id: 'brand1', label: '品牌一' },
    { id: 'brand2', label: '品牌二' },
    { id: 'brand3', label: '品牌三' },
    { id: 'brand4', label: '品牌四' },
    { id: 'brand5', label: '品牌五' },
    { id: 'brand6', label: '品牌六' }
  ]

  const displayedDepartments = showAllDepartments ? departments : departments.slice(0, 5)
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 4)

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`
  }

  return (
    <div className="filter-container">
      {/* Department Section */}
      <div className="filter-section">
        <h3 className="filter-title">分類</h3>
        {displayedDepartments.map(dept => (
          <div key={dept.id} className="filter-option">
            <input
              type="radio"
              id={dept.id}
              name="department"
              checked={selectedDepartment === dept.id}
              onChange={() => setSelectedDepartment(dept.id)}
            />
            <label htmlFor={dept.id}>{dept.label}</label>
          </div>
        ))}
        {departments.length > 5 && (
          <button 
            className="see-more-button"
            onClick={() => setShowAllDepartments(!showAllDepartments)}
          >
            <span className="see-more-icon">▼</span>
            {showAllDepartments ? '顯示較少' : '顯示更多'}
          </button>
        )}
      </div>

      {/* Brands Section */}
      <div className="filter-section">
        <h3 className="filter-title">品牌</h3>
        {displayedBrands.map(brand => (
          <div key={brand.id} className="filter-option">
            <input
              type="checkbox"
              id={brand.id}
              checked={selectedBrands.includes(brand.id)}
              onChange={() => handleBrandToggle(brand.id)}
            />
            <label htmlFor={brand.id}>{brand.label}</label>
          </div>
        ))}
        {brands.length > 4 && (
          <button 
            className="see-more-button"
            onClick={() => setShowAllBrands(!showAllBrands)}
          >
            <span className="see-more-icon">▼</span>
            {showAllBrands ? '顯示較少' : '顯示更多'}
          </button>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="filter-section">
        <h3 className="filter-title">顧客評價</h3>
        <div className="filter-option">
          <input
            type="radio"
            id="review-all"
            name="review"
            checked={selectedReview === 'all'}
            onChange={() => setSelectedReview('all')}
          />
          <label htmlFor="review-all">全部</label>
        </div>
        <div className="filter-option">
          <input
            type="radio"
            id="review-4up"
            name="review"
            checked={selectedReview === '4up'}
            onChange={() => setSelectedReview('4up')}
          />
          <label htmlFor="review-4up">
            <span className="star-rating">
              <span className="star">★</span>
              <span className="star">★</span>
              <span className="star">★</span>
              <span className="star">★</span>
              <span className="star empty">☆</span>
            </span>
            <span className="and-up-text">以上</span>
          </label>
        </div>
      </div>

      {/* Price Section */}
      <div className="filter-section">
        <h3 className="filter-title">價格</h3>
        <div className="price-range-display">
          {formatPrice(minPrice)} – {formatPrice(maxPrice)}
        </div>
        <div className="price-slider-container">
          <input
            type="range"
            min="0"
            max="50000"
            value={minPrice}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (value < maxPrice - 1000) {
                setMinPrice(value)
              }
            }}
            className="price-range-input min"
            aria-label="最低價格"
          />
          <input
            type="range"
            min="0"
            max="50000"
            value={maxPrice}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (value > minPrice + 1000) {
                setMaxPrice(value)
              }
            }}
            className="price-range-input max"
            aria-label="最高價格"
          />
          <div className="price-slider-track"></div>
        </div>
      </div>
    </div>
  )
}

export default Filter

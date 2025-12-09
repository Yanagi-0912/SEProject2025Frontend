import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGetCategories } from '../../../api/category'
import './Filter.css'

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 從 URL 讀取分類參數
  const categoryFromUrl = searchParams.get('category');
  const [selectedDepartment, setSelectedDepartment] = useState(categoryFromUrl || 'all')
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedReview, setSelectedReview] = useState('all')
  const [showAllDepartments, setShowAllDepartments] = useState(false)
  const [showAllBrands, setShowAllBrands] = useState(false)
  
  // 從 API 取得分類列表
  const { data: categories = [] } = useGetCategories<string[]>();
  
  // 從 URL 讀取價格參數
  const minPriceFromUrl = searchParams.get('minPrice');
  const maxPriceFromUrl = searchParams.get('maxPrice');
  
  const [minPrice, setMinPrice] = useState<string>(minPriceFromUrl || '')
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceFromUrl || '')

  // 當分類改變時，更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedDepartment && selectedDepartment !== 'all') {
      params.set('category', selectedDepartment);
    } else {
      params.delete('category');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment]);

  // 當價格改變時，更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (minPrice && minPrice.trim() !== '') {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    if (maxPrice && maxPrice.trim() !== '') {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  // 將 API 回傳的分類轉換為元件需要的格式
  const departments = [
    { id: 'all', label: '全部' },
    ...categories.map(category => ({
      id: category,
      label: category
    }))
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
        <div className="price-input-container">
          <div className="price-input-group">
            <label htmlFor="min-price-input">最低價格</label>
            <input
              type="number"
              id="min-price-input"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
              }}
              className="price-input"
              placeholder="最低價格"
            />
          </div>
          <div className="price-separator">–</div>
          <div className="price-input-group">
            <label htmlFor="max-price-input">最高價格</label>
            <input
              type="number"
              id="max-price-input"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
              }}
              className="price-input"
              placeholder="最高價格"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filter

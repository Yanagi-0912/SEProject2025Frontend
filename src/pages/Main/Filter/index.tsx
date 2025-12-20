import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGetCategories } from '../../../api/category'
import './Filter.css'

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 從 URL 讀取分類參數
  const categoryFromUrl = searchParams.get('category');
  const [selectedDepartment, setSelectedDepartment] = useState(categoryFromUrl || 'all')
  
  // 從 URL 讀取評價參數
  const minRatingFromUrl = searchParams.get('minRating');
  const [selectedReview, setSelectedReview] = useState(minRatingFromUrl === '4' ? '4up' : 'all')
  const [showAllDepartments, setShowAllDepartments] = useState(false)
  
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

  // 當評價篩選改變時，更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedReview === '4up') {
      params.set('minRating', '4');
    } else {
      params.delete('minRating');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReview]);

  // 將 API 回傳的分類轉換為元件需要的格式（不包含「全部」選項）
  const departments = categories.map(category => ({
    id: category,
    label: category
  }))

  const displayedDepartments = showAllDepartments ? departments : departments.slice(0, 5)

  // 處理分類點擊：再次點擊相同分類則取消選擇（回到全部）
  const handleDepartmentClick = (deptId: string) => {
    if (selectedDepartment === deptId) {
      setSelectedDepartment('all')  // 取消選擇，回到全部
    } else {
      setSelectedDepartment(deptId)
    }
  }

  // 處理評價點擊：再次點擊則取消選擇
  const handleReviewClick = () => {
    if (selectedReview === '4up') {
      setSelectedReview('all')  // 取消選擇
    } else {
      setSelectedReview('4up')
    }
  }


  return (
    <div className="filter-container">
      {/* Department Section */}
      <div className="filter-section">
        <h3 className="filter-title">分類</h3>
        {displayedDepartments.map(dept => (
          <div 
            key={dept.id} 
            className="filter-option"
            onClick={() => handleDepartmentClick(dept.id)}
          >
            <input
              type="radio"
              id={dept.id}
              name="department"
              checked={selectedDepartment === dept.id}
              onChange={() => {}}
              readOnly
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

      {/* Customer Reviews Section */}
      <div className="filter-section">
        <h3 className="filter-title">顧客評價</h3>
        <div 
          className="filter-option"
          onClick={handleReviewClick}
        >
          <input
            type="radio"
            id="review-4up"
            name="review"
            checked={selectedReview === '4up'}
            onChange={() => {}}
            readOnly
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

import { useState } from 'react'
import './Terms.css'

function Terms() {
  const [showTerms, setShowTerms] = useState(false)

  return (
    <div className="terms-container">
      <button 
        onClick={() => setShowTerms(!showTerms)}
        className="terms-toggle-button"
      >
        {showTerms ? '收起使用條款' : '使用條款'}
      </button>

      {showTerms && (
        <div className="terms-content">
          <h3>使用說明</h3>
          <ul>
            <li>每筆訂單限用一張優惠券</li>
            <li>優惠券適用於整筆訂單</li>
            <li>拍賣商品不適用</li>
            <li>買一送一限 $500 以下商品</li>
            <li>請於到期日前使用</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Terms

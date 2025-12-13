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
          <h3>使用條款</h3>
          <ul>
            <li>手動發放：透過 API (POST /api/userCoupon/issue)</li>
            <li>自動發放：節日排程（HolidayCouponScheduler）</li>
            <li>自動發放：首購優惠（issueCouponsAfterPay）</li>
            <li>所有優惠券有效期限：7天（過期自動刪除）</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Terms

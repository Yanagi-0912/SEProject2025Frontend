import { useState } from 'react'

function Terms() {
  const [showTerms, setShowTerms] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setShowTerms(!showTerms)}
        style={{ 
          backgroundColor: 'none',
          border: 'none',
          padding: '10px 20px', 
          fontSize: '1rem',
          marginBottom: '10px',
          cursor: 'pointer'
        }}
      >
        {showTerms ? '收起優惠條款' : '優惠條款'}
      </button>

      {showTerms && (
        <div style={{ padding: '10px', marginTop: '10px' }}>
          <h3>條款</h3>
          <ul>
            <li>元旦、情人節、國慶、聖誕節等重大節日自動發放優惠券</li>
            <li>消費達 $1,000 自動獲得滿千折百優惠券</li>
            <li>新會員首次登入自動獲得歡迎優惠券</li>
            <li>轉輪盤可以無限次抽獎（開發階段）</li>
            <li>優惠券數量上限：1000張</li>
            <li>所有優惠券有效期限：7天（過期自動刪除）</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Terms


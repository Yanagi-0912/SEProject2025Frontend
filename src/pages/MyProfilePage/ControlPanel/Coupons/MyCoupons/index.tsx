import { useState } from 'react'

interface Coupon {
  id: string
  name: string
  discount: string
  color: string
  obtainedDate: string
  expiryDate: string
}

interface MyCouponsProps {
  coupons: Coupon[]
}

function MyCoupons({ coupons }: MyCouponsProps) {
  const [showCoupons, setShowCoupons] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setShowCoupons(!showCoupons)}
        style={{ 
          padding: '10px 20px', 
          fontSize: '1rem',
          marginBottom: '10px',
          cursor: 'pointer'
        }}
      >
        {showCoupons ? '收起優惠券列表' : `優惠券（${coupons.length}）`}
      </button>

      {showCoupons && (
        <div style={{ border: '2px solid #ccc', padding: '10px', marginTop: '10px' }}>
          
            <div>
              <p>總共有 {coupons.length} 張優惠券</p>
              {coupons.map((coupon) => (
                <div key={coupon.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                  <h3>{coupon.name}</h3>
                  <p>折扣：{coupon.discount}</p>
                  <p>獲得：{coupon.obtainedDate}</p>
                  <p>到期：{coupon.expiryDate}</p>
                </div>
              ))}
            </div>
        </div>
      )}
    </div>
  )
}

export default MyCoupons

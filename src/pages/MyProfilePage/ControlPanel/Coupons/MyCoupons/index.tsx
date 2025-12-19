import { useState } from 'react'
import './MyCoupons.css'

interface Coupon {
  id: string
  name: string
  discount: string
  color: string
  obtainedDate: string
  expiryDate: string
  quantity?: number
}

interface MyCouponsProps {
  coupons: Coupon[]
}

function MyCoupons({ coupons }: MyCouponsProps) {
  const [showCoupons, setShowCoupons] = useState(false)
  const totalQuantity = coupons.reduce((sum, coupon) => sum + (coupon.quantity || 1), 0)

  return (
    <div className="my-coupons-container">
      <button 
        className="my-coupons-toggle"
        onClick={() => setShowCoupons(!showCoupons)}
      >
        {showCoupons ? '收起優惠券列表' : `優惠券（${totalQuantity}）`}
      </button>

      {showCoupons && (
        <div className="my-coupons-list">
          <p className="my-coupons-total">總共有 {totalQuantity} 張優惠券</p>
          
          {coupons.map((coupon) => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-info">
                <h3 className="coupon-name">
                  {coupon.name}
                  {coupon.quantity && coupon.quantity > 1 && (
                    <span className="coupon-quantity"> x{coupon.quantity}</span>
                  )}
                </h3>
                <p className="coupon-discount">{coupon.discount}</p>
              </div>
              <div className="coupon-dates">
                <div>到期：{coupon.expiryDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCoupons

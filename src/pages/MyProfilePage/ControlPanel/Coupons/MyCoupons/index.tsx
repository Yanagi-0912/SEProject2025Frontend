import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [showCoupons, setShowCoupons] = useState(false)
  const totalQuantity = coupons.reduce((sum, coupon) => sum + (coupon.quantity || 1), 0)

  const handleUseCoupon = (couponId: string) => {
    // 導航到購物車頁面，帶上優惠券 ID
    navigate(`/cart?couponId=${couponId}`)
  }

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
              <div className="coupon-actions">
                <div className="coupon-dates">
                  <div>到期：{coupon.expiryDate}</div>
                </div>
                <button 
                  className="use-coupon-btn"
                  onClick={() => handleUseCoupon(coupon.id)}
                >
                  使用
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCoupons

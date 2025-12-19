import React, { useState, useEffect } from 'react'
import { getUserCouponsByUserId } from '../../../api/coupon'
import { getAllCoupons, useGetCurrentUser, type Coupon as ApiCoupon } from '../../../api/generated'
import './index.css'

interface UserCoupon {
  id: string  // UserCoupon ID（結帳時要用這個）
  couponID: string  // Coupon 模板 ID
  remainingUsage: number
  expireTime: string
  getTime: string
}

interface OrderItem {
  id: string
  name?: string
  price: number
  quantity: number
  stock?: number  // 庫存（買一送一需要檢查）
}

interface CouponSelectorProps {
  productTotal: number  // 商品總價
  shippingFee: number   // 運費（預設 100 元）
  orderType: 'DIRECT' | 'AUCTION'
  orderItems: OrderItem[]  // 訂單商品列表（買一送一需要）
  onCouponSelect: (userCoupon: UserCoupon | null, discountAmount: number, isFreeship: boolean, buyOneGetOneItem?: OrderItem) => void
}

const CouponSelector: React.FC<CouponSelectorProps> = ({
  productTotal,
  shippingFee,
  orderType,
  orderItems,
  onCouponSelect
}) => {
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([])
  const [couponTemplates, setCouponTemplates] = useState<Map<string, ApiCoupon>>(new Map())
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  const { data: userData } = useGetCurrentUser()
  const userId = userData?.data?.id

  // 總價 = 商品總價 + 運費（後端邏輯）
  const totalPrice = productTotal + shippingFee

  // 載入優惠券資料
  useEffect(() => {
    const loadCoupons = async () => {
      if (!userId) return

      try {
        setLoading(true)
        
        // 載入優惠券模板
        const templatesRes = await getAllCoupons()
        const templates = Array.isArray(templatesRes.data) ? templatesRes.data : []
        const templateMap = new Map<string, ApiCoupon>()
        templates.forEach(t => {
          if (t.couponID) templateMap.set(t.couponID, t)
        })
        setCouponTemplates(templateMap)

        // 載入使用者優惠券
        const userCouponsRes = await getUserCouponsByUserId(userId)
        
        // 篩選可用優惠券
        const availableCoupons = userCouponsRes.filter(uc => {
          const isValid = uc.remainingUsage > 0 && new Date(uc.expireTime) > new Date()
          if (!isValid) return false

          const template = templateMap.get(uc.couponID)
          if (!template) return false

          // 檢查最低消費金額（後端用 totalPrice 含運費檢查）
          if (template.minPurchaseAmount && totalPrice < template.minPurchaseAmount) {
            return false
          }

          // 買一送一：必須有符合條件的商品（價格 ≤ 500）
          if (template.discountType === 'BUY_ONE_GET_ONE') {
            const hasEligibleItem = orderItems.some(item => item.price <= 500)
            if (!hasEligibleItem) return false
          }

          return true
        })

        setUserCoupons(availableCoupons)
      } catch {
        // 忽略錯誤
      } finally {
        setLoading(false)
      }
    }

    loadCoupons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, totalPrice])

  // 買一送一：找出符合條件的商品（價格 ≤ 500，選最高價，庫存足夠）
  const findBuyOneGetOneItem = (): { item: OrderItem | null; discount: number } => {
    const MAX_PRICE = 500
    let bestItem: OrderItem | null = null
    let bestPrice = 0

    for (const item of orderItems) {
      // 條件：價格 ≤ 500，且庫存足夠（需要 quantity + 1）
      const requiredStock = item.quantity + 1
      const hasEnoughStock = item.stock === undefined || item.stock === null || item.stock >= requiredStock
      
      if (item.price <= MAX_PRICE && item.price > bestPrice && hasEnoughStock) {
        bestPrice = item.price
        bestItem = item
      }
    }

    return { item: bestItem, discount: bestItem ? bestItem.price : 0 }
  }

  // 計算折扣金額（根據後端邏輯）
  const calculateDiscount = (coupon: UserCoupon): { 
    amount: number
    isFreeship: boolean
    buyOneGetOneItem?: OrderItem | null
  } => {
    const template = couponTemplates.get(coupon.couponID)
    if (!template) return { amount: 0, isFreeship: false }

    switch (template.discountType) {
      case 'PERCENT':
        // 百分比折扣：對總價（含運費）計算
        return { 
          amount: Math.round(totalPrice * (template.discountValue || 0)), 
          isFreeship: false 
        }
      case 'FIXED':
        // 固定金額折扣
        return { 
          amount: Math.min(template.discountValue || 0, totalPrice), 
          isFreeship: false 
        }
      case 'FREESHIP':
        // 免運：折扣金額 = 運費
        return { 
          amount: shippingFee, 
          isFreeship: true 
        }
      case 'BUY_ONE_GET_ONE': {
        // 買一送一：折扣 = 符合條件的最高價商品
        const { item, discount } = findBuyOneGetOneItem()
        return { 
          amount: discount, 
          isFreeship: false,
          buyOneGetOneItem: item
        }
      }
      default:
        return { amount: 0, isFreeship: false }
    }
  }

  // 取得優惠券顯示名稱
  const getCouponName = (coupon: UserCoupon): string => {
    const template = couponTemplates.get(coupon.couponID)
    return template?.couponName || coupon.couponID
  }

  // 取得折扣描述
  const getDiscountDesc = (coupon: UserCoupon): string => {
    const template = couponTemplates.get(coupon.couponID)
    if (!template) return ''

    switch (template.discountType) {
      case 'PERCENT':
        return `${((template.discountValue || 0) * 100).toFixed(0)}% OFF`
      case 'FIXED':
        return `$${template.discountValue} OFF`
      case 'FREESHIP':
        return '免運費'
      case 'BUY_ONE_GET_ONE': {
        const { item } = findBuyOneGetOneItem()
        if (item) {
          return `買一送一 (${item.name || '商品'})`
        }
        return '買一送一'
      }
      default:
        return ''
    }
  }

  // 處理選擇優惠券
  const handleSelect = (coupon: UserCoupon | null) => {
    setSelectedCoupon(coupon)
    setShowDropdown(false)
    
    if (coupon) {
      const { amount, isFreeship, buyOneGetOneItem } = calculateDiscount(coupon)
      onCouponSelect(coupon, amount, isFreeship, buyOneGetOneItem || undefined)
    } else {
      onCouponSelect(null, 0, false, undefined)
    }
  }

  // 拍賣商品不適用優惠券
  if (orderType === 'AUCTION') {
    return (
      <div className="coupon-selector">
        <div className="coupon-selector-label">優惠券</div>
        <div className="coupon-selector-disabled">拍賣商品不適用優惠券</div>
      </div>
    )
  }

  return (
    <div className="coupon-selector">
      <div className="coupon-selector-label">優惠券</div>
      
      <div className="coupon-selector-wrapper">
        <button 
          className="coupon-selector-btn"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={loading}
        >
          {loading ? '載入中...' : (
            selectedCoupon ? (
              <span className="coupon-selected">
                {getCouponName(selectedCoupon)} (-${calculateDiscount(selectedCoupon).amount})
              </span>
            ) : (
              userCoupons.length > 0 ? '選擇優惠券' : '無可用優惠券'
            )
          )}
        </button>

        {showDropdown && (
          <div className="coupon-dropdown">
            <div 
              className={`coupon-option ${!selectedCoupon ? 'selected' : ''}`}
              onClick={() => handleSelect(null)}
            >
              不使用優惠券
            </div>
            
            {userCoupons.map(coupon => (
              <div 
                key={coupon.id}
                className={`coupon-option ${selectedCoupon?.id === coupon.id ? 'selected' : ''}`}
                onClick={() => handleSelect(coupon)}
              >
                <div className="coupon-option-name">{getCouponName(coupon)}</div>
                <div className="coupon-option-discount">
                  {getDiscountDesc(coupon)} (-${calculateDiscount(coupon).amount})
                </div>
              </div>
            ))}

            {userCoupons.length === 0 && (
              <div className="coupon-option-empty">沒有可用的優惠券</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CouponSelector

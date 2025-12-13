import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SpinWheel from './SpinWheel'
import MyCoupons from './MyCoupons'
import Terms from './Terms'
import { createCoupon, getUserCoupons } from '../../../../api/coupon'

interface Coupon {
  id: string
  name: string
  discount: string
  color: string
  obtainedDate: string
  expiryDate: string
}

function Coupons() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 取得使用者名稱（如果有登入的話）
    const savedUsername = localStorage.getItem('username')
    setUsername(savedUsername || '訪客')

    // 從 API 載入使用者的優惠券
    loadUserCoupons()

    // 模擬總消費金額（實際應該從後端取得）
    const savedSpent = localStorage.getItem('totalSpent')
    setTotalSpent(savedSpent ? parseInt(savedSpent) : 0)
  }, [])

  // 從 API 載入使用者的優惠券
  const loadUserCoupons = async () => {
    try {
      setLoading(true)
      const userCoupons = await getUserCoupons()
      
      // 轉換 API 回傳的格式為組件需要的格式
      const convertedCoupons: Coupon[] = userCoupons
        .filter(coupon => {
          // 過濾掉已過期的優惠券
          const expiryDate = new Date(coupon.expireTime)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          expiryDate.setHours(0, 0, 0, 0)
          return expiryDate >= today && !coupon.isUsed
        })
        .map(coupon => {
          // 格式化折扣顯示
          let discountDisplay = ''
          if (coupon.discountType === 'PERCENT') {
            discountDisplay = `${(coupon.discountValue * 100).toFixed(0)}% OFF`
          } else if (coupon.discountType === 'FIXED') {
            discountDisplay = `$${coupon.discountValue} OFF`
          } else if (coupon.discountType === 'FREESHIP') {
            discountDisplay = 'FREE SHIP'
          } else if (coupon.discountType === 'BUY_ONE_GET_ONE') {
            discountDisplay = 'BUY 1 GET 1'
          }

          return {
            id: coupon.couponID,
            name: coupon.couponName,
            discount: discountDisplay,
            color: '#4ECDC4', // 預設顏色
            obtainedDate: coupon.obtainedTime 
              ? new Date(coupon.obtainedTime).toLocaleDateString('zh-TW')
              : new Date().toLocaleDateString('zh-TW'),
            expiryDate: new Date(coupon.expireTime).toLocaleDateString('zh-TW')
          }
        })

      setMyCoupons(convertedCoupons)
    } catch (error) {
      console.error('載入優惠券失敗:', error)
      alert('載入優惠券失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }


  const handleWin = async (coupon: { 
    id: string
    name: string
    discount: string
    color: string
    discountType: 'PERCENT' | 'FIXED' | 'FREESHIP' | 'BUY_ONE_GET_ONE'
    discountValue: number
  }) => {
    const today = new Date()
    const expireDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7天後過期

    // 直接使用 SpinWheel 回傳的 discountType 和 discountValue
    const discountType = coupon.discountType
    const discountValue = coupon.discountValue

    try {
      // 調用 API 創建優惠券
      await createCoupon({
        couponName: coupon.name,
        description: coupon.discount,
        expireTime: expireDate.toISOString(),
        couponCount: 1000, // 總數量
        discountType: discountType,
        discountValue: discountValue,
        minPurchaseAmount: 0, // 預設最低消費金額
        createdTime: today.toISOString(),
        maxUsage: 1 // 每個使用者最多使用 1 次
      })

      alert(`恭喜獲得 ${coupon.name}！`)
      
      // 重新載入優惠券列表
      await loadUserCoupons()
    } catch (error) {
      console.error('創建優惠券失敗:', error)
      alert('創建優惠券失敗，請稍後再試')
    }
  }

  return (
    <div style={{ border: '1px solid red', minHeight: '100vh', padding: '20px', overflowY: 'auto', paddingBottom: '60px' }}>
      {/* 頂部導航區 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/user/me')}>
          <img src="/home-icon.png" alt="回首頁" className="home-icon-img" />
        </button>
      </div>

      <h1>{username} - 消費：${totalSpent.toLocaleString()}</h1>

      {/* 優惠券 */}
      <div>
        {loading ? (
          <div>載入中...</div>
        ) : (
          <MyCoupons coupons={myCoupons} />
        )}
      </div>

      {/* 拉霸機 */}
      <div style={{ marginTop: '20px', marginBottom: '40px', border: '1px solid orange' }}>
        <SpinWheel onWin={handleWin} />
      </div>

      {/* 使用條款 - 頁面底部 */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
        <Terms />
      </div>
    </div>
  )
}

export default Coupons

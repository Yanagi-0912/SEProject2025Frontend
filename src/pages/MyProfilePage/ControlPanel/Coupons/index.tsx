import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SpinWheel from './SpinWheel'
import MyCoupons from './MyCoupons'
import Terms from './Terms'
import { getUserCouponsByUserId, useLotteryOnce, issueUserCoupon, getAllCoupons } from '../../../../api/coupon'
import { useGetCurrentUser } from '../../../../api/generated'

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
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [couponIdMap, setCouponIdMap] = useState<Map<number, string>>(new Map())

  // 使用 useGetCurrentUser 取得使用者資訊（包含 remainingDrawTimes）
  const { data: userData, refetch: refetchUser } = useGetCurrentUser()
  const remainingTickets = userData?.data?.remainingDrawTimes ?? 0
  const userId = userData?.data?.id
  const username = userData?.data?.username || userData?.data?.nickname || '使用者'

  // 當 userId 改變時，載入資料
  useEffect(() => {
    if (userId) {
      // 從 API 載入使用者的優惠券
      loadUserCoupons()
    }
    
    // 載入所有可用的優惠券，建立 couponId 映射
    loadCouponIdMap()
  }, [userId])

  // 從 API 載入使用者的優惠券
  const loadUserCoupons = async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const userCoupons = await getUserCouponsByUserId(userId)
      
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
      // 如果是 404，可能是使用者還沒有任何優惠券，這是正常的
      if ((error as any)?.response?.status === 404) {
        setMyCoupons([])
      } else {
        console.error('載入優惠券失敗:', error)
        alert('載入優惠券失敗，請稍後再試')
      }
    } finally {
      setLoading(false)
    }
  }

  // 載入所有可用的優惠券，建立 couponId 映射
  // SpinWheel 中的優惠券名稱對應表
  const spinWheelCouponNames: { [key: number]: string } = {
    0: '9折優惠',
    1: '8折優惠',
    2: '免運券',
    3: '7折優惠',
    4: '滿千折百',
    5: '買一送一',
    6: '5折優惠',
    7: '銘謝惠顧'
  }

  const loadCouponIdMap = async () => {
    try {
      const allCoupons = await getAllCoupons()
      
      // 根據 couponName 建立映射：SpinWheel 的索引對應到實際的 couponID
      const map = new Map<number, string>()
      
      for (let i = 0; i < 8; i++) {
        // 銘謝惠顧 (id '7') 不需要 couponId，跳過
        if (i === 7) {
          continue
        }
        
        const expectedName = spinWheelCouponNames[i]
        
        // 精確匹配
        const matchedCoupon = allCoupons.find(coupon => 
          coupon.couponName === expectedName
        )
        
        if (matchedCoupon) {
          map.set(i, matchedCoupon.couponID)
        }
      }
      
      setCouponIdMap(map)
    } catch (error) {
      console.error('載入優惠券列表失敗:', error)
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

    // 如果是「銘謝惠顧」，只扣除次數，不發放優惠券
    if (coupon.id === '7') {
      try {
        await useLotteryOnce()
        alert('銘謝惠顧，下次再來！')
        // 重新取得使用者資訊以更新剩餘次數
        await refetchUser()
        return
      } catch (error) {
        console.error('扣除抽獎次數失敗:', error)
        alert('扣除抽獎次數失敗，請稍後再試')
        return
      }
    }

    // 取得對應的 couponId
    // id 現在從 '0' 開始，直接對應索引
    const couponIndex = parseInt(coupon.id) // SpinWheel 的 id 是 '0'-'7'，直接對應索引 0-7
    const actualCouponId = couponIdMap.get(couponIndex)

    if (!actualCouponId) {
      alert('優惠券 ID 對應失敗，請稍後再試')
      return
    }

    try {
      // 1. 先扣除一次抽獎次數
      await useLotteryOnce()
      
      // 2. 發放優惠券給使用者
      await issueUserCoupon(userId, actualCouponId)

      alert(`恭喜獲得 ${coupon.name}！`)
      
      // 重新載入優惠券列表和使用者資訊
      await loadUserCoupons()
      await refetchUser()
    } catch (error) {
      console.error('抽獎流程失敗:', error)
      const errorMessage = (error as Error).message || '抽獎流程失敗，請稍後再試'
      alert(errorMessage)
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

      <h1>{username}</h1>

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
        <SpinWheel onWin={handleWin} remainingTickets={remainingTickets} />
      </div>

      {/* 使用條款 - 頁面底部 */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
        <Terms />
      </div>
    </div>
  )
}

export default Coupons

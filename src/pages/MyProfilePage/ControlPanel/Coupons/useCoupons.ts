import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserCouponsByUserId, useLotteryOnce, issueUserCoupon } from '../../../../api/coupon'
import { getAllCoupons, type Coupon as ApiCoupon } from '../../../../api/generated'
import { useGetCurrentUser } from '../../../../api/generated'

// 本地優惠券顯示用的介面
export interface DisplayCoupon {
  id: string
  name: string
  discount: string
  color: string
  obtainedDate: string
  expiryDate: string
  quantity?: number
}

// SpinWheel 優惠券的介面
export interface SpinWheelCoupon {
  id: string
  name: string
  discount: string
  color: string
  discountType: 'PERCENT' | 'FIXED' | 'FREESHIP' | 'BUY_ONE_GET_ONE'
  discountValue: number
}

// SpinWheel 中的優惠券名稱對應表（需與後端 couponName 完全一致）
const spinWheelCouponNames: { [key: number]: string } = {
  0: '9折優惠券',
  1: '滿500折抵100元券',
  2: '免運券',
  3: '7折優惠券',
  4: '滿千折百折優惠券',
  5: '買一送一優惠券',
  6: '5折優惠券',
  7: '銘謝惠顧'
}

// 格式化折扣顯示
const formatDiscountDisplay = (couponInfo: ApiCoupon | undefined): string => {
  if (!couponInfo) {
    return '資訊載入中'
  }

  const discountType = couponInfo.discountType
  const discountValue = couponInfo.discountValue

  if (discountType === 'PERCENT' && discountValue !== undefined && discountValue !== null) {
    return `${(discountValue * 100).toFixed(0)}% OFF`
  } else if (discountType === 'FIXED' && discountValue !== undefined && discountValue !== null) {
    return `$${discountValue} OFF`
  } else if (discountType === 'FREESHIP') {
    return 'FREE SHIP'
  } else if (discountType === 'BUY_ONE_GET_ONE') {
    return 'BUY 1 GET 1'
  }

  // 從 couponName 推斷
  const couponName = couponInfo.couponName || ''
  if (couponName.includes('9折')) return '10% OFF'
  if (couponName.includes('8折')) return '20% OFF'
  if (couponName.includes('7折')) return '30% OFF'
  if (couponName.includes('5折')) return '50% OFF'
  if (couponName.includes('免運')) return 'FREE SHIP'
  if (couponName.includes('買一送一')) return 'BUY 1 GET 1'
  if (couponName.includes('滿千折百')) return '$100 OFF'
  if (couponName.includes('滿500折抵100') || couponName.includes('滿500折百')) return '$100 OFF'
  
  return couponInfo.description || '無折扣資訊'
}

export function useCoupons() {
  const [myCoupons, setMyCoupons] = useState<DisplayCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [couponIdMap, setCouponIdMap] = useState<Map<number, string>>(new Map())
  
  // 使用 ref 來存放 allCouponsMap，避免 useCallback 依賴導致無限循環
  const allCouponsMapRef = useRef<Map<string, ApiCoupon>>(new Map())
  const couponIdMapRef = useRef<Map<number, string>>(new Map())

  // 使用 useGetCurrentUser 取得使用者資訊（包含 remainingDrawTimes）
  const { data: userData, refetch: refetchUser } = useGetCurrentUser()
  const remainingTickets = userData?.data?.remainingDrawTimes ?? 0
  const userId = userData?.data?.id
  const username = userData?.data?.username || userData?.data?.nickname || '使用者'

  // 載入所有可用的優惠券，建立 couponId 映射
  const loadCouponIdMap = useCallback(async (): Promise<{
    couponInfoMap: Map<string, ApiCoupon>
    couponIdMap: Map<number, string>
  }> => {
    try {
      const response = await getAllCoupons()
      const allCoupons = Array.isArray(response.data) 
        ? response.data 
        : (response.data ? [response.data] : [])
      
      const couponInfoMap = new Map<string, ApiCoupon>()
      allCoupons.forEach(coupon => {
        if (coupon.couponID) {
          couponInfoMap.set(coupon.couponID, coupon)
        }
      })
      allCouponsMapRef.current = couponInfoMap
      
      const map = new Map<number, string>()
      for (let i = 0; i < 8; i++) {
        if (i === 7) continue
        
        const expectedName = spinWheelCouponNames[i]
        const matchedCoupon = allCoupons.find(coupon => 
          coupon.couponName === expectedName
        )
        
        if (matchedCoupon?.couponID) {
          map.set(i, matchedCoupon.couponID)
        }
      }
      
      setCouponIdMap(map)
      couponIdMapRef.current = map
      return { couponInfoMap, couponIdMap: map }
    } catch {
      return { 
        couponInfoMap: new Map<string, ApiCoupon>(),
        couponIdMap: new Map<number, string>()
      }
    }
  }, [])

  // 從 API 載入使用者的優惠券
  const loadUserCoupons = useCallback(async (couponInfoMap?: Map<string, ApiCoupon>) => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    // 如果沒有傳入 couponInfoMap，使用 ref 中的 allCouponsMap
    const infoMap = couponInfoMap || allCouponsMapRef.current
    if (infoMap.size === 0) {
      const { couponInfoMap: newMap } = await loadCouponIdMap()
      newMap.forEach((value, key) => infoMap.set(key, value))
    }
    
    try {
      setLoading(true)
      const userCoupons = await getUserCouponsByUserId(userId)
      
      // 過濾掉已用完或已過期的優惠券
      const validCoupons = userCoupons.filter(userCoupon => {
        const expiryDate = new Date(userCoupon.expireTime)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)
        return expiryDate >= today && userCoupon.remainingUsage > 0
      })
      
      // 直接使用 remainingUsage 作為數量
      const convertedCoupons: DisplayCoupon[] = validCoupons.map(userCoupon => {
        const couponInfo = infoMap.get(userCoupon.couponID)

        const obtainedDate = userCoupon.getTime 
          ? new Date(userCoupon.getTime).toLocaleDateString('zh-TW')
          : (userCoupon.obtainedTime 
              ? new Date(userCoupon.obtainedTime).toLocaleDateString('zh-TW')
              : new Date().toLocaleDateString('zh-TW'))

        return {
          id: userCoupon.couponID,
          name: couponInfo?.couponName || userCoupon.couponID,
          discount: formatDiscountDisplay(couponInfo),
          color: '#4ECDC4',
          obtainedDate,
          expiryDate: new Date(userCoupon.expireTime).toLocaleDateString('zh-TW'),
          quantity: userCoupon.remainingUsage
        }
      })

      setMyCoupons(convertedCoupons)
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        setMyCoupons([])
      }
    } finally {
      setLoading(false)
    }
  }, [userId, loadCouponIdMap])

  // 抽獎後的處理
  const handleWin = useCallback(async (coupon: SpinWheelCoupon) => {
    if (!userId) {
      alert('請先登入')
      return
    }

    // 銘謝惠顧
    if (coupon.id === '7') {
      await useLotteryOnce()
      alert('銘謝惠顧，下次再來！')
      await refetchUser()
      return
    }

    const couponIndex = parseInt(coupon.id)
    
    let currentCouponIdMap = couponIdMapRef.current.size > 0 ? couponIdMapRef.current : couponIdMap
    if (currentCouponIdMap.size === 0) {
      const { couponIdMap: loadedMap } = await loadCouponIdMap()
      currentCouponIdMap = loadedMap
    }
    
    const actualCouponId = currentCouponIdMap.get(couponIndex)

    if (!actualCouponId) {
      const { couponIdMap: reloadedMap } = await loadCouponIdMap()
      const retryCouponId = reloadedMap.get(couponIndex)
      if (retryCouponId) {
        currentCouponIdMap = reloadedMap
      } else {
        alert(`優惠券 ID 對應失敗（索引 ${couponIndex}），請稍後再試`)
        return
      }
    }
    
    const finalCouponId = currentCouponIdMap.get(couponIndex)
    if (!finalCouponId) {
      alert(`優惠券 ID 對應失敗（索引 ${couponIndex}），請稍後再試`)
      return
    }

    try {
      await useLotteryOnce()
      await issueUserCoupon(userId, finalCouponId)
      alert(`恭喜獲得 ${coupon.name}！`)
      
      // 重新載入優惠券模板和使用者優惠券
      const { couponInfoMap } = await loadCouponIdMap()
      await loadUserCoupons(couponInfoMap)
      await refetchUser()
    } catch {
      alert('抽獎流程失敗，請稍後再試')
    }
  }, [userId, couponIdMap, loadCouponIdMap, loadUserCoupons, refetchUser])

  // 當 userId 改變時，載入資料
  useEffect(() => {
    const loadData = async () => {
      const { couponInfoMap } = await loadCouponIdMap()
      if (userId) {
        await loadUserCoupons(couponInfoMap)
      } else {
        setLoading(false)
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    myCoupons,
    loading,
    remainingTickets,
    username,
    handleWin
  }
}

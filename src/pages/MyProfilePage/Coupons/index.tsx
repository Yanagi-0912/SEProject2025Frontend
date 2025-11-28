import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SpinWheel from './SpinWheel'
import MyCoupons from './MyCoupons'
import Terms from './Terms'

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

  useEffect(() => {
    // 取得使用者名稱（如果有登入的話）
    const savedUsername = localStorage.getItem('username')
    setUsername(savedUsername || '訪客')

    // 載入已有的優惠券並清除過期的
    const savedCoupons = localStorage.getItem('myCoupons')
    if (savedCoupons) {
      const allCoupons = JSON.parse(savedCoupons)
      // 過濾掉過期的優惠券
      const validCoupons = allCoupons.filter((coupon: Coupon) => {
        const expiryDate = new Date(coupon.expiryDate)
        const today = new Date()
        // 設定時間為 00:00:00 來比較日期
        today.setHours(0, 0, 0, 0)
        expiryDate.setHours(0, 0, 0, 0)
        return expiryDate >= today
      })
      
      // 如果有優惠券被刪除，更新 localStorage
      if (validCoupons.length !== allCoupons.length) {
        localStorage.setItem('myCoupons', JSON.stringify(validCoupons))
        const expiredCount = allCoupons.length - validCoupons.length
        alert(`已自動刪除 ${expiredCount} 張過期優惠券`)
      }
      
      setMyCoupons(validCoupons)
    }

    // 模擬總消費金額（實際應該從後端取得）
    const savedSpent = localStorage.getItem('totalSpent')
    setTotalSpent(savedSpent ? parseInt(savedSpent) : 0)

    // 自動發放優惠券的邏輯
    checkAndGiveAutoCoupons()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 檢查並自動發放優惠券
  const checkAndGiveAutoCoupons = () => {
    const today = new Date()
    const month = today.getMonth() + 1
    const date = today.getDate()
    
    // 條件 1: 重大節日自動發放
    const holidays = [
      { month: 1, date: 1, name: '元旦優惠券', discount: '新年快樂 8折' },
      { month: 2, date: 14, name: '情人節優惠券', discount: '甜蜜 85折' },
      { month: 12, date: 25, name: '聖誕優惠券', discount: '聖誕快樂 7折' },
      { month: 10, date: 10, name: '雙十國慶券', discount: '國慶 9折' },
    ]

    holidays.forEach(holiday => {
      if (month === holiday.month && date === holiday.date) {
        const holidayKey = `holiday_${month}_${date}_${today.getFullYear()}`
        if (!localStorage.getItem(holidayKey)) {
          addAutoCoupon({
            id: `auto_${Date.now()}`,
            name: holiday.name,
            discount: holiday.discount,
            color: '#FF6B6B',
            obtainedDate: today.toLocaleDateString('zh-TW'),
            expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-TW')
          })
          localStorage.setItem(holidayKey, 'true')
          alert(`${holiday.name}已自動發放！（7天內有效）`)
        }
      }
    })

    // 條件 2: 消費達標自動發放
    const spent = parseInt(localStorage.getItem('totalSpent') || '0')
    if (spent >= 1000) {
      const milestone1000Key = 'milestone_1000'
      if (!localStorage.getItem(milestone1000Key)) {
        addAutoCoupon({
          id: `milestone_${Date.now()}`,
          name: '消費千元達成券',
          discount: '滿千折百',
          color: '#4ECDC4',
          obtainedDate: today.toLocaleDateString('zh-TW'),
          expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-TW')
        })
        localStorage.setItem(milestone1000Key, 'true')
        alert('消費達 $1000，獲得滿千折百優惠券！（7天內有效）')
      }
    }

    // 條件 3: 新會員優惠（註冊後首次進入）
    const isNewMember = !localStorage.getItem('firstVisit')
    if (isNewMember) {
      addAutoCoupon({
        id: `welcome_${Date.now()}`,
        name: '新會員歡迎券',
        discount: '首購 85折',
        color: '#45B7D1',
        obtainedDate: today.toLocaleDateString('zh-TW'),
        expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-TW')
      })
      localStorage.setItem('firstVisit', 'true')
    }
  }

  const addAutoCoupon = (coupon: Coupon) => {
    setMyCoupons(prev => {
      const updated = [...prev, coupon]
      localStorage.setItem('myCoupons', JSON.stringify(updated))
      return updated
    })
  }

  const handleWin = (coupon: { id: string; name: string; discount: string; color: string }) => {
    // 檢查優惠券數量是否已達上限
    if (myCoupons.length >= 1000) {
      alert('優惠券已達上限（1000張），無法再獲得新優惠券！')
      return
    }

    const today = new Date()
    const newCoupon: Coupon = {
      ...coupon,
      id: `spin_${Date.now()}`,
      obtainedDate: today.toLocaleDateString('zh-TW'),
      expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-TW')
    }

    setMyCoupons(prev => {
      const updated = [...prev, newCoupon]
      localStorage.setItem('myCoupons', JSON.stringify(updated))
      return updated
    })
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
        <MyCoupons coupons={myCoupons} />
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


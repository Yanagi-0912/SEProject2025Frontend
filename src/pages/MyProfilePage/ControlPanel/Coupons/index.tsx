import { useNavigate } from 'react-router-dom'
import SpinWheel from './SpinWheel'
import MyCoupons from './MyCoupons'
import Terms from './Terms'
import { useCoupons } from './useCoupons'

function Coupons() {
  const navigate = useNavigate()
  const { myCoupons, loading, remainingTickets, username, handleWin } = useCoupons()

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

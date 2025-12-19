import { useNavigate } from 'react-router-dom'
import SpinWheel from './SpinWheel'
import MyCoupons from './MyCoupons'
import Terms from './Terms'
import { useCoupons } from './useCoupons'
import './Coupons.css'

function Coupons() {
  const navigate = useNavigate()
  const { myCoupons, loading, remainingTickets, username, handleWin } = useCoupons()

  return (
    <div className="coupons-container">
      {/* 頂部導航區 */}
      <div className="coupons-header">
        <button onClick={() => navigate('/user/me')}>
          <img src="/home-icon.png" alt="回首頁" className="home-icon-img" />
        </button>
      </div>

      <h1 className="coupons-title">{username}</h1>

      {/* 優惠券 */}
      <div className="coupons-section">
        {loading ? (
          <div>載入中...</div>
        ) : (
          <MyCoupons coupons={myCoupons} />
        )}
      </div>

      {/* 拉霸機 */}
      <div className="spinwheel-section">
        <SpinWheel onWin={handleWin} remainingTickets={remainingTickets} />
      </div>

      {/* 使用條款 */}
      <div className="terms-section">
        <Terms />
      </div>
    </div>
  )
}

export default Coupons

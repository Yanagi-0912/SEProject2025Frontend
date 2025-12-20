import { Routes, Route, useNavigate } from 'react-router-dom'
import LiquidEther from './components/backgrounds/LiquidEther/LiquidEther'
import { liquidEtherConfig } from './components/backgrounds/LiquidEther/config'
import './components/backgrounds/LiquidEther/LiquidEther.css'
import './App.css'
import Login from './pages/Auth/login'
import Register from './pages/Auth/register'
import Main from './pages/Main'
import CartPage from './pages/CartPage'
import ProductPage from './pages/ProductPage'
import MyProfilePage from './pages/MyProfilePage'
import Coupons from './pages/MyProfilePage/ControlPanel/Coupons'
import SellerDashboard from './pages/MyProfilePage/SellerDashboard'
import UserProfilePage from './pages/UserProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import ChatRoomPage from './pages/ChatRoomPage'
import FavoriteList from './pages/FavoriteList'
import OrderSuccessPage from './pages/OrderSuccessPage'
import UserHistory from './pages/MyProfilePage/UserHistory'

function App() {
  const navigate = useNavigate()

  return (
        <Routes>
          {/* 主頁 */}
          <Route path="/" element={<Main />} />

          {/* 聊天室 */}
          <Route path="/chat" element={<ChatRoomPage onBack={() => navigate('/')} />} />
          
          {/* 購物車 */}
          <Route path="/cart" element={<CartPage onBack={() => navigate('/')} />} />

          {/* 結帳頁面 */}
          <Route path="/checkout" element={<CheckoutPage onBack={() => navigate('/cart')} />} />

          {/* 訂單成功頁面 */}
          <Route path="/order-success" element={<OrderSuccessPage />} />
          
          {/* 商品詳情 */}
          <Route path="/product/:id" element={<ProductPage />} />

          {/* 使用者個人頁 */}
          <Route path="/user/me" element={<MyProfilePage />} />
              {/* 優惠券 */}
              <Route path="/profile/coupons" element={<Coupons />} />
              {/* 賣家後台 */}
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              {/* 歷史紀錄 */}
              <Route path="/profile/history" element={<UserHistory />} />
          {/* 其他使用者頁 */}
          <Route path="/user/:id" element={<UserProfilePage />} />

          {/* 最愛清單頁面 */}
          <Route path="/favorites/:id" element={<FavoriteList/>} />
          <Route path="/favorites/me" element={<FavoriteList/>} />

          {/* 登入 */}
          <Route path="/login" element={
            <div className="app-container">
              <LiquidEther {...liquidEtherConfig} />
              <div className="login-container">
                <Login
                  onGuestLogin={() => navigate('/')}
                  loginSuccess={() => navigate('/')}
                  onGoToRegister={() => navigate('/register')}
                />
              </div>
            </div>
          } />

          {/* 註冊 */}
          <Route path="/register" element={
            <div className="app-container">
              <LiquidEther {...liquidEtherConfig} />
              <div className="login-container">
                <Register
                  onBackToLogin={() => navigate('/login')}
                  registerSuccess={() => navigate('/login')}
                />
              </div>
            </div>
          } />
        </Routes>
  )
}

export default App

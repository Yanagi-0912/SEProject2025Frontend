import { Routes, Route, useNavigate } from 'react-router-dom'
import LiquidEther from './components/backgrounds/LiquidEther/LiquidEther'
import { liquidEtherConfig } from './components/backgrounds/LiquidEther/config'
import './components/backgrounds/LiquidEther/LiquidEther.css'
import './App.css'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Main from './pages/Main'
import CartPage from './pages/CartPage'
import ProductPage from './pages/ProductPage'
import UserProfilePage from './pages/UserProfilePage'
import Coupons from './pages/UserProfilePage/Coupons'
import SellerDashboard from './pages/UserProfilePage/SellerDashboard'
import CheckoutPage from './pages/CheckoutPage'

function App() {
  const navigate = useNavigate()

  return (
        <Routes>
          {/* 主頁 */}
          <Route path="/" element={<Main />} />
          
          {/* 購物車 */}
          <Route path="/cart" element={<CartPage onBack={() => navigate('/')} />} />

          {/* 結帳頁面 */}
          <Route path="/checkout" element={<CheckoutPage onBack={() => navigate('/cart')} />} />
          
          {/* 商品詳情 */}
          <Route path="/product/:id" element={<ProductPage />} />

          {/* 使用者頁 */}
          <Route path="/user/me" element={<UserProfilePage />} />
          
          {/* 優惠券 */}
          <Route path="/profile/coupons" element={<Coupons />} />
          
          {/* 賣家後台 */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          
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

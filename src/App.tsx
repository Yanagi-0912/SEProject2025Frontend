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
import MyAccount from './pages/MyAccount'

function App() {
  const navigate = useNavigate()

  return (
        <Routes>
          {/* 主頁 */}
          <Route path="/main" element={<Main onBack={() => navigate('/')} />} />
          
          {/* 購物車 */}
          <Route path="/cart" element={<CartPage onBack={() => navigate('/main')} />} />
          
          {/* 商品詳情 */}
          <Route path="/product/:id" element={<ProductPage onBack={() => navigate('/main')} />} />
          
          {/* 我的帳號 */}
          <Route path="/myaccount" element={<MyAccount />} />
          
          {/* 登入 */}
          <Route path="/" element={
            <div className="app-container">
              <LiquidEther {...liquidEtherConfig} />
              <div className="login-container">
                <Login
                  onGuestLogin={() => navigate('/main')}
                  loginSuccess={() => navigate('/main')}
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
                  onBackToLogin={() => navigate('/')}
                  registerSuccess={() => navigate('/')}
                />
              </div>
            </div>
          } />
        </Routes>
  )
}

export default App

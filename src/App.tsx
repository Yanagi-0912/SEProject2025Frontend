import { useState } from 'react'
import LiquidEther from './components/backgrounds/LiquidEther/LiquidEther'
import { liquidEtherConfig } from './components/backgrounds/LiquidEther/config'
import './components/backgrounds/LiquidEther/LiquidEther.css'
import './App.css'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Main from './pages/Main'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  if (isLoggedIn) {
    return <Main onBack={() => setIsLoggedIn(false)} />
  }

  return (
    <div className="app-container">
      {/* 背景特效元件 */}
      <LiquidEther {...liquidEtherConfig} />
      {/* 登入/註冊表單 (置中顯示) */}
      <div className="login-container">
        {showRegister ? (
          <Register 
            onBackToLogin={() => setShowRegister(false)}
            registerSuccess={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onGuestLogin={() => setIsLoggedIn(true)} 
            loginSuccess={() => setIsLoggedIn(true)}
            onGoToRegister={() => setShowRegister(true)}
          />
        )}
      </div>

    </div>
  )
}

export default App

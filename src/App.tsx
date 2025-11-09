import { useState } from 'react'
import LiquidEther from './components/backgrounds/LiquidEther/LiquidEther'
import { liquidEtherConfig } from './components/backgrounds/LiquidEther/config'
import './components/backgrounds/LiquidEther/LiquidEther.css'
import './App.css'
import Login from './pages/Login'
import Main from './pages/ProductPage'

function App() {
  const [isGuest, setIsGuest] = useState(false)

  if (isGuest) {
    return <Main onBack={() => setIsGuest(false)} />
  }

  return (
    <div className="app-container">
      {/* 背景特效元件 */}
      <LiquidEther {...liquidEtherConfig} />
      {/* 標題 */}
      <div className="app-title">
        海大拍賣系統
      </div>
      {/* 登入表單 (置中顯示) */}
      <div className="login-container">
        <Login onGuestLogin={() => setIsGuest(true)} />
      </div>

    </div>
  )
}

export default App

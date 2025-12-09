import { useState, type FormEvent } from 'react'
import './Login.css'
import { login } from '../../api/login'

interface LoginProps {
  onGuestLogin?: () => void
  loginSuccess?: (token: string, username: string) => void
  onGoToRegister?: () => void
}

function Login({ onGuestLogin, loginSuccess, onGoToRegister }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true) //避免重複點擊

    try {
      // 呼叫 API 登入
      const data = await login({ username, password })
      
      // 存 token 和 username 到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      
      // 呼叫 loginSuccess 回調函數 跟app.tsx講說可以切換頁面了
      loginSuccess?.(data.token, data.username)
    } catch (err) {
      console.error('登入錯誤:', err)
      alert('帳號或密碼錯誤')
      // 清空密碼欄位
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      <h1 className="login-main-title">海大拍賣系統</h1>
      
      <form onSubmit={handleSubmit} className="login-form-wrapper">
        <div className="login-input-group">
          <label htmlFor="username" className="login-input-label">帳號/Account</label>
          <input
            id="username"
            className="login-input-field"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            placeholder="請輸入帳號"
            required
          />
        </div>
        
        <div className="login-input-group">
          <label htmlFor="password" className="login-input-label">密碼/Password</label>
          <input
            id="password"
            type="password"
            className="login-input-field"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            placeholder="請輸入密碼"
            required
          />
        </div>
        
        <button type="submit" className="login-main-button" disabled={loading}>
          {loading ? '登入中...' : '登入/Login'}
        </button>
        
        <div className="login-links-container">
          <div>
            <button 
              type="button"
              onClick={onGoToRegister} 
              className="login-small-link" 
              disabled={loading}
            >
              註冊新帳號
            </button>
            <span className="login-divider">|</span>
            <button 
              type="button"
              onClick={onGuestLogin} 
              className="login-small-link" 
              disabled={loading}
            >
              訪客登入
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login


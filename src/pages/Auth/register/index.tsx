import { useState, type FormEvent } from 'react'
import './Register.css'
import { register } from '../../../api/register'
import { login } from '../../../api/login'
import { handlePostRegisterDraw } from './drawCoupons'

interface RegisterProps {
  onBackToLogin?: () => void
  registerSuccess?: () => void
}

function Register({ onBackToLogin, registerSuccess }: RegisterProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // 檢查密碼是否一致
    if (password !== confirmPassword) {
      alert('兩次輸入的密碼不一致')
      setPassword('')
      setConfirmPassword('')
      return
    }

    // 檢查密碼長度
    if (password.length < 6) {
      alert('密碼長度至少需要 6 個字元')
      return
    }

    setLoading(true)

    try {
      // 1. 呼叫 API 註冊
      await register({ username, password, email })

      // 2. 註冊成功後自動登入，取得 token 和 username
      const loginData = await login({ username, password })
      localStorage.setItem('token', loginData.token)
      localStorage.setItem('username', loginData.username)
      localStorage.setItem('email', email)

      // 3. 抽獎十次（背景執行，不阻塞註冊流程）
      handlePostRegisterDraw().catch(err => {
        console.error('抽獎失敗:', err)
      })

      registerSuccess?.()
      onBackToLogin?.()
      
    } catch (err) {
      console.error('註冊錯誤:', err)
      const errorMessage = err instanceof Error ? err.message : '註冊失敗，請稍後再試'
      setError(errorMessage)
      alert(errorMessage)
      // 清空密碼欄位
      setPassword('')
      setConfirmPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page-container">
      <h1 className="register-main-title">註冊新帳號</h1>
      <form onSubmit={handleSubmit} className="register-form-wrapper">
        <div className="register-input-group">
          <label htmlFor="username" className="register-input-label">帳號/Account</label>
          <input
            id="username"
            className="register-input-field"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            required
            minLength={3}
            placeholder="請輸入帳號 (至少 3 個字元)"
          />
        </div>

        <div className="register-input-group">
          <label htmlFor="email" className="register-input-label">電子郵件/Email</label>
          <input
            id="email"
            type="email"
            className="register-input-field"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
            placeholder="請輸入電子郵件"
          />
        </div>

        <div className="register-input-group">
          <label htmlFor="password" className="register-input-label">密碼/Password</label>
          <input
            id="password"
            type="password"
            className="register-input-field"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
            placeholder="請輸入密碼 (至少 6 個字元)"
          />
        </div>

        <div className="register-input-group">
          <label htmlFor="confirmPassword" className="register-input-label">確認密碼/Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="register-input-field"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            placeholder="請再次輸入密碼"
          />
        </div>

        {error && <div className="register-error">{error}</div>}

        <button type="submit" className="register-main-button" disabled={loading}>
          {loading ? '註冊中...' : '註冊/Register'}
        </button>
        
        <div className="register-links-container">
          <div className="register-center-link">
            <button 
              type="button"
              onClick={onBackToLogin} 
              className="register-small-link" 
              disabled={loading}
            >
              返回登入
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Register

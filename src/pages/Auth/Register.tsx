import { useState, type FormEvent } from 'react'
import './Register.css'

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
      // 呼叫 API 註冊
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      })

      if (!response.ok) {
        // 🔧 修正：使用 text() 而不是 json()
        const errorMessage = await response.text()
        throw new Error(errorMessage || '註冊失敗')
      }

      // 註冊成功，儲存 email 到 localStorage（供買家資訊使用）
      localStorage.setItem('email', email)
      alert('註冊成功！請使用您的帳號密碼登入')
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
    <div className="register-container">
      <h2 className="register-title">註冊新帳號</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">帳號<br /></label>
          <input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            required
            minLength={3}
            placeholder="至少 3 個字元"
          />
        </div>

        <div>
          <label htmlFor="email">電子郵件<br /></label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label htmlFor="password">密碼<br /></label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
            placeholder="至少 6 個字元"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">確認密碼<br /></label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            placeholder="再次輸入密碼"
          />
        </div>

        {error && <div className="register-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? '註冊中...' : '註冊'}
        </button>
      </form>

      <button onClick={onBackToLogin} className="register-back-button" disabled={loading}>
        返回登入
      </button>
    </div>
  )
}

export default Register
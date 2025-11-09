import { useState, type FormEvent } from 'react'

interface LoginProps {
  onGuestLogin?: () => void
  loginSuccess?: (token: string, username: string) => void
}

function Login({ onGuestLogin, loginSuccess }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('') //可以清出之前錯誤
    setLoading(true) //避免重複點擊

    try {
      //呼叫api 登入
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      if (!response.ok) {
        throw new Error('登入失敗')
      }
      
      const data = await response.json()
      
      // 存 token 和 username 到 localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      
      // 呼叫 loginSuccess 回調函數
      loginSuccess?.(data.token, data.username)
    } catch (err) {
      console.error('登入錯誤:', err)
      setError('登入失敗，請檢查您的帳號密碼')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ color: 'white', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">帳號<br></br></label>
          <input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password">密碼<br></br></label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? '登入中...' : '登入'}
        </button>
      </form>
      <button onClick={onGuestLogin} style={{ marginTop: 12 }} disabled={loading}>訪客登入</button>
    </div>
  )
}

export default Login

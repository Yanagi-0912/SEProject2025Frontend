import { useState, type FormEvent } from 'react'

interface LoginProps {
  onGuestLogin?: () => void
}

function Login({ onGuestLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ username, password })
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
          />
        </div>
        <div>
          <label htmlFor="password">密碼<br></br></label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">登入</button>
      </form>
      <button onClick={onGuestLogin} style={{ marginTop: 12 }}>訪客登入</button>
    </div>
  )
}

export default Login

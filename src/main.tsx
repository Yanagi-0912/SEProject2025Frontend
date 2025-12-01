import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import App from './App.tsx'
import { PRODUCT_API } from './config/api'

// 設定 axios baseURL
axios.defaults.baseURL = PRODUCT_API

// 設定 axios interceptor 自動攜帶 token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 設定 axios interceptor 處理 401/403 錯誤
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token 無效或過期，清除並導向登入
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      console.warn('認證失敗，請重新登入')
      // 可選：導向登入頁
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

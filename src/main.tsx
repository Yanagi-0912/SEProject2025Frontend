import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import * as axiosModule from 'axios'
import App from './App.tsx'
import { PRODUCT_API } from './config/api'

// 取得 axios.default (generated API 使用的實例)
const axiosDefault: AxiosInstance = (axiosModule as { default?: AxiosInstance }).default || axios

// 設定 axios baseURL
axios.defaults.baseURL = PRODUCT_API
axiosDefault.defaults.baseURL = PRODUCT_API

// Request interceptor
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error)
}

// Response interceptor
const responseSuccessInterceptor = (response: AxiosResponse) => response

const responseErrorInterceptor = (error: AxiosError) => {
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

// 為兩個 axios 實例都設置 interceptors
axios.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
axios.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor)

axiosDefault.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
axiosDefault.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor)

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

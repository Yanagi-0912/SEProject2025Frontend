import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // 開發時代理後端，避免瀏覽器 CORS 限制
  server: {
    host: '0.0.0.0',  // 允許外部訪問
    allowedHosts: [
      'frontend.jamessu2016.com',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      // 把 /products 的請求代理到本地後端
      '/products': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
      // 如需代理其他 API 路徑，可在此加入
    },
  },
})

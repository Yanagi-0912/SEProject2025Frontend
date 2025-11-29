// 根據環境自動切換 API URL
const PRODUCT_API = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'  // 本地開發
    : 'https://api.jamessu2016.com';  // 生產環境（Vercel）

const RAG_API = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'  // 本地開發
    : 'https://rag-api.jamessu2016.com';  // 生產環境（Vercel）

export { PRODUCT_API, RAG_API };


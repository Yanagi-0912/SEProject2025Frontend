# CI 設定移交檢查清單

> **用途：** 此文件為簡潔的執行清單，供有權限的人員快速完成 CI 配置。

## 📋 後端倉庫資訊

- **GitHub 倉庫：** `Yanagi-0912/SEProject2025Backend`
- **倉庫類型：** ✅ 公開（不需要 token）

---

## ✅ 執行步驟

### 步驟 1：設定 GitHub Secrets

**位置：** 前端倉庫 → Settings → Secrets and variables → Actions

**必須設定的 Secrets：**

- [ ] `MONGODB_URI` - MongoDB Atlas 連線字串
  - 取得方式：從後端 `application-dev.yml` 或詢問後端團隊
  
- [ ] `JWT_SECRET` - JWT 加密密鑰
  - 取得方式：從後端 `application-dev.yml` 或詢問後端團隊

**可選的 Secrets：**

- [ ] `BACKEND_REPO_TOKEN` - 僅私有倉庫需要（本專案不需要）

---

### 步驟 2：更新 CI 配置

**檔案：** `.github/workflows/playwright.yml`

**操作：**

1. [ ] 取消註解 "Checkout Backend" 步驟（第 23-28 行）
2. [ ] 確認 `repository: Yanagi-0912/SEProject2025Backend` 正確
3. [ ] 刪除 `token` 行（因為是公開倉庫）
4. [ ] 取消註解 "Set up Java 21" 步驟（第 33-38 行）
5. [ ] 取消註解 "Cache Maven dependencies" 步驟（第 40-45 行）
6. [ ] 取消註解 "Start Backend API" 步驟（第 47-59 行）
7. [ ] 取消註解 "Wait for Backend to be ready" 步驟（第 61-67 行）
8. [ ] 取消註解 "Create Test User" 步驟（第 69-78 行）
9. [ ] 取消註解 "Stop Backend" 步驟（第 106-110 行）

**快速檢查：**
- [ ] 所有後端相關步驟都已取消註解（沒有 `#` 開頭）
- [ ] `repository` 欄位為 `Yanagi-0912/SEProject2025Backend`
- [ ] 沒有 `token` 行（公開倉庫不需要）

---

### 步驟 3：驗證配置

**測試方法：**

1. [ ] 提交並推送更改到 GitHub
2. [ ] 前往 GitHub Actions 頁面
3. [ ] 查看 CI 是否成功執行
4. [ ] 檢查日誌確認：
   - [ ] 後端成功啟動
   - [ ] 測試帳號成功創建
   - [ ] Playwright 測試正常執行

---

## 🔧 快速參考

### 後端技術資訊

- **技術棧：** Spring Boot 3.5.6, Java 21, Maven
- **啟動命令：** `./mvnw spring-boot:run -DskipTests`
- **端口：** 8080
- **健康檢查：** `http://localhost:8080/swagger-ui.html`

### 測試帳號

- **自動創建：** `testuser` / `Test123456`
- **或使用現有：** `testuser` / `password123`

---

## ⚠️ 常見問題

### Q: 後端啟動失敗？

**A:** 檢查：
1. GitHub Secrets 是否正確設定
2. MongoDB URI 是否正確
3. CI 日誌中的錯誤訊息

### Q: 測試失敗？

**A:** 檢查：
1. 後端是否成功啟動
2. `VITE_API_URL` 是否為 `http://localhost:8080`
3. Playwright 測試報告

---

## ✅ 完成確認

- [ ] 步驟 1：GitHub Secrets 已設定
- [ ] 步驟 2：CI 配置已更新
- [ ] 步驟 3：配置已驗證

**完成後，CI 應該可以正常運作！** 🎉

---

**詳細技術文檔請參考：** `CI_SETUP_GUIDE.md`

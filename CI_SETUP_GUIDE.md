# CI 測試後端支援技術文檔

> **用途：** 此文件為完整的技術文檔，供開發人員和測試人員參考，了解 CI 測試環境的完整配置和技術細節。

## 📋 目錄

1. [概述](#概述)
2. [後端技術架構](#後端技術架構)
3. [CI 環境配置](#ci-環境配置)
4. [GitHub Actions 工作流程](#github-actions-工作流程)
5. [環境變數說明](#環境變數說明)
6. [API 端點清單](#api-端點清單)
7. [故障排除](#故障排除)
8. [參考資料](#參考資料)

---

## 概述

本專案的前端 CI 測試需要後端 API 服務運行才能完成端到端（E2E）測試。CI 環境會在 GitHub Actions 中自動啟動後端服務，然後執行 Playwright 測試。

### 測試流程

```
1. Checkout 前端和後端代碼
2. 設置 Java 21 環境
3. 啟動後端 API 服務
4. 等待後端就緒
5. 創建測試帳號
6. 執行 Playwright E2E 測試
7. 上傳測試報告
8. 停止後端服務
```

---

## 後端技術架構

### 技術棧

| 技術 | 版本 | 說明 |
|------|------|------|
| Spring Boot | 3.5.6 | Java 後端框架 |
| Java | 21 | 程式語言 |
| Maven | - | 建置工具（使用 Maven Wrapper） |
| MongoDB | Atlas | 雲端資料庫服務 |

### 後端倉庫資訊

- **GitHub 倉庫：** `Yanagi-0912/SEProject2025Backend`
- **倉庫類型：** 公開
- **本地路徑：** `/Users/jamessu/Desktop/computersciencehomework/SEProject2025Backend`

### 啟動命令

```bash
# 在後端目錄執行
./mvnw spring-boot:run -DskipTests
```

**參數說明：**
- `-DskipTests`: 跳過測試編譯（因為測試檔案有類型錯誤，不影響主程式）

### 啟動時間

- **首次啟動（下載依賴）：** 約 2-5 分鐘
- **後續啟動：** 約 30-60 秒

---

## CI 環境配置

### 前置需求

1. **GitHub Secrets 設定**
   - 必須在前端倉庫的 Settings → Secrets and variables → Actions 中設定
   - 詳見 [環境變數說明](#環境變數說明)

2. **後端倉庫訪問權限**
   - 後端為公開倉庫，不需要額外的 token
   - 如果是私有倉庫，需要設定 `BACKEND_REPO_TOKEN`

### GitHub Secrets 清單

| Secret 名稱 | 類型 | 說明 | 取得方式 |
|------------|------|------|---------|
| `MONGODB_URI` | 必須 | MongoDB Atlas 連線字串 | 從後端 `application-dev.yml` 或詢問後端團隊 |
| `JWT_SECRET` | 必須 | JWT 加密密鑰 | 從後端 `application-dev.yml` 或詢問後端團隊 |
| `BACKEND_REPO_TOKEN` | 可選 | 後端倉庫訪問 Token | 僅私有倉庫需要，建立 GitHub Personal Access Token |

### 如何建立 BACKEND_REPO_TOKEN（僅私有倉庫需要）

1. GitHub → 右上角頭像 → **Settings**
2. 左側選單 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. 點擊 **Generate new token (classic)**
5. 設定：
   - **Note:** `CI Backend Access`
   - **Expiration:** 選擇合適的過期時間
   - **Scopes:** 勾選 `repo`（完整倉庫訪問權限）
6. 點擊 **Generate token**
7. **立即複製 token**（只會顯示一次）
8. 在前端倉庫的 Secrets 中添加 `BACKEND_REPO_TOKEN`

---

## GitHub Actions 工作流程

### 工作流程檔案

- **路徑：** `.github/workflows/playwright.yml`
- **名稱：** `Playwright Tests with Backend`
- **觸發條件：**
  - Push 到 `main` 或 `develop` 分支
  - Pull Request 到 `main` 或 `develop` 分支

### 工作流程步驟詳解

#### 1. Checkout Frontend
```yaml
- name: Checkout Frontend
  uses: actions/checkout@v4
  with:
    path: frontend
```
- 下載前端倉庫代碼到 `frontend` 目錄

#### 2. Checkout Backend
```yaml
- name: Checkout Backend
  uses: actions/checkout@v4
  with:
    repository: Yanagi-0912/SEProject2025Backend
    path: backend
```
- 下載後端倉庫代碼到 `backend` 目錄
- 後端為公開倉庫，不需要 `token`

#### 3. Set up Java 21
```yaml
- name: Set up Java 21
  uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'temurin'
    cache: maven
```
- 安裝 Java 21（Temurin 發行版）
- 啟用 Maven 依賴快取

#### 4. Cache Maven dependencies
```yaml
- name: Cache Maven dependencies
  uses: actions/cache@v4
  with:
    path: ~/.m2
    key: ${{ runner.os }}-m2-${{ hashFiles('backend/pom.xml') }}
    restore-keys: ${{ runner.os }}-m2
```
- 快取 Maven 依賴，加速後續建置

#### 5. Start Backend API
```yaml
- name: Start Backend API
  working-directory: ./backend
  run: |
    chmod +x mvnw
    ./mvnw spring-boot:run -DskipTests &
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI }}
    MONGODB_DATABASE: mongodb
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    JWT_EXPIRATION: 86400000
    CORS_ALLOWED_ORIGINS: http://localhost:5173,https://se-project2025-frontend.vercel.app
    SERVER_PORT: 8080
```
- 在背景啟動後端服務
- 設定所有必要的環境變數

#### 6. Wait for Backend to be ready
```yaml
- name: Wait for Backend to be ready
  run: |
    echo "等待後端啟動..."
    timeout 120 bash -c 'until curl -f http://localhost:8080/swagger-ui.html > /dev/null 2>&1; do echo "等待中..."; sleep 3; done'
    echo "✅ 後端已啟動！"
    curl -f http://localhost:8080/api/products || echo "警告：API 端點無法訪問"
```
- 等待後端服務啟動完成（最多 120 秒）
- 使用 Swagger UI 端點作為健康檢查
- 驗證 API 是否正常運作

#### 7. Create Test User
```yaml
- name: Create Test User (if needed)
  run: |
    curl -X POST http://localhost:8080/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "username": "testuser",
        "password": "Test123456",
        "email": "testuser@example.com"
      }' || echo "測試帳號可能已存在，繼續執行..."
```
- 動態創建測試帳號
- 如果帳號已存在，不影響測試繼續執行

#### 8. Setup Node.js
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```
- 安裝 Node.js 20
- 啟用 npm 依賴快取

#### 9. Install Frontend Dependencies
```yaml
- name: Install Frontend Dependencies
  working-directory: ./frontend
  run: npm ci
```
- 使用 `npm ci` 進行乾淨安裝（適合 CI 環境）

#### 10. Install Playwright Browsers
```yaml
- name: Install Playwright Browsers
  working-directory: ./frontend
  run: npx playwright install --with-deps
```
- 安裝 Playwright 瀏覽器和系統依賴

#### 11. Run Playwright Tests
```yaml
- name: Run Playwright Tests
  working-directory: ./frontend
  env:
    VITE_API_URL: http://localhost:8080
  run: npx playwright test
```
- 執行所有 Playwright E2E 測試
- 設定 `VITE_API_URL` 指向本地後端

#### 12. Upload Playwright Report
```yaml
- name: Upload Playwright Report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: frontend/playwright-report/
    retention-days: 30
```
- 上傳測試報告作為 Artifact（即使測試失敗）

#### 13. Stop Backend
```yaml
- name: Stop Backend
  if: always()
  run: |
    pkill -f "spring-boot:run" || true
    echo "後端已停止"
```
- 無論測試成功或失敗，都停止後端服務

---

## 環境變數說明

### 後端環境變數

| 變數名稱 | 說明 | 範例值 | 是否必須 |
|---------|------|--------|---------|
| `MONGODB_URI` | MongoDB Atlas 連線字串 | `mongodb+srv://user:pass@cluster.mongodb.net/...` | ✅ 必須 |
| `MONGODB_DATABASE` | MongoDB 資料庫名稱 | `mongodb` | ✅ 必須 |
| `JWT_SECRET` | JWT 加密密鑰 | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | ✅ 必須 |
| `JWT_EXPIRATION` | JWT 過期時間（毫秒） | `86400000` (24 小時) | ✅ 必須 |
| `CORS_ALLOWED_ORIGINS` | 允許的 CORS 來源 | `http://localhost:5173,https://se-project2025-frontend.vercel.app` | ✅ 必須 |
| `SERVER_PORT` | 後端服務端口 | `8080` | ⚠️ 可選（預設 8080） |

### 前端環境變數

| 變數名稱 | 說明 | 範例值 | 是否必須 |
|---------|------|--------|---------|
| `VITE_API_URL` | 後端 API URL | `http://localhost:8080` | ⚠️ 可選（前端會自動檢測） |

---

## API 端點清單

### 公開端點（不需要認證）

| 方法 | 路徑 | 說明 |
|------|------|------|
| `POST` | `/api/auth/register` | 註冊新使用者 |
| `POST` | `/api/auth/login` | 使用者登入 |
| `GET` | `/api/products` | 取得商品列表 |
| `GET` | `/api/products/{id}` | 取得商品詳情 |
| `GET` | `/api/search` | 搜尋商品 |
| `GET` | `/api/user/{userId}` | 取得公開使用者資訊 |
| `GET` | `/swagger-ui.html` | Swagger API 文件 |
| `GET` | `/v3/api-docs` | OpenAPI 規格 |

### 需要認證的端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/api/user/me` | 取得當前使用者資訊 |
| `PUT` | `/api/user/me` | 更新使用者資訊 |
| `POST` | `/api/products/add` | 新增商品 |
| `PUT` | `/api/products/edit/{id}` | 編輯商品 |
| `DELETE` | `/api/products/delete/{id}` | 刪除商品 |
| 其他需要 JWT Token 的端點 | - | - |

### 健康檢查端點

**注意：** 專案中沒有 Spring Boot Actuator 依賴，但可以使用以下端點作為健康檢查：

1. **Swagger UI**（推薦）
   ```bash
   curl http://localhost:8080/swagger-ui.html
   ```

2. **公開 API 端點**
   ```bash
   curl http://localhost:8080/api/products
   ```

---

## 故障排除

### 問題 1：後端啟動失敗

**症狀：** CI 日誌顯示後端無法啟動

**可能原因：**
- GitHub Secrets 未設定或設定錯誤
- MongoDB URI 不正確
- Java 21 未正確安裝

**解決方法：**
1. 檢查 GitHub Secrets 是否正確設定
2. 確認 MongoDB Atlas 允許 GitHub Actions 的 IP 訪問
3. 查看 CI 日誌中的詳細錯誤訊息

### 問題 2：後端啟動超時

**症狀：** "Wait for Backend to be ready" 步驟超時

**可能原因：**
- 後端首次啟動需要下載依賴（2-5 分鐘）
- 網路連線問題

**解決方法：**
1. 增加等待時間（目前設定為 120 秒）
2. 檢查 Maven 依賴快取是否正常運作
3. 查看後端啟動日誌

### 問題 3：測試帳號創建失敗

**症狀：** "Create Test User" 步驟顯示錯誤

**可能原因：**
- 測試帳號已存在
- 後端尚未完全啟動

**解決方法：**
- 此錯誤不影響測試繼續執行（使用 `|| echo` 處理）
- 如果帳號已存在，測試會使用現有帳號

### 問題 4：測試失敗

**症狀：** Playwright 測試失敗

**可能原因：**
- 後端未成功啟動
- API 端點無法訪問
- 測試帳號問題

**解決方法：**
1. 檢查 "Wait for Backend to be ready" 步驟是否成功
2. 確認 `VITE_API_URL` 設定為 `http://localhost:8080`
3. 查看 Playwright 測試報告中的詳細錯誤

### 問題 5：MongoDB 連線失敗

**症狀：** 後端日誌顯示 MongoDB 連線錯誤

**可能原因：**
- MongoDB Atlas IP 白名單未包含 GitHub Actions IP
- MongoDB URI 不正確

**解決方法：**
1. 在 MongoDB Atlas 中設定 IP 白名單為 `0.0.0.0/0`（允許所有 IP）
2. 確認 MongoDB URI 格式正確

---

## 參考資料

### 相關文件

- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [Playwright 文件](https://playwright.dev/)
- [Spring Boot 文件](https://spring.io/projects/spring-boot)
- [Maven Wrapper 文件](https://maven.apache.org/wrapper/)

### 相關檔案

- CI 配置：`.github/workflows/playwright.yml`
- 前端 API 配置：`src/config/api.ts`
- Playwright 設定：`playwright.config.ts`
- 測試檔案：`tests/`

### 聯絡資訊

如有問題，請聯絡：
- 後端團隊：確認環境變數和配置
- 前端團隊：確認測試配置和 API 整合

---

**最後更新：** 2025-12-19

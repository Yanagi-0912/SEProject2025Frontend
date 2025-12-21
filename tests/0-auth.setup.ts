import { test as setup } from '@playwright/test';

setup('登入並儲存認證狀態', async ({ page }) => {
  // 設置較長的超時時間（60秒）
  setup.setTimeout(60000);
  
  // 監聽網絡請求，用於調試
  page.on('response', response => {
    if (response.url().includes('/api/auth/login')) {
      console.log(`登入 API 回應: ${response.status()} ${response.statusText()}`);
    }
  });
  
  page.on('requestfailed', request => {
    if (request.url().includes('/api/auth/login')) {
      console.log(`登入 API 請求失敗: ${request.failure()?.errorText}`);
    }
  });
  
  await page.goto('http://localhost:5173/login');
  
  // 等待登入表單載入
  await page.waitForSelector('input[id="username"]', { timeout: 10000 });
  
  await page.fill('input[id="username"]', 'testuser');
  await page.fill('input[id="password"]', 'Test123456');
  
  // 點擊登入按鈕並等待響應
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/auth/login'), { timeout: 30000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  
  // 檢查 API 回應
  if (response) {
    console.log(`登入 API 狀態: ${response.status()}`);
    if (!response.ok()) {
      const errorText = await response.text().catch(() => '無法讀取錯誤訊息');
      throw new Error(`登入失敗: ${response.status()} ${response.statusText()} - ${errorText}`);
    }
  } else {
    console.log('警告: 未收到登入 API 回應，繼續等待...');
  }
  
  // 等待登入完成：檢查 localStorage 中是否有 token
  try {
    await page.waitForFunction(() => {
      return localStorage.getItem('token') !== null;
    }, { timeout: 30000 });
    console.log('登入成功: localStorage 中已找到 token');
  } catch (error) {
    // 如果等待 token 失敗，檢查是否有錯誤訊息
    const alertText = await page.evaluate(() => {
      // 檢查是否有 alert（這會在頁面上顯示）
      return document.body.textContent || '';
    });
    
    // 檢查當前 URL 是否還在登入頁面
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(`登入失敗: 仍在登入頁面。可能原因：1) 後端 API 未運行 2) 帳號密碼錯誤 3) 網絡錯誤。當前 URL: ${currentUrl}`);
    }
    
    throw error;
  }
  
  // 等待導航到首頁
  try {
    await page.waitForURL(/http:\/\/localhost:5173\/.*/, { timeout: 10000 });
  } catch {
    // 如果 URL 等待失敗，至少確認已經在首頁（通過檢查首頁元素）
    await page.waitForSelector('.main-container, .header-container', { timeout: 10000 });
  }
  
  // 額外確認：等待首頁元素出現
  await page.waitForSelector('.main-container, .header-container', { timeout: 10000 });
  
  // 儲存認證狀態（cookies, localStorage 等）
  await page.context().storageState({ 
    path: 'tests/.auth/user.json' 
  });
  
  console.log('認證狀態已儲存');
});
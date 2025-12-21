import { test as setup } from '@playwright/test';

setup('登入並儲存認證狀態', async ({ page }) => {
  // 設置較長的超時時間（60秒）
  setup.setTimeout(60000);
  
  await page.goto('http://localhost:5173/login');
  
  // 等待登入表單載入
  await page.waitForSelector('input[id="username"]', { timeout: 10000 });
  
  await page.fill('input[id="username"]', 'testuser');
  await page.fill('input[id="password"]', 'Test123456');
  
  // 點擊登入按鈕
  await page.click('button[type="submit"]');
  
  // 等待登入完成：檢查 localStorage 中是否有 token（最可靠的指標）
  await page.waitForFunction(() => {
    return localStorage.getItem('token') !== null;
  }, { timeout: 30000 });
  
  // 等待導航到首頁（使用正則表達式匹配任何 localhost:5173 的路徑）
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
});
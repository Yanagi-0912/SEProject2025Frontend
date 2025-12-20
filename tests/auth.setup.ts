import { test as setup } from '@playwright/test';

setup('登入並儲存認證狀態', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  
  // 等待登入完成
  await page.waitForURL('http://localhost:5173/');
  
  // 儲存認證狀態（cookies, localStorage 等）
  await page.context().storageState({ 
    path: 'tests/.auth/user.json' 
  });
});
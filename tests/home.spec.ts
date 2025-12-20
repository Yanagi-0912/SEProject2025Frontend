import { test, expect } from '@playwright/test';

test('首頁標題正確', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page).toHaveTitle(/拍賣網站/);
});
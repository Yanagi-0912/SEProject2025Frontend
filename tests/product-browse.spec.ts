import { test, expect } from '@playwright/test';

test('商品列表載入', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('.product-card')).toHaveCount({ minimum: 1 });
});

test('商品搜尋功能', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('input[placeholder*="搜尋"]', '手機');
  await page.press('input[placeholder*="搜尋"]', 'Enter');
  await expect(page.locator('.product-card')).toHaveCount({ minimum: 1 });
});

test('商品分類篩選', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=電子產品');
  await expect(page).toHaveURL(/category=電子產品/);
});
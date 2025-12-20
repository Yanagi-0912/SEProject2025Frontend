import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/.auth/user.json' }); // 預先登入

test('查看競標商品詳情', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('.product-card:has-text("競標") >> nth=0');
  await expect(page.locator('text=剩餘時間')).toBeVisible();
  await expect(page.locator('text=目前最高出價')).toBeVisible();
});

test('出價功能', async ({ page }) => {
  await page.goto('http://localhost:5173/product/auction-product-id');
  await page.fill('input[placeholder*="出價"]', '1000');
  await page.click('button:has-text("立即出價")');
  await expect(page.locator('text=出價成功')).toBeVisible();
});
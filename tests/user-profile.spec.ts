import { test, expect } from '@playwright/test';

// tests/user-profile.spec.ts
test('查看訂單歷史', async ({ page }) => {
  await page.goto('http://localhost:5173/profile');
  await page.click('button:has-text("OrderHistory")');
  await expect(page.locator('.user-history-list-item')).toHaveCount({ minimum: 0 });
});

test('查看購買紀錄', async ({ page }) => {
  await page.goto('http://localhost:5173/profile');
  await page.click('button:has-text("PurchaseHistory")');
  await expect(page.locator('.user-history-list')).toBeVisible();
});

test('訂單詳情展開', async ({ page }) => {
  await page.goto('http://localhost:5173/profile');
  await page.click('.user-history-list-item >> button:has-text("查看詳情") >> nth=0');
  await expect(page.locator('.user-history-detail')).toBeVisible();
  await expect(page.locator('text=訂單編號')).toBeVisible();
});
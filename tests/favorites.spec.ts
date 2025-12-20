import { test, expect } from '@playwright/test';

// tests/favorites.spec.ts
test('加入收藏', async ({ page }) => {
  await page.goto('http://localhost:5173/product/product-id');
  await page.click('button:has-text("加入收藏")');
  await expect(page.locator('button:has-text("移除收藏")')).toBeVisible();
});

test('查看收藏清單', async ({ page }) => {
  await page.goto('http://localhost:5173/favorites');
  await expect(page.locator('.product-card')).toHaveCount(1);
});
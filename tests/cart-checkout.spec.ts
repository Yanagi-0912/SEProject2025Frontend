import { test, expect } from '@playwright/test';

test('加入購物車', async ({ page }) => {
  await page.goto('http://localhost:5173/product/product-id');
  await page.click('button:has-text("加入購物車")');
  await expect(page.locator('text=已加入購物車')).toBeVisible();
  await page.click('a[href*="cart"]');
  await expect(page.locator('.cart-item')).toHaveCount(1);
});

test('購物車數量調整', async ({ page }) => {
  await page.goto('http://localhost:5173/cart');
  await page.click('.cart-item >> button[aria-label="增加數量"]');
  await expect(page.locator('.cart-item >> text=2')).toBeVisible();
});

test('結帳流程', async ({ page }) => {
  await page.goto('http://localhost:5173/cart');
  await page.click('button:has-text("結帳")');
  await page.fill('input[name="address"]', '台北市信義區');
  await page.fill('input[name="phone"]', '0912345678');
  await page.click('button:has-text("確認訂單")');
  await expect(page).toHaveURL(/order-success/);
});
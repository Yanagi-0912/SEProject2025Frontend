import { test, expect } from '@playwright/test';

// tests/seller.spec.ts
test('建立新商品', async ({ page }) => {
  await page.goto('http://localhost:5173/profile');
  await page.click('text=賣家中心');
  await page.click('button:has-text("建立新商品")');
  await page.fill('input[name="productName"]', '測試商品');
  await page.fill('input[name="productPrice"]', '999');
  await page.fill('input[name="productStock"]', '10');
  await page.selectOption('select[name="productType"]', 'DIRECT');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=測試商品')).toBeVisible();
});

test('上傳商品圖片', async ({ page }) => {
  await page.goto('http://localhost:5173/profile/seller');
  await page.click('button:has-text("建立新商品")');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/test-image.jpg');
  await expect(page.locator('.image-preview')).toBeVisible();
});

test('編輯商品', async ({ page }) => {
  await page.goto('http://localhost:5173/profile/seller');
  await page.click('.product-card >> button:has-text("編輯") >> nth=0');
  await page.fill('input[name="productPrice"]', '1299');
  await page.click('button:has-text("更新商品")');
  await expect(page.locator('text=商品更新成功')).toBeVisible();
});
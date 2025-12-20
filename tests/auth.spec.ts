import { test, expect } from '@playwright/test';

test('使用者註冊流程', async ({ page }) => {
  await page.goto('http://localhost:5173/register');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/login/);
});

test('使用者登入流程', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'Test123456');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\//);
  await expect(page.locator('text=testuser')).toBeVisible();
});
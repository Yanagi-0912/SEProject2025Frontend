import { test, expect } from '@playwright/test'

test.describe('首頁 Header 功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('點擊回首頁按鈕', async ({ page }) => {
    const homeBtn = page.locator('.back-button')
    await expect(homeBtn).toBeVisible()
    await homeBtn.click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('搜尋欄輸入關鍵字並更新 URL', async ({ page }) => {
    const searchInput = page.locator('.search-input')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('手機')
    await expect(page).toHaveURL(/\?keyword=%E6%89%8B%E6%A9%9F/)
  })

  test('我的帳號按鈕', async ({ page }) => {
    const accountBtn = page.locator('.header-container .action-button:has-text("我的帳號")')
    if (await accountBtn.count()) {
      await accountBtn.click()
      await expect(page).toHaveURL(/\/user\/me/)
    } else {
      console.log('未登入狀態，跳過「我的帳號」導航驗證')
    }
  })

  test('我的最愛按鈕', async ({ page }) => {
    const favoriteBtn = page.locator('.header-container .action-button:has-text("我的最愛")')
    if (await favoriteBtn.count()) {
      await favoriteBtn.click()
      await expect(page).toHaveURL(/\/favorites\/me/)
    } else {
      console.log('未登入狀態，跳過「我的最愛」導航驗證')
    }
  })

  test('購物車按鈕', async ({ page }) => {
    const cartBtn = page.locator('.header-container .action-button:has-text("購物車")')
    if (await cartBtn.count()) {
      await cartBtn.click()
      await expect(page).toHaveURL(/\/cart/)
    } else {
      console.log('未登入狀態，跳過「購物車」導航驗證')
    }
  })

  test('訊息按鈕', async ({ page }) => {
    const chatBtn = page.locator('.header-container .action-button:has-text("訊息")')
    if (await chatBtn.count()) {
      await chatBtn.click()
      await expect(page).toHaveURL(/\/chat/)
    } else {
      console.log('未登入狀態，跳過「訊息」導航驗證')
    }
  })

  test('登出按鈕', async ({ page }) => {
    const logoutBtn = page.locator('.header-container .action-button:has-text("登出")')
    if (await logoutBtn.count()) {
      page.on('dialog', dialog => dialog.accept())
      await logoutBtn.click()
      await expect(page).toHaveURL(/\/$/)
      const token = await page.evaluate(() => localStorage.getItem('token'))
      expect(token).toBeNull()
    } else {
      console.log('未登入狀態，跳過「登出」驗證')
    }
  })
})

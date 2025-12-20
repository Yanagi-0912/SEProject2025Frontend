import { test, expect } from '@playwright/test'

test.describe('使用者個人檔案頁', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/me')
    await page.waitForSelector('.user-profile-container', { timeout: 10000 })
  })

  test('顯示基本資訊與評分', async ({ page }) => {
    const header = page.locator('.user-profile-header h1')
    const email = page.locator('.user-profile-header p')
    await expect(header).toBeVisible()
    await expect(email).toBeVisible()

    const ratingItems = page.locator('.rating-section .rating-item')
    expect(await ratingItems.count()).toBeGreaterThanOrEqual(2)
    await expect(ratingItems.nth(0)).toBeVisible()
    await expect(ratingItems.nth(1)).toBeVisible()
  })

  test('切換編輯模式與取消', async ({ page }) => {
    const editBtn = page.locator('.edit-button')
    await expect(editBtn).toBeVisible()
    await editBtn.click()

    const editForm = page.locator('.profile-edit-form')
    await expect(editForm).toBeVisible()

    // 取消編輯
    const cancelBtn = page.locator('.cancel-button')
    await cancelBtn.click()
    await expect(editForm).toHaveCount(0)
  })

  test('功能選單 - 優惠券', async ({ page }) => {
    const btn = page.locator('button.control-panel-btn', { hasText: '優惠券' })
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/\/profile\/coupons/)
  })

  test('功能選單 - 歷史紀錄', async ({ page }) => {
    const btn = page.locator('button.control-panel-btn', { hasText: '歷史紀錄' })
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/\/profile\/history/)
  })

  test('功能選單 - 賣家後台', async ({ page }) => {
    const btn = page.locator('button.control-panel-btn', { hasText: '賣家後台' })
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/\/seller\/dashboard/)
  })

  test('功能選單 - 修改密碼觸發提示', async ({ page }) => {
    const btn = page.locator('button.control-panel-btn', { hasText: '修改密碼' })
    await expect(btn).toBeVisible()

    let prompted = 0
    page.on('dialog', dialog => {
      prompted += 1
      dialog.dismiss()
    })

    await btn.click()
    await page.waitForTimeout(500)

    expect(prompted).toBeGreaterThan(0)
    await expect(page).toHaveURL(/\/user\/me/)
  })
})

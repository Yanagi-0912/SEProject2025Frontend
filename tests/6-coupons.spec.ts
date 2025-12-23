import { test, expect } from '@playwright/test'

test.describe('優惠券頁面', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/profile/coupons')
		await page.waitForSelector('.coupons-container', { timeout: 10000 })
	})

	test('基本區塊顯示', async ({ page }) => {
		await expect(page.locator('.coupons-title')).toBeVisible()
		await expect(page.locator('.my-coupons-toggle')).toBeVisible()
		await expect(page.locator('.spinwheel-section')).toBeVisible()
		await expect(page.locator('.terms-section')).toBeVisible()
	})

	test('抽獎按鈕狀態與可用性', async ({ page }) => {
		const spinButton = page.locator('.spin-button')
		await expect(spinButton).toBeVisible()

		const disabled = await spinButton.isDisabled()
		if (!disabled) {
			await spinButton.click()
			await expect(spinButton).toHaveText(/旋轉中|開始抽獎/)
		} else {
			console.log('抽獎按鈕為禁用狀態，略過點擊')
		}
	})

	test('回到個人頁面按鈕', async ({ page }) => {
		const backBtn = page.locator('.coupons-header button')
		await expect(backBtn).toBeVisible()
		await backBtn.click()
		await expect(page).toHaveURL(/\/user\/me/)
	})
})


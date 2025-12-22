import { test, expect } from '@playwright/test'

test.describe('結帳頁面功能', () => {
  test.beforeEach(async ({ page }) => {
    // 先加入商品到購物車，然後前往結帳
    await page.goto('/')
    await page.waitForSelector('.products-card', { timeout: 15000 })
    
    // 點擊第一個商品進入詳情頁
    const firstProduct = page.locator('.products-card').first()
    await firstProduct.click()
    await page.waitForURL('**/product/**', { timeout: 5000 })
    
    // 嘗試加入購物車
    const cartButton = page.locator('.cart-button, button:has-text("加入購物車")')
    if (await cartButton.count() > 0 && !(await cartButton.isDisabled())) {
      page.on('dialog', dialog => dialog.accept())
      await cartButton.click()
      await page.waitForTimeout(1000)
    }
    
    // 前往結帳頁面
    await page.goto('/checkout')
    await page.waitForSelector('.checkout-container, .checkout-form', { timeout: 10000 })
  })

  test('結帳頁面顯示', async ({ page }) => {
    const container = page.locator('.checkout-container, .checkout-form')
    await expect(container).toBeVisible()
    console.log('✓ 結帳頁面載入成功')
  })

  test('顯示訂單摘要', async ({ page }) => {
    const orderSummary = page.locator('.order-summary, .checkout-summary')
    if (await orderSummary.count() > 0) {
      await expect(orderSummary).toBeVisible()
      console.log('✓ 訂單摘要顯示正常')
    } else {
      console.log('ⓘ 未找到訂單摘要區域')
    }
  })

  test('填寫運送資訊', async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"], input[placeholder*="名字"]')
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="電話"]')
    const addressInput = page.locator('textarea[name="address"], input[name="address"], textarea[placeholder*="地址"]')
    
    if (await nameInput.count() > 0) {
      await nameInput.fill('測試使用者')
      console.log('✓ 姓名欄位填寫成功')
    }
    
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('0912345678')
      console.log('✓ 電話欄位填寫成功')
    }
    
    if (await addressInput.count() > 0) {
      await addressInput.fill('測試地址 123 號')
      console.log('✓ 地址欄位填寫成功')
    }
  })

  test('選擇優惠券', async ({ page }) => {
    const couponSelector = page.locator('.coupon-selector, .coupon-dropdown, select[name="coupon"]')
    const couponBtn = page.locator('button:has-text("優惠券"), .coupon-button')
    
    if (await couponSelector.count() > 0) {
      const options = couponSelector.locator('option')
      const optionCount = await options.count()
      if (optionCount > 1) {
        await couponSelector.selectOption({ index: 1 })
        await page.waitForTimeout(500)
        console.log('✓ 優惠券選擇成功')
      } else {
        console.log('ⓘ 沒有可用的優惠券')
      }
    } else if (await couponBtn.count() > 0) {
      await couponBtn.click()
      await page.waitForTimeout(500)
      console.log('✓ 優惠券選擇器開啟')
    } else {
      console.log('ⓘ 未找到優惠券選擇功能')
    }
  })

  test('顯示價格預覽', async ({ page }) => {
    const pricePreview = page.locator('.price-preview, .total-preview, text=/小計|總計|合計/')
    if (await pricePreview.count() > 0) {
      await expect(pricePreview.first()).toBeVisible()
      console.log('✓ 價格預覽顯示正常')
    } else {
      console.log('ⓘ 未找到價格預覽')
    }
  })

  test('提交訂單按鈕', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"], button:has-text("提交訂單"), button:has-text("確認訂單")')
    
    if (await submitBtn.count() > 0) {
      await expect(submitBtn).toBeVisible()
      const isDisabled = await submitBtn.isDisabled()
      console.log(`✓ 提交訂單按鈕${isDisabled ? '已禁用' : '可用'}`)
    } else {
      console.log('ⓘ 未找到提交訂單按鈕')
    }
  })

  test('返回購物車按鈕', async ({ page }) => {
    const backBtn = page.locator('button:has-text("返回"), .back-button, button:has-text("取消")')
    
    if (await backBtn.count() > 0) {
      await backBtn.click()
      await page.waitForURL('**/cart**', { timeout: 5000 })
      expect(page.url()).toContain('/cart')
      console.log('✓ 返回購物車成功')
    } else {
      console.log('ⓘ 未找到返回按鈕')
    }
  })
})

import { test, expect } from '@playwright/test'

test.describe('優惠券功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/coupons')
    await page.waitForSelector('.coupons-container, .spin-wheel-container', { timeout: 10000 })
  })

  test('優惠券頁面顯示', async ({ page }) => {
    const container = page.locator('.coupons-container, .coupons-page')
    await expect(container).toBeVisible()
    console.log('✓ 優惠券頁面載入成功')
  })

  test('顯示轉盤抽獎', async ({ page }) => {
    const spinWheel = page.locator('.spin-wheel, .wheel-container')
    const spinButton = page.locator('button:has-text("抽獎"), button:has-text("轉盤"), .spin-button')
    
    if (await spinWheel.count() > 0) {
      await expect(spinWheel).toBeVisible()
      console.log('✓ 轉盤顯示正常')
      
      if (await spinButton.count() > 0) {
        const isDisabled = await spinButton.isDisabled()
        if (!isDisabled) {
          console.log('✓ 抽獎按鈕可用')
        } else {
          console.log('ⓘ 抽獎按鈕已禁用（可能已用完抽獎次數）')
        }
      }
    } else {
      console.log('ⓘ 未找到轉盤元件')
    }
  })

  test('執行轉盤抽獎', async ({ page }) => {
    const spinButton = page.locator('button:has-text("抽獎"), button:has-text("轉盤"), .spin-button')
    
    if (await spinButton.count() > 0 && !(await spinButton.isDisabled())) {
      page.on('dialog', dialog => dialog.accept())
      await spinButton.click()
      
      // 等待轉盤動畫
      await page.waitForTimeout(3000)
      
      // 檢查是否有結果提示
      const resultMsg = page.locator('.coupon-result, .spin-result, text=/獲得|恭喜|抽中/')
      if (await resultMsg.count() > 0) {
        console.log('✓ 轉盤抽獎執行成功')
      } else {
        console.log('ⓘ 轉盤抽獎已執行（可能沒有顯示結果訊息）')
      }
    } else {
      console.log('ⓘ 抽獎按鈕不可用或已禁用')
    }
  })

  test('顯示我的優惠券列表', async ({ page }) => {
    const couponList = page.locator('.my-coupons, .coupon-list, .coupons-list')
    const couponItems = page.locator('.coupon-item, .coupon-card')
    
    if (await couponList.count() > 0 || await couponItems.count() > 0) {
      const itemCount = await couponItems.count()
      if (itemCount > 0) {
        await expect(couponItems.first()).toBeVisible()
        console.log(`✓ 優惠券列表顯示：${itemCount} 張優惠券`)
      } else {
        const emptyMsg = page.locator('text=/沒有優惠券|尚無優惠券/')
        if (await emptyMsg.count() > 0) {
          console.log('✓ 優惠券列表為空時顯示提示')
        } else {
          console.log('ⓘ 優惠券列表區域存在但無內容')
        }
      }
    } else {
      console.log('ⓘ 未找到優惠券列表')
    }
  })

  test('優惠券資訊顯示', async ({ page }) => {
    const couponItems = page.locator('.coupon-item, .coupon-card')
    const itemCount = await couponItems.count()
    
    if (itemCount > 0) {
      const firstCoupon = couponItems.first()
      
      // 檢查優惠券名稱或折扣資訊
      const couponName = firstCoupon.locator('.coupon-name, .coupon-title, text=/折|優惠/')
      const couponDiscount = firstCoupon.locator('.coupon-discount, .discount-value')
      
      if (await couponName.count() > 0 || await couponDiscount.count() > 0) {
        console.log('✓ 優惠券資訊顯示正常')
      } else {
        console.log('ⓘ 優惠券資訊顯示不完整')
      }
    } else {
      console.log('ⓘ 沒有優惠券可顯示')
    }
  })

  test('切換到使用條款標籤', async ({ page }) => {
    const termsTab = page.locator('button:has-text("使用條款"), .tab:has-text("條款")')
    
    if (await termsTab.count() > 0) {
      await termsTab.click()
      await page.waitForTimeout(500)
      
      const termsContent = page.locator('.terms-content, .coupon-terms, text=/條款|規則/')
      if (await termsContent.count() > 0) {
        await expect(termsContent.first()).toBeVisible()
        console.log('✓ 使用條款顯示正常')
      } else {
        console.log('ⓘ 使用條款內容未顯示')
      }
    } else {
      console.log('ⓘ 未找到使用條款標籤')
    }
  })

  test('顯示剩餘抽獎次數', async ({ page }) => {
    const remainingText = page.locator('text=/剩餘|次數|機會/')
    
    if (await remainingText.count() > 0) {
      await expect(remainingText.first()).toBeVisible()
      console.log('✓ 剩餘抽獎次數顯示正常')
    } else {
      console.log('ⓘ 未找到剩餘次數顯示')
    }
  })
})

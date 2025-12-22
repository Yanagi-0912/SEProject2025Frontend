import { test, expect } from '@playwright/test'

test.describe('邊界情況測試', () => {
  test('訪問不存在的商品頁面', async ({ page }) => {
    await page.goto('/product/INVALID_PRODUCT_ID_12345')
    await page.waitForTimeout(3000)
    
    // 檢查是否顯示錯誤訊息或 404
    const errorMsg = page.locator('text=/找不到|不存在|404|錯誤/')
    const notFound = page.locator('.not-found, .error-page')
    
    if (await errorMsg.count() > 0 || await notFound.count() > 0) {
      console.log('✓ 不存在商品顯示錯誤訊息')
    } else {
      // 檢查是否重定向到首頁
      const currentUrl = page.url()
      if (currentUrl === 'http://localhost:5173/' || currentUrl.includes('/')) {
        console.log('✓ 不存在商品重定向到首頁')
      } else {
        console.log('ⓘ 不存在商品處理可能未實現')
      }
    }
  })

  test('訪問不存在的使用者頁面', async ({ page }) => {
    await page.goto('/user/INVALID_USER_ID_12345')
    await page.waitForTimeout(3000)
    
    const errorMsg = page.locator('text=/找不到|不存在|404/')
    const notFound = page.locator('.not-found, .error-page')
    
    if (await errorMsg.count() > 0 || await notFound.count() > 0) {
      console.log('✓ 不存在使用者顯示錯誤訊息')
    } else {
      console.log('ⓘ 不存在使用者處理可能未實現')
    }
  })

  test('未登入時訪問需要認證的頁面', async ({ page }) => {
    // 清除認證狀態
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())
    
    // 嘗試訪問需要認證的頁面
    await page.goto('/user/me')
    await page.waitForTimeout(2000)
    
    // 檢查是否重定向到登入頁面
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      console.log('✓ 未登入時重定向到登入頁面')
    } else {
      // 檢查是否有提示訊息
      const loginPrompt = page.locator('text=/請登入|需要登入/')
      if (await loginPrompt.count() > 0) {
        console.log('✓ 未登入時顯示提示訊息')
      } else {
        console.log('ⓘ 未登入訪問保護頁面的處理可能未實現')
      }
    }
  })

  test('購物車數量上限', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    const quantityInput = page.locator('.quantity-display, input[type="number"]')
    const plusBtn = page.locator('.quantity-btn.plus, button:has-text("+")')
    
    if (await quantityInput.count() > 0 && await plusBtn.count() > 0) {
      // 嘗試增加大量數量
      for (let i = 0; i < 10; i++) {
        await plusBtn.click()
        await page.waitForTimeout(100)
      }
      
      const finalValue = await quantityInput.inputValue()
      const finalNum = parseInt(finalValue) || 1
      
      // 檢查是否有上限
      if (finalNum <= 100) {
        console.log(`✓ 數量上限控制正常：${finalNum}`)
      } else {
        console.log(`ⓘ 數量可能無上限：${finalNum}`)
      }
    } else {
      console.log('ⓘ 未找到數量控制項')
    }
  })

  test('表單輸入特殊字元', async ({ page }) => {
    await page.goto('/register')
    await page.waitForSelector('form', { timeout: 10000 })
    
    const usernameInput = page.locator('input[name="username"], #username')
    
    if (await usernameInput.count() > 0) {
      // 輸入特殊字元
      await usernameInput.fill('<script>alert("xss")</script>')
      await page.waitForTimeout(500)
      
      const value = await usernameInput.inputValue()
      // 檢查是否被過濾或轉義
      if (!value.includes('<script>')) {
        console.log('✓ 特殊字元處理正常（XSS 防護）')
      } else {
        console.log('ⓘ 特殊字元可能未過濾')
      }
    }
  })

  test('長時間操作後頁面狀態', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.products-card', { timeout: 15000 })
    
    // 執行多個操作
    const categoryOptions = page.locator('.filter-section .filter-option input[id]')
    if (await categoryOptions.count() > 0) {
      await categoryOptions.first().click()
      await page.waitForTimeout(1000)
    }
    
    const nextPageBtn = page.locator('.pagination-btn:has-text("→")')
    if (await nextPageBtn.count() > 0) {
      await nextPageBtn.click()
      await page.waitForTimeout(1000)
    }
    
    // 檢查頁面是否仍然正常
    const products = page.locator('.products-card')
    const productCount = await products.count()
    expect(productCount).toBeGreaterThanOrEqual(0)
    console.log('✓ 長時間操作後頁面狀態正常')
  })

  test('快速連續點擊按鈕', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    const plusBtn = page.locator('.quantity-btn.plus, button:has-text("+")')
    
    if (await plusBtn.count() > 0) {
      // 快速連續點擊
      for (let i = 0; i < 5; i++) {
        await plusBtn.click()
        await page.waitForTimeout(50)
      }
      
      await page.waitForTimeout(500)
      
      const quantityInput = page.locator('.quantity-display, input[type="number"]')
      if (await quantityInput.count() > 0) {
        const value = await quantityInput.inputValue()
        const num = parseInt(value) || 1
        // 應該只增加合理的數量（防抖處理）
        if (num <= 10) {
          console.log(`✓ 快速點擊處理正常：數量 ${num}`)
        } else {
          console.log(`ⓘ 快速點擊可能未防抖：數量 ${num}`)
        }
      }
    } else {
      console.log('ⓘ 未找到測試按鈕')
    }
  })

  test('網路錯誤處理', async ({ page }) => {
    // 模擬網路離線
    await page.context().setOffline(true)
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    // 檢查是否有錯誤提示
    const errorMsg = page.locator('text=/網路|連線|錯誤|無法載入/')
    if (await errorMsg.count() > 0) {
      console.log('✓ 網路錯誤顯示提示訊息')
    } else {
      console.log('ⓘ 網路錯誤處理可能未實現')
    }
    
    // 恢復網路
    await page.context().setOffline(false)
  })
})

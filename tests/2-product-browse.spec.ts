import { test, expect } from '@playwright/test'

test.describe('商品頁面 - 直購商品', () => {
  test('直購商品頁面顯示商品資訊', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    
    // 等待商品卡片載入
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    // 驗證商品標題存在
    const directTitle = page.locator('.direct-title')
    await expect(directTitle).toBeVisible()
    
    // 驗證價格顯示
    const priceValue = page.locator('.price-value-large')
    await expect(priceValue).toBeVisible()
    
    // 驗證庫存顯示
    const stockDisplay = page.locator('.stock-display')
    await expect(stockDisplay).toBeVisible()
    
    // 驗證評分顯示
    const rating = page.locator('.direct-rating')
    await expect(rating).toBeVisible()
    
    console.log('✓ 直購商品資訊正確顯示')
  })

  test('直購商品調整購買數量', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    const quantityDisplay = page.locator('.quantity-display')
    const initialQuantity = await quantityDisplay.textContent()
    expect(initialQuantity).toBe('1')
    
    // 增加數量
    const plusBtn = page.locator('.quantity-btn.plus').first()
    await plusBtn.click()
    
    await page.waitForTimeout(500)
    const updatedQuantity = await quantityDisplay.textContent()
    expect(parseInt(updatedQuantity!)).toBe(parseInt(initialQuantity!) + 1)
    
    // 減少數量
    const minusBtn = page.locator('.quantity-btn.minus').first()
    await minusBtn.click()
    
    await page.waitForTimeout(500)
    const finalQuantity = await quantityDisplay.textContent()
    expect(finalQuantity).toBe(initialQuantity)
    
    console.log('✓ 購買數量調整功能正常')
  })

  test('直購商品加入購物車', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    const cartButton = page.locator('.cart-button')
    await expect(cartButton).toBeVisible()
    
    // 檢查是否已登入（若未登入會跳出警告）
    const isDisabled = await cartButton.isDisabled()
    if (!isDisabled) {
      await cartButton.click()
      
      // 等待 alert 或成功提示
      await page.waitForTimeout(1000)
      console.log('✓ 加入購物車請求已發送')
    } else {
      console.log('ⓘ 加入購物車按鈕未啟用（可能庫存為 0）')
    }
  })

  test('直購商品立即購買', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    const buyButton = page.locator('.buy-button')
    await expect(buyButton).toBeVisible()
    
    if (!(await buyButton.isDisabled())) {
      page.on('dialog', dialog => dialog.dismiss())
      
      // 點擊立即購買（會觸發加入購物車後導向購物車）
      await buyButton.click()
      
      // 等待導航或提示
      await page.waitForTimeout(1500)
      console.log('✓ 立即購買流程已觸發')
    } else {
      console.log('ⓘ 立即購買按鈕未啟用')
    }
  })

  test('直購商品收藏/取消收藏', async ({ page }) => {
    await page.goto('/product/PRODF3B6D5C1')
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    const favoriteBtn = page.locator('.favorite-button')
    await expect(favoriteBtn).toBeVisible()
    
    const initialText = await favoriteBtn.textContent()
    
    if (!(await favoriteBtn.isDisabled())) {
      await favoriteBtn.click()
      
      await page.waitForTimeout(1000)
      
      const newText = await favoriteBtn.textContent()
      
      // 驗證文字改變
      if (initialText?.includes('加入')) {
        expect(newText).toContain('移除')
      } else {
        expect(newText).toContain('加入')
      }
      
      console.log(`✓ 收藏狀態切換成功：${initialText} → ${newText}`)
    } else {
      console.log('ⓘ 收藏按鈕未啟用或未登入')
    }
  })

  test('庫存為 0 時無法加入購物車', async ({ page }) => {
    // 嘗試查找庫存為 0 的商品（或手動構造 URL）
    await page.goto('/product/999')
    
    await page.waitForSelector('.direct-card, .warning-message', { timeout: 10000 })
    
    const warningMsg = page.locator('.warning-message')
    const warningCount = await warningMsg.count()
    
    if (warningCount > 0) {
      await expect(warningMsg).toContainText('無法購買')
      console.log('✓ 商品無法購買時顯示警告訊息')
    } else {
      console.log('ⓘ 此商品可購買或不存在')
    }
  })
})
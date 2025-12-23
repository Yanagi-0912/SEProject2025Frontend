import { test, expect, type Page } from '@playwright/test'

test.describe('商品頁面 - 直購商品', () => {
  let directProductId: string | null = null;
  let idFetched = false;

  async function ensureDirectProductId(page: Page) {
    if (idFetched) return;
    idFetched = true;

    await page.goto('/')
    await page.waitForSelector('.products-card', { timeout: 15000 })

    // 找第一個含有「加入購物車」按鈕的卡片（視為直購）
    const directCard = page.locator('.products-card').filter({ has: page.locator('.add-to-cart-button') }).first()
    if (await directCard.count() === 0) {
      console.log('ⓘ 首頁找不到直購商品，後續測試將跳過')
      return
    }
    await directCard.click()
    await page.waitForURL('**/product/**', { timeout: 10000 })
    const url = new URL(page.url())
    const segments = url.pathname.split('/')
    directProductId = segments.pop() || segments.pop() || null
    console.log('取得直購商品 ID:', directProductId)
  }

  test('直購商品頁面顯示商品資訊', async ({ page }) => {
    await ensureDirectProductId(page)
    if (!directProductId) return test.skip(true, '無可用直購商品')
    await page.goto(`/product/${directProductId}`)
    
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
    await ensureDirectProductId(page)
    if (!directProductId) return test.skip(true, '無可用直購商品')
    await page.goto(`/product/${directProductId}`)
    await page.waitForSelector('.direct-card', { timeout: 10000 })
    
    // 獲取庫存數量
    const stockDisplay = page.locator('.stock-display')
    const stockText = (await stockDisplay.textContent())?.replace(/[^0-9]/g, '') || '0'
    const stock = parseInt(stockText)
    
    const quantityDisplay = page.locator('.quantity-display')
    const initialQuantity = await quantityDisplay.textContent()
    expect(initialQuantity).toBe('1')
    
    const plusBtn = page.locator('.quantity-btn.plus').first()
    const minusBtn = page.locator('.quantity-btn.minus').first()
    
    // 增加數量，但不超過庫存
    if (stock > 1) {
      await plusBtn.click()
      
      await page.waitForTimeout(500)
      const updatedQuantity = await quantityDisplay.textContent()
      expect(parseInt(updatedQuantity!)).toBe(parseInt(initialQuantity!) + 1)
      console.log(`✓ 數量增加到 ${updatedQuantity}`)
      
      // 減少數量
      await minusBtn.click()
      
      await page.waitForTimeout(500)
      const finalQuantity = await quantityDisplay.textContent()
      expect(finalQuantity).toBe(initialQuantity)
      console.log('✓ 購買數量調整功能正常')
    } else {
      console.log('ⓘ 庫存為 1，無法測試增加數量')
    }
  })

  test('直購商品加入購物車', async ({ page }) => {
    await ensureDirectProductId(page)
    if (!directProductId) return test.skip(true, '無可用直購商品')
    await page.goto(`/product/${directProductId}`)
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
    await ensureDirectProductId(page)
    if (!directProductId) return test.skip(true, '無可用直購商品')
    await page.goto(`/product/${directProductId}`)
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
    await ensureDirectProductId(page)
    if (!directProductId) return test.skip(true, '無可用直購商品')
    await page.goto(`/product/${directProductId}`)
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
    await ensureDirectProductId(page)
    if (!directProductId) return test.skip(true, '無可用直購商品')
    // 使用實際直購商品，依據顯示庫存做條件驗證，避免 404 或不存在的測資
    await page.goto(`/product/${directProductId}`)
    await page.waitForSelector('.direct-card', { timeout: 10000 })

    const stockDisplay = page.locator('.stock-display')
    const stockText = (await stockDisplay.textContent())?.replace(/[^0-9]/g, '') || '0'
    const stock = parseInt(stockText)

    const cartButton = page.locator('.cart-button')
    const buyButton = page.locator('.buy-button')

    if (stock === 0) {
      // 庫存為 0 則加入/立即購買應不可用，且可能顯示警告
      await expect(cartButton).toBeDisabled()
      await expect(buyButton).toBeDisabled()

      const warningMsg = page.locator('.warning-message')
      const hasWarning = await warningMsg.count()
      if (hasWarning > 0) {
        await expect(warningMsg).toContainText(/無法購買|庫存不足|已售罄/)
      }
      console.log('✓ 庫存為 0 時購買功能被禁用')
    } else {
      console.log(`ⓘ 商品庫存為 ${stock}，跳過庫存為 0 的驗證`)
    }
  })
})
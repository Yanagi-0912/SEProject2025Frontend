import { test, expect, Page } from '@playwright/test'

test.describe('商品頁面 - 競標商品', () => {
  let auctionProductId: string | null = null;
  let idFetched = false;

  async function ensureAuctionProductId(page: Page) {
    if (idFetched) return;
    idFetched = true;

    await page.goto('/')
    await page.waitForSelector('.products-card', { timeout: 15000 })

    // 找第一個含有競標按鈕的商品卡片
    const auctionCard = page.locator('.products-card').filter({ has: page.locator('.add-to-auction-button') }).first()
    if (await auctionCard.count() === 0) {
      console.log('ⓘ 首頁找不到競標商品，後續測試將跳過')
      return
    }
    await auctionCard.click()
    await page.waitForURL('**/product/**', { timeout: 10000 })
    const url = new URL(page.url())
    const segments = url.pathname.split('/')
    auctionProductId = segments.pop() || segments.pop() || null
    console.log('取得競標商品 ID:', auctionProductId)
  }

  test('競標商品頁面顯示商品資訊', async ({ page }) => {
    await ensureAuctionProductId(page)
    if (!auctionProductId) return test.skip(true, '無可用競標商品')
    await page.goto(`/product/${auctionProductId}`)
    
    // 等待商品卡片載入
    await page.waitForSelector('.auction-card', { timeout: 10000 })
    
    // 驗證商品標題存在
    const auctionTitle = page.locator('.auction-title')
    await expect(auctionTitle).toBeVisible()
    
    // 驗證直購價格顯示
    const priceValue = page.locator('.price-value').first()
    await expect(priceValue).toBeVisible()
    
    // 驗證目前最高出價顯示
    const currentBid = page.locator('.current-bid')
    await expect(currentBid).toBeVisible()
    
    // 驗證倒計時顯示
    const countdown = page.locator('.countdown-display')
    await expect(countdown).toBeVisible()
    
    // 驗證評分顯示
    const rating = page.locator('.auction-rating')
    await expect(rating).toBeVisible()
    
    console.log('✓ 競標商品資訊正確顯示')
  })

  test('競標商品出價', async ({ page }) => {
    await ensureAuctionProductId(page)
    if (!auctionProductId) return test.skip(true, '無可用競標商品')
    await page.goto(`/product/${auctionProductId}`)
    await page.waitForSelector('.auction-card', { timeout: 10000 })
    
    // 等待出價輸入框
    const bidInput = page.locator('.bid-input')
    const bidButton = page.locator('.bid-button')
    
    if (await bidButton.count() > 0 && !(await bidButton.isDisabled())) {
      // 獲取目前最高出價
      const currentBidText = await page.locator('.current-bid').textContent()
      const currentBidPrice = parseInt(currentBidText?.replace(/[^0-9]/g, '') || '0')
      
      // 輸入高於目前最高出價的金額
      const newBidAmount = currentBidPrice + 100
      await bidInput.fill(newBidAmount.toString())
      
      // 點擊出價按鈕
      await bidButton.click()
      
      // 等待出價結果
      await page.waitForTimeout(2000)
      
      // 驗證是否有成功或失敗提示
      const message = page.locator('.bid-message')
      const messageCount = await message.count()
      
      if (messageCount > 0) {
        const messageText = await message.textContent()
        console.log(`✓ 出價結果：${messageText}`)
      } else {
        console.log('✓ 出價請求已發送')
      }
    } else {
      console.log('ⓘ 競標商品已結束或未啟用出價功能')
    }
  })

  test('競標商品出價低於最高出價會失敗', async ({ page }) => {
    await ensureAuctionProductId(page)
    if (!auctionProductId) return test.skip(true, '無可用競標商品')
    await page.goto(`/product/${auctionProductId}`)
    await page.waitForSelector('.auction-card', { timeout: 10000 })
    
    const bidInput = page.locator('.bid-input')
    const bidButton = page.locator('.bid-button')
    
    if (await bidButton.count() > 0 && !(await bidButton.isDisabled())) {
      // 獲取目前最高出價
      const currentBidText = await page.locator('.current-bid').textContent()
      const currentBidPrice = parseInt(currentBidText?.replace(/[^0-9]/g, '') || '0')
      
      // 輸入低於目前最高出價的金額
      const lowBidAmount = currentBidPrice - 1
      await bidInput.fill(lowBidAmount.toString())
      
      // 點擊出價按鈕
      await bidButton.click()
      
      // 等待提示
      await page.waitForTimeout(1000)
      
      const message = page.locator('.bid-message')
      const messageText = await message.textContent()
      
      // 應該出現「出價需高於目前最高價」的提示
      expect(
        messageText?.includes('請輸入有效的出價金額') || 
        messageText?.includes('出價需高於目前最高價')
      ).toBeTruthy()
      console.log(`✓ 出價驗證正常：${messageText}`)
    }
  })

  test('競標商品倒計時顯示', async ({ page }) => {
    await ensureAuctionProductId(page)
    if (!auctionProductId) return test.skip(true, '無可用競標商品')
    await page.goto(`/product/${auctionProductId}`)
    await page.waitForSelector('.auction-card', { timeout: 10000 })
    
    // 驗證倒計時顯示
    const countdown = page.locator('.countdown-display')
    const countdownText = await countdown.textContent()
    
    // 倒計時應該包含時間單位或「已結束」
    const isValidCountdown = 
      countdownText?.includes('天') || 
      countdownText?.includes('時') || 
      countdownText?.includes('已結束') || 
      countdownText?.includes('年以上') ||
      countdownText?.includes('未設定')
    
    expect(isValidCountdown).toBe(true)
    console.log(`✓ 倒計時顯示：${countdownText}`)
  })

  test('競標商品收藏/取消收藏', async ({ page }) => {
    await ensureAuctionProductId(page)
    if (!auctionProductId) return test.skip(true, '無可用競標商品')
    await page.goto(`/product/${auctionProductId}`)
    await page.waitForSelector('.auction-card', { timeout: 10000 })
    
    const favoriteBtn = page.locator('.favorite-button-auction')
    const favCount = await favoriteBtn.count()
    if (favCount === 0) {
      console.log('ⓘ 此頁未顯示收藏按鈕（可能未登入或競標已結束）')
      return
    }
    await expect(favoriteBtn.first()).toBeVisible()
    
    const initialText = await favoriteBtn.first().textContent()
    
    if (!(await favoriteBtn.isDisabled())) {
      await favoriteBtn.first().click()
      
      await page.waitForTimeout(1000)
      
      const newText = await favoriteBtn.first().textContent()
      
      // 驗證文字改變
      if (initialText?.includes('加入')) {
        expect(newText).toContain('移除')
      } else {
        expect(newText).toContain('加入')
      }
      
      console.log(`✓ 競標商品收藏狀態切換成功：${initialText} → ${newText}`)
    } else {
      console.log('ⓘ 收藏按鈕未啟用或未登入')
    }
  })

  test('競標已結束時無法出價', async ({ page }) => {
    await ensureAuctionProductId(page)
    if (!auctionProductId) return test.skip(true, '無可用競標商品')
    await page.goto(`/product/${auctionProductId}`)
    await page.waitForSelector('.auction-card', { timeout: 10000 })
    
    const countdown = page.locator('.countdown-display')
    const countdownText = await countdown.textContent()
    
    if (countdownText?.includes('已結束')) {
      // 驗證無法出價
      const warningMsg = page.locator('.warning-message')
      await expect(warningMsg).toBeVisible()
      
      const bidButton = page.locator('.bid-button')
      expect(await bidButton.isDisabled()).toBe(true)
      
      console.log('✓ 競標已結束時無法出價')
    } else {
      console.log('ⓘ 競標商品尚未結束')
    }
  })
})
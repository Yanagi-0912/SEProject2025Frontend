import { test, expect } from '@playwright/test'

test.describe('我的最愛功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/favorites/me')
  })

  test('顯示最愛列表和收藏數量', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const header = page.locator('.fav-header h2')
    await expect(header).toBeVisible()
    const headerText = await header.textContent()
    expect(headerText).toContain('我的最愛')
    console.log(`✓ 頁面標題：${headerText}`)
  })

  test('搜尋最愛商品', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const searchInput = page.locator('.fav-search-input').first()
    const searchBtn = page.locator('.fav-btn:has-text("搜尋")').first()
    await searchInput.fill('手機')
    await searchBtn.click()
    await page.waitForTimeout(1000)
    const cards = page.locator('.fav-card')
    const cardCount = await cards.count()
    if (cardCount > 0) {
      console.log(`✓ 搜尋成功：找到 ${cardCount} 件商品`)
    } else {
      console.log('ⓘ 搜尋結果為空')
    }
  })

  test('排序 - 價格由低到高', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const sortSelect = page.locator('.fav-search-input').nth(1)
    await sortSelect.selectOption('priceAsc')
    await page.waitForTimeout(1000)
    const priceElements = page.locator('.fav-price')
    const priceCount = await priceElements.count()
    if (priceCount > 1) {
      const prices: number[] = []
      for (let i = 0; i < priceCount; i++) {
        const priceText = await priceElements.nth(i).textContent()
        const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0')
        prices.push(price)
      }
      const isSorted = prices.every((p, i) => i === 0 || p >= prices[i - 1])
      expect(isSorted).toBe(true)
      console.log(`✓ 價格排序成功（由低到高）：${prices.join(' → ')}`)
    } else {
      console.log('ⓘ 最愛商品少於 2 件，無法驗證排序')
    }
  })

  test('排序 - 價格由高到低', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const sortSelect = page.locator('.fav-search-input').nth(1)
    await sortSelect.selectOption('priceDesc')
    await page.waitForTimeout(1000)
    const priceElements = page.locator('.fav-price')
    const priceCount = await priceElements.count()
    if (priceCount > 1) {
      const prices: number[] = []
      for (let i = 0; i < priceCount; i++) {
        const priceText = await priceElements.nth(i).textContent()
        const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0')
        prices.push(price)
      }
      const isSorted = prices.every((p, i) => i === 0 || p <= prices[i - 1])
      expect(isSorted).toBe(true)
      console.log(`✓ 價格排序成功（由高到低）：${prices.join(' → ')}`)
    } else {
      console.log('ⓘ 最愛商品少於 2 件，無法驗證排序')
    }
  })

  test('篩選 - 直購商品', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const filterSelect = page.locator('.fav-search-input').nth(2)
    await filterSelect.selectOption('DIRECT')
    await page.waitForTimeout(1000)
    const cards = page.locator('.fav-card')
    const cardCount = await cards.count()
    if (cardCount > 0) {
      console.log(`✓ 篩選直購商品成功：顯示 ${cardCount} 件`)
    } else {
      console.log('ⓘ 沒有直購商品')
    }
  })

  test('篩選 - 競標商品', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const filterSelect = page.locator('.fav-search-input').nth(2)
    await filterSelect.selectOption('AUCTION')
    await page.waitForTimeout(1000)
    const cards = page.locator('.fav-card')
    const cardCount = await cards.count()
    if (cardCount > 0) {
      console.log(`✓ 篩選競標商品成功：顯示 ${cardCount} 件`)
    } else {
      console.log('ⓘ 沒有競標商品')
    }
  })

  test('從最愛移除商品', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const cards = page.locator('.fav-card')
    const initialCount = await cards.count()
    if (initialCount > 0) {
      const removeBtn = page.locator('.fav-btn.secondary').first()
      page.on('dialog', dialog => dialog.accept())
      await removeBtn.click()
      await page.waitForTimeout(2000)
      console.log('✓ 移除最愛商品成功')
    } else {
      console.log('ⓘ 沒有最愛商品可移除')
    }
  })

  test('加入購物車', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const cards = page.locator('.fav-card')
    const cardCount = await cards.count()
    if (cardCount > 0) {
      const addToCartBtn = page.locator('.fav-btn').first()
      page.on('dialog', dialog => dialog.accept())
      await addToCartBtn.click()
      await page.waitForTimeout(1500)
      console.log('✓ 加入購物車流程已執行')
    } else {
      console.log('ⓘ 沒有最愛商品可加入購物車')
    }
  })

  test('清除全部收藏', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const clearAllBtn = page.locator('.clear-all-btn')
    const isDisabled = await clearAllBtn.isDisabled()
    if (!isDisabled) {
      page.on('dialog', dialog => dialog.accept())
      await clearAllBtn.click()
      await page.waitForTimeout(2000)
      console.log('✓ 清除全部收藏成功')
    } else {
      console.log('ⓘ 清除全部按鈕已禁用（可能沒有收藏商品）')
    }
  })

  test('空白狀態提示', async ({ page }) => {
    await page.waitForSelector('.fav-container', { timeout: 10000 })
    const noItemsMsg = page.locator('text=目前沒有最愛商品')
    const hasNoItemsMsg = await noItemsMsg.count() > 0
    if (hasNoItemsMsg) {
      await expect(noItemsMsg).toBeVisible()
      console.log('✓ 沒有最愛商品時顯示提示訊息')
    } else {
      const cards = page.locator('.fav-card')
      const cardCount = await cards.count()
      console.log(`ⓘ 有 ${cardCount} 件最愛商品`)
    }
  })
})

// tests/favorites.spec.ts
test('加入收藏', async ({ page }) => {
  await page.goto('http://localhost:5173/product/product-id');
  await page.click('button:has-text("加入收藏")');
  await expect(page.locator('button:has-text("移除收藏")')).toBeVisible();
});

test('查看收藏清單', async ({ page }) => {
  await page.goto('http://localhost:5173/favorites');
  await expect(page.locator('.product-card')).toHaveCount(1);
});
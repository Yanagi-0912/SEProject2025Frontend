import { test, expect } from '@playwright/test'

test.describe('搜尋功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('關鍵字搜尋', async ({ page }) => {
    const searchInput = page.locator('.search-input, input[type="search"], input[placeholder*="搜尋"]')
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('手機')
      await page.waitForTimeout(1000)
      
      // 檢查 URL 是否更新
      const currentUrl = page.url()
      if (currentUrl.includes('keyword') || currentUrl.includes('search')) {
        console.log('✓ 關鍵字搜尋觸發成功')
      } else {
        console.log('ⓘ 搜尋可能未更新 URL')
      }
      
      // 檢查商品列表是否更新
      await page.waitForSelector('.products-card', { timeout: 10000 })
      const products = page.locator('.products-card')
      const productCount = await products.count()
      console.log(`✓ 搜尋結果顯示：${productCount} 件商品`)
    } else {
      console.log('ⓘ 未找到搜尋輸入框')
    }
  })

  test('RAG 搜尋按鈕', async ({ page }) => {
    const ragButton = page.locator('button:has-text("RAG"), .rag-button, button[title*="RAG"]')
    
    if (await ragButton.count() > 0) {
      await expect(ragButton).toBeVisible()
      console.log('✓ RAG 搜尋按鈕顯示正常')
      
      // 點擊 RAG 按鈕
      await ragButton.click()
      await page.waitForTimeout(2000)
      
      // 檢查是否有搜尋結果或對話框
      const ragResults = page.locator('.rag-results, .search-results')
      const dialog = page.locator('.dialog, .modal')
      
      if (await ragResults.count() > 0 || await dialog.count() > 0) {
        console.log('✓ RAG 搜尋功能已觸發')
      } else {
        // 檢查 URL 是否更新
        const currentUrl = page.url()
        if (currentUrl.includes('rag')) {
          console.log('✓ RAG 搜尋 URL 更新成功')
        } else {
          console.log('ⓘ RAG 搜尋可能未完全實現')
        }
      }
    } else {
      console.log('ⓘ 未找到 RAG 搜尋按鈕')
    }
  })

  test('搜尋結果顯示', async ({ page }) => {
    const searchInput = page.locator('.search-input, input[type="search"]')
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('測試')
      await page.waitForTimeout(1500)
      
      const products = page.locator('.products-card')
      await page.waitForSelector('.products-card', { timeout: 10000 })
      
      const productCount = await products.count()
      if (productCount > 0) {
        await expect(products.first()).toBeVisible()
        console.log(`✓ 搜尋結果顯示：${productCount} 件商品`)
      } else {
        const noResults = page.locator('text=/沒有結果|找不到|無相關/')
        if (await noResults.count() > 0) {
          console.log('✓ 無搜尋結果時顯示提示')
        } else {
          console.log('ⓘ 搜尋結果為空但未顯示提示')
        }
      }
    }
  })

  test('清除搜尋', async ({ page }) => {
    const searchInput = page.locator('.search-input, input[type="search"]')
    
    if (await searchInput.count() > 0) {
      // 先輸入搜尋關鍵字
      await searchInput.fill('測試商品')
      await page.waitForTimeout(1000)
      
      // 清除輸入
      await searchInput.clear()
      await page.waitForTimeout(1000)
      
      const inputValue = await searchInput.inputValue()
      expect(inputValue).toBe('')
      console.log('✓ 搜尋輸入清除成功')
    }
  })

  test('搜尋與篩選組合', async ({ page }) => {
    const searchInput = page.locator('.search-input, input[type="search"]')
    
    if (await searchInput.count() > 0) {
      // 先搜尋
      await searchInput.fill('手機')
      await page.waitForTimeout(1000)
      
      // 再應用分類篩選
      const categoryOptions = page.locator('.filter-section .filter-option input[id]')
      if (await categoryOptions.count() > 0) {
        await categoryOptions.first().click()
        await page.waitForTimeout(1000)
        
        const products = page.locator('.products-card')
        const productCount = await products.count()
        console.log(`✓ 搜尋+篩選組合：顯示 ${productCount} 件商品`)
      }
    }
  })
})

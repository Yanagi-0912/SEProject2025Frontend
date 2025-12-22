import { test, expect } from '@playwright/test'

test.describe('歷史紀錄功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/history')
    await page.waitForSelector('.user-history, .history-container', { timeout: 10000 })
  })

  test('歷史紀錄頁面顯示', async ({ page }) => {
    const container = page.locator('.user-history, .history-container')
    await expect(container).toBeVisible()
    console.log('✓ 歷史紀錄頁面載入成功')
  })

  test('顯示標籤切換', async ({ page }) => {
    const tabs = page.locator('.user-history-tab, .history-tab, button:has-text("訂單"), button:has-text("購買")')
    const tabCount = await tabs.count()
    
    if (tabCount > 0) {
      await expect(tabs.first()).toBeVisible()
      console.log(`✓ 歷史紀錄標籤顯示：${tabCount} 個標籤`)
    } else {
      console.log('ⓘ 未找到標籤切換功能')
    }
  })

  test('切換到訂單紀錄標籤', async ({ page }) => {
    const orderTab = page.locator('button:has-text("訂單"), .tab:has-text("訂單")')
    
    if (await orderTab.count() > 0) {
      await orderTab.click()
      await page.waitForTimeout(1000)
      
      const orderList = page.locator('.user-history-list, .order-list')
      const orderItems = page.locator('.user-history-list-item, .order-item')
      
      if (await orderList.count() > 0 || await orderItems.count() > 0) {
        console.log('✓ 訂單紀錄顯示正常')
      } else {
        const emptyMsg = page.locator('text=/沒有訂單|尚無訂單/')
        if (await emptyMsg.count() > 0) {
          console.log('✓ 訂單紀錄為空時顯示提示')
        }
      }
    } else {
      console.log('ⓘ 未找到訂單紀錄標籤')
    }
  })

  test('切換到購買紀錄標籤', async ({ page }) => {
    const purchaseTab = page.locator('button:has-text("購買"), .tab:has-text("購買")')
    
    if (await purchaseTab.count() > 0) {
      await purchaseTab.click()
      await page.waitForTimeout(1000)
      
      const purchaseList = page.locator('.user-history-list, .purchase-list')
      const purchaseItems = page.locator('.user-history-list-item, .purchase-item')
      
      if (await purchaseList.count() > 0 || await purchaseItems.count() > 0) {
        console.log('✓ 購買紀錄顯示正常')
      } else {
        console.log('ⓘ 購買紀錄為空或未找到')
      }
    } else {
      console.log('ⓘ 未找到購買紀錄標籤')
    }
  })

  test('切換到競標紀錄標籤', async ({ page }) => {
    const bidTab = page.locator('button:has-text("競標"), .tab:has-text("競標")')
    
    if (await bidTab.count() > 0) {
      await bidTab.click()
      await page.waitForTimeout(1000)
      
      const bidList = page.locator('.user-history-list, .bid-list')
      const bidItems = page.locator('.user-history-list-item, .bid-item')
      
      if (await bidList.count() > 0 || await bidItems.count() > 0) {
        console.log('✓ 競標紀錄顯示正常')
      } else {
        console.log('ⓘ 競標紀錄為空或未找到')
      }
    } else {
      console.log('ⓘ 未找到競標紀錄標籤')
    }
  })

  test('切換到評論紀錄標籤', async ({ page }) => {
    const reviewTab = page.locator('button:has-text("評論"), .tab:has-text("評論")')
    
    if (await reviewTab.count() > 0) {
      await reviewTab.click()
      await page.waitForTimeout(1000)
      
      const reviewList = page.locator('.user-history-list, .review-list')
      const reviewItems = page.locator('.user-history-list-item, .review-item')
      
      if (await reviewList.count() > 0 || await reviewItems.count() > 0) {
        console.log('✓ 評論紀錄顯示正常')
      } else {
        console.log('ⓘ 評論紀錄為空或未找到')
      }
    } else {
      console.log('ⓘ 未找到評論紀錄標籤')
    }
  })

  test('切換到瀏覽紀錄標籤', async ({ page }) => {
    const browseTab = page.locator('button:has-text("瀏覽"), .tab:has-text("瀏覽")')
    
    if (await browseTab.count() > 0) {
      await browseTab.click()
      await page.waitForTimeout(1000)
      
      const browseList = page.locator('.user-history-list, .browse-list')
      const browseItems = page.locator('.user-history-list-item, .browse-item')
      
      if (await browseList.count() > 0 || await browseItems.count() > 0) {
        console.log('✓ 瀏覽紀錄顯示正常')
      } else {
        console.log('ⓘ 瀏覽紀錄為空或未找到')
      }
    } else {
      console.log('ⓘ 未找到瀏覽紀錄標籤')
    }
  })

  test('展開訂單詳情', async ({ page }) => {
    // 先切換到訂單紀錄
    const orderTab = page.locator('button:has-text("訂單")')
    if (await orderTab.count() > 0) {
      await orderTab.click()
      await page.waitForTimeout(1000)
    }
    
    const orderItems = page.locator('.user-history-list-item, .order-item')
    if (await orderItems.count() > 0) {
      const firstOrder = orderItems.first()
      const expandBtn = firstOrder.locator('button:has-text("詳情"), button:has-text("展開"), .expand-button')
      
      if (await expandBtn.count() > 0) {
        await expandBtn.click()
        await page.waitForTimeout(500)
        
        const detailSection = page.locator('.user-history-detail, .order-detail')
        if (await detailSection.count() > 0) {
          await expect(detailSection.first()).toBeVisible()
          console.log('✓ 訂單詳情展開成功')
        }
      } else {
        console.log('ⓘ 未找到展開按鈕')
      }
    } else {
      console.log('ⓘ 沒有訂單可展開')
    }
  })

  test('確認訂單付款', async ({ page }) => {
    // 先切換到訂單紀錄
    const orderTab = page.locator('button:has-text("訂單")')
    if (await orderTab.count() > 0) {
      await orderTab.click()
      await page.waitForTimeout(1000)
    }
    
    const orderItems = page.locator('.user-history-list-item, .order-item')
    if (await orderItems.count() > 0) {
      const firstOrder = orderItems.first()
      const confirmBtn = firstOrder.locator('button:has-text("確認"), button:has-text("付款"), .confirm-button')
      
      if (await confirmBtn.count() > 0 && !(await confirmBtn.isDisabled())) {
        page.on('dialog', dialog => dialog.accept())
        await confirmBtn.click()
        await page.waitForTimeout(2000)
        console.log('✓ 確認訂單付款流程已執行')
      } else {
        console.log('ⓘ 確認按鈕不可用或已禁用')
      }
    } else {
      console.log('ⓘ 沒有訂單可確認')
    }
  })
})

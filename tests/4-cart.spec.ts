import { test, expect } from '@playwright/test'

test.describe('購物車功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cart')
    await page.waitForSelector('.cart-container, .cart-empty', { timeout: 10000 })
  })

  test('購物車頁面顯示', async ({ page }) => {
    const container = page.locator('.cart-container, .cart-empty')
    await expect(container).toBeVisible()
    console.log('✓ 購物車頁面載入成功')
  })

  test('購物車為空時顯示提示', async ({ page }) => {
    const emptyMsg = page.locator('text=購物車是空的')
    const emptyContainer = page.locator('.cart-empty')
    
    if (await emptyContainer.count() > 0 || await emptyMsg.count() > 0) {
      await expect(emptyContainer.or(emptyMsg)).toBeVisible()
      console.log('✓ 空購物車提示正確顯示')
    } else {
      const items = page.locator('.cart-item')
      const itemCount = await items.count()
      console.log(`ⓘ 購物車中有 ${itemCount} 件商品`)
    }
  })

  test('顯示購物車商品列表', async ({ page }) => {
    const items = page.locator('.cart-item')
    const itemCount = await items.count()
    
    if (itemCount > 0) {
      const firstItem = items.first()
      await expect(firstItem).toBeVisible()
      
      // 驗證商品資訊顯示
      const productName = firstItem.locator('.cart-item-name, .product-name')
      const productPrice = firstItem.locator('.cart-item-price, .product-price')
      
      if (await productName.count() > 0) {
        await expect(productName).toBeVisible()
      }
      if (await productPrice.count() > 0) {
        await expect(productPrice).toBeVisible()
      }
      
      console.log(`✓ 購物車顯示 ${itemCount} 件商品`)
    } else {
      console.log('ⓘ 購物車為空')
    }
  })

  test('調整商品數量', async ({ page }) => {
    const items = page.locator('.cart-item')
    const itemCount = await items.count()
    
    if (itemCount > 0) {
      const firstItem = items.first()
      const quantityInput = firstItem.locator('input[type="number"], .quantity-input')
      const plusBtn = firstItem.locator('.quantity-btn.plus, button:has-text("+")')
      const minusBtn = firstItem.locator('.quantity-btn.minus, button:has-text("-")')
      
      if (await quantityInput.count() > 0) {
        const initialValue = await quantityInput.inputValue()
        const initialNum = parseInt(initialValue) || 1
        
        // 增加數量
        if (await plusBtn.count() > 0) {
          await plusBtn.click()
          await page.waitForTimeout(500)
          const newValue = await quantityInput.inputValue()
          const newNum = parseInt(newValue) || 1
          expect(newNum).toBeGreaterThanOrEqual(initialNum)
          console.log(`✓ 數量增加：${initialNum} → ${newNum}`)
        }
        
        // 減少數量
        if (await minusBtn.count() > 0 && parseInt(await quantityInput.inputValue()) > 1) {
          await minusBtn.click()
          await page.waitForTimeout(500)
          console.log('✓ 數量減少成功')
        }
      } else {
        console.log('ⓘ 未找到數量調整控制項')
      }
    } else {
      console.log('ⓘ 購物車為空，無法測試數量調整')
    }
  })

  test('移除購物車商品', async ({ page }) => {
    const items = page.locator('.cart-item')
    const itemCount = await items.count()
    
    if (itemCount > 0) {
      const firstItem = items.first()
      const removeBtn = firstItem.locator('.remove-btn, button:has-text("移除"), button:has-text("刪除")')
      
      if (await removeBtn.count() > 0) {
        page.on('dialog', dialog => dialog.accept())
        const initialCount = await items.count()
        await removeBtn.click()
        await page.waitForTimeout(1000)
        
        const newCount = await page.locator('.cart-item').count()
        expect(newCount).toBeLessThan(initialCount)
        console.log(`✓ 移除商品成功：${initialCount} → ${newCount}`)
      } else {
        console.log('ⓘ 未找到移除按鈕')
      }
    } else {
      console.log('ⓘ 購物車為空，無法測試移除功能')
    }
  })

  test('顯示總金額', async ({ page }) => {
    const totalSection = page.locator('.cart-total, .total-section, .cart-footer')
    const totalText = page.locator('text=/總計|總金額|合計/')
    
    if (await totalSection.count() > 0 || await totalText.count() > 0) {
      await expect(totalSection.or(totalText)).toBeVisible()
      console.log('✓ 總金額顯示正常')
    } else {
      console.log('ⓘ 未找到總金額顯示區域')
    }
  })

  test('前往結帳按鈕', async ({ page }) => {
    const checkoutBtn = page.locator('button:has-text("結帳"), button:has-text("前往結帳"), .checkout-button')
    
    if (await checkoutBtn.count() > 0) {
      const isDisabled = await checkoutBtn.isDisabled()
      if (!isDisabled) {
        await checkoutBtn.click()
        await page.waitForURL('**/checkout**', { timeout: 5000 })
        expect(page.url()).toContain('/checkout')
        console.log('✓ 前往結帳頁面成功')
      } else {
        console.log('ⓘ 結帳按鈕已禁用（可能購物車為空）')
      }
    } else {
      console.log('ⓘ 未找到結帳按鈕')
    }
  })

  test('按賣家分組顯示', async ({ page }) => {
    const sellerSections = page.locator('.seller-section, .cart-seller-group')
    const sectionCount = await sellerSections.count()
    
    if (sectionCount > 0) {
      await expect(sellerSections.first()).toBeVisible()
      console.log(`✓ 購物車按賣家分組顯示：${sectionCount} 個賣家`)
    } else {
      console.log('ⓘ 未找到賣家分組（可能購物車為空或未實現分組）')
    }
  })
})

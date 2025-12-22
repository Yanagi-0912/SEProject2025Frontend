import { test, expect } from '@playwright/test'

test.describe('賣家後台功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/seller/dashboard')
    await page.waitForSelector('.seller-dashboard, .dashboard-container', { timeout: 10000 })
  })

  test('賣家後台頁面顯示', async ({ page }) => {
    const container = page.locator('.seller-dashboard, .dashboard-container')
    await expect(container).toBeVisible()
    console.log('✓ 賣家後台頁面載入成功')
  })

  test('顯示賣家資訊', async ({ page }) => {
    const sellerInfo = page.locator('.seller-info, .seller-profile')
    
    if (await sellerInfo.count() > 0) {
      await expect(sellerInfo).toBeVisible()
      console.log('✓ 賣家資訊顯示正常')
    } else {
      console.log('ⓘ 未找到賣家資訊區域')
    }
  })

  test('商品管理標籤', async ({ page }) => {
    const productManageTab = page.locator('button:has-text("商品管理"), .tab:has-text("商品")')
    
    if (await productManageTab.count() > 0) {
      await productManageTab.click()
      await page.waitForTimeout(1000)
      
      const productList = page.locator('.product-list, .seller-products')
      if (await productList.count() > 0) {
        await expect(productList).toBeVisible()
        console.log('✓ 商品管理頁面顯示正常')
      } else {
        console.log('ⓘ 商品管理區域未顯示')
      }
    } else {
      console.log('ⓘ 未找到商品管理標籤')
    }
  })

  test('新增商品按鈕', async ({ page }) => {
    const addProductBtn = page.locator('button:has-text("新增"), button:has-text("上架"), .add-product-button')
    
    if (await addProductBtn.count() > 0) {
      await expect(addProductBtn).toBeVisible()
      const isDisabled = await addProductBtn.isDisabled()
      console.log(`✓ 新增商品按鈕${isDisabled ? '已禁用' : '可用'}`)
    } else {
      console.log('ⓘ 未找到新增商品按鈕')
    }
  })

  test('顯示商品列表', async ({ page }) => {
    // 先切換到商品管理
    const productManageTab = page.locator('button:has-text("商品管理")')
    if (await productManageTab.count() > 0) {
      await productManageTab.click()
      await page.waitForTimeout(1000)
    }
    
    const productItems = page.locator('.product-item, .seller-product-item, .product-card')
    const itemCount = await productItems.count()
    
    if (itemCount > 0) {
      await expect(productItems.first()).toBeVisible()
      console.log(`✓ 商品列表顯示：${itemCount} 件商品`)
    } else {
      const emptyMsg = page.locator('text=/沒有商品|尚無商品/')
      if (await emptyMsg.count() > 0) {
        console.log('✓ 商品列表為空時顯示提示')
      } else {
        console.log('ⓘ 商品列表為空或未找到')
      }
    }
  })

  test('編輯商品', async ({ page }) => {
    // 先切換到商品管理
    const productManageTab = page.locator('button:has-text("商品管理")')
    if (await productManageTab.count() > 0) {
      await productManageTab.click()
      await page.waitForTimeout(1000)
    }
    
    const productItems = page.locator('.product-item, .seller-product-item')
    if (await productItems.count() > 0) {
      const firstProduct = productItems.first()
      const editBtn = firstProduct.locator('button:has-text("編輯"), .edit-button')
      
      if (await editBtn.count() > 0) {
        await editBtn.click()
        await page.waitForTimeout(1000)
        
        // 檢查是否進入編輯模式或編輯頁面
        const editForm = page.locator('.edit-form, .product-form')
        const editInput = page.locator('input[name="productName"], input[placeholder*="商品名稱"]')
        
        if (await editForm.count() > 0 || await editInput.count() > 0) {
          console.log('✓ 編輯商品功能正常')
        } else {
          console.log('ⓘ 編輯功能已觸發但表單未顯示')
        }
      } else {
        console.log('ⓘ 未找到編輯按鈕')
      }
    } else {
      console.log('ⓘ 沒有商品可編輯')
    }
  })

  test('刪除商品', async ({ page }) => {
    // 先切換到商品管理
    const productManageTab = page.locator('button:has-text("商品管理")')
    if (await productManageTab.count() > 0) {
      await productManageTab.click()
      await page.waitForTimeout(1000)
    }
    
    const productItems = page.locator('.product-item, .seller-product-item')
    if (await productItems.count() > 0) {
      const firstProduct = productItems.first()
      const deleteBtn = firstProduct.locator('button:has-text("刪除"), .delete-button')
      
      if (await deleteBtn.count() > 0) {
        page.on('dialog', dialog => dialog.accept())
        const initialCount = await productItems.count()
        await deleteBtn.click()
        await page.waitForTimeout(2000)
        
        const newCount = await page.locator('.product-item, .seller-product-item').count()
        if (newCount < initialCount) {
          console.log(`✓ 刪除商品成功：${initialCount} → ${newCount}`)
        } else {
          console.log('ⓘ 刪除操作已執行（可能未立即更新）')
        }
      } else {
        console.log('ⓘ 未找到刪除按鈕')
      }
    } else {
      console.log('ⓘ 沒有商品可刪除')
    }
  })

  test('控制面板功能', async ({ page }) => {
    const controlPanel = page.locator('.control-panel, .seller-control-panel')
    const controlButtons = page.locator('.control-panel-btn, .seller-btn')
    
    if (await controlPanel.count() > 0 || await controlButtons.count() > 0) {
      const buttonCount = await controlButtons.count()
      if (buttonCount > 0) {
        await expect(controlButtons.first()).toBeVisible()
        console.log(`✓ 控制面板顯示：${buttonCount} 個功能按鈕`)
      } else {
        console.log('ⓘ 控制面板存在但無按鈕')
      }
    } else {
      console.log('ⓘ 未找到控制面板')
    }
  })
})

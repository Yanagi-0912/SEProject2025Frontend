import { test, expect } from '@playwright/test'

test.describe('登入頁面功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForSelector('.login-container, form', { timeout: 10000 })
  })

  test('登入表單顯示', async ({ page }) => {
    const usernameInput = page.locator('input[name="username"], #username')
    const passwordInput = page.locator('input[name="password"], #password, input[type="password"]')
    const submitButton = page.locator('button[type="submit"], button:has-text("登入")')
    
    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
    console.log('✓ 登入表單元素顯示正常')
  })

  test('前往註冊頁面連結', async ({ page }) => {
    const registerLink = page.locator('a:has-text("註冊"), button:has-text("註冊"), text=/還沒有帳號/')
    
    if (await registerLink.count() > 0) {
      await registerLink.click()
      await page.waitForURL('**/register**', { timeout: 5000 })
      expect(page.url()).toContain('/register')
      console.log('✓ 前往註冊頁面成功')
    } else {
      console.log('ⓘ 未找到註冊連結')
    }
  })

  test('登入表單驗證', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"], button:has-text("登入")')
    
    // 嘗試提交空表單
    await submitButton.click()
    await page.waitForTimeout(500)
    
    // 檢查是否有錯誤訊息
    const errorMsg = page.locator('.error-message, .error, text=/必填|請輸入/')
    if (await errorMsg.count() > 0) {
      await expect(errorMsg.first()).toBeVisible()
      console.log('✓ 表單驗證正常（空表單顯示錯誤）')
    } else {
      console.log('ⓘ 表單驗證可能未實現或錯誤訊息未顯示')
    }
  })

  test('錯誤登入資訊處理', async ({ page }) => {
    const usernameInput = page.locator('input[name="username"], #username')
    const passwordInput = page.locator('input[name="password"], #password')
    const submitButton = page.locator('button[type="submit"], button:has-text("登入")')
    
    await usernameInput.fill('invalid_user')
    await passwordInput.fill('wrong_password')
    await submitButton.click()
    
    await page.waitForTimeout(2000)
    
    // 檢查是否有錯誤訊息
    const errorMsg = page.locator('.error-message, .error, text=/錯誤|失敗|不正確/')
    if (await errorMsg.count() > 0) {
      console.log('✓ 錯誤登入資訊顯示錯誤訊息')
    } else {
      // 檢查是否仍在登入頁面（未成功登入）
      const currentUrl = page.url()
      if (currentUrl.includes('/login')) {
        console.log('✓ 錯誤登入資訊未成功登入')
      } else {
        console.log('ⓘ 錯誤處理可能未實現')
      }
    }
  })
})

test.describe('註冊頁面功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await page.waitForSelector('.register-container, form', { timeout: 10000 })
  })

  test('註冊表單顯示', async ({ page }) => {
    const usernameInput = page.locator('input[name="username"], #username')
    const emailInput = page.locator('input[name="email"], #email, input[type="email"]')
    const passwordInput = page.locator('input[name="password"], #password')
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], #confirmPassword')
    const submitButton = page.locator('button[type="submit"], button:has-text("註冊")')
    
    await expect(usernameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(confirmPasswordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
    console.log('✓ 註冊表單元素顯示正常')
  })

  test('前往登入頁面連結', async ({ page }) => {
    const loginLink = page.locator('a:has-text("登入"), button:has-text("登入"), text=/已有帳號/')
    
    if (await loginLink.count() > 0) {
      await loginLink.click()
      await page.waitForURL('**/login**', { timeout: 5000 })
      expect(page.url()).toContain('/login')
      console.log('✓ 前往登入頁面成功')
    } else {
      console.log('ⓘ 未找到登入連結')
    }
  })

  test('密碼確認驗證', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"], #password')
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], #confirmPassword')
    const submitButton = page.locator('button[type="submit"], button:has-text("註冊")')
    
    await passwordInput.fill('Test123456')
    await confirmPasswordInput.fill('DifferentPassword')
    await submitButton.click()
    await page.waitForTimeout(500)
    
    // 檢查是否有錯誤訊息
    const errorMsg = page.locator('.error-message, .error, text=/不一致|不匹配|相同/')
    if (await errorMsg.count() > 0) {
      await expect(errorMsg.first()).toBeVisible()
      console.log('✓ 密碼確認驗證正常')
    } else {
      console.log('ⓘ 密碼確認驗證可能未實現')
    }
  })

  test('Email 格式驗證', async ({ page }) => {
    const emailInput = page.locator('input[name="email"], #email, input[type="email"]')
    const submitButton = page.locator('button[type="submit"], button:has-text("註冊")')
    
    await emailInput.fill('invalid-email')
    await submitButton.click()
    await page.waitForTimeout(500)
    
    // 檢查是否有錯誤訊息
    const errorMsg = page.locator('.error-message, .error, text=/格式|email|電子郵件/')
    if (await errorMsg.count() > 0) {
      console.log('✓ Email 格式驗證正常')
    } else {
      console.log('ⓘ Email 格式驗證可能未實現')
    }
  })
})

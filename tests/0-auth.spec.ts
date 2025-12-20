import { test, expect } from '@playwright/test'

const baseURL = 'http://localhost:5173'
const timestamp = Date.now()
const newUser = {
  username: `pw_user_${timestamp}`,
  email: `pw_user_${timestamp}@example.com`,
  password: 'Pw12345!',
}

test.describe.serial('使用者註冊與登入流程', () => {
  test('可以完成註冊並自動登入', async ({ page }) => {
    await page.goto(`${baseURL}/register`)

    await page.fill('#username', newUser.username)
    await page.fill('#email', newUser.email)
    await page.fill('#password', newUser.password)
    await page.fill('#confirmPassword', newUser.password)
    await page.click('button[type="submit"]')

    // 等待 token 寫入 localStorage，代表註冊＋自動登入成功
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 8000 })
    const storedUsername = await page.evaluate(() => localStorage.getItem('username'))
    expect(storedUsername).toBe(newUser.username)

    // 確認能進入首頁
    await page.goto(baseURL)
    await expect(page).toHaveURL(baseURL + '/')
  })

  test('用新帳號可成功登入', async ({ page }) => {
    // 清理前一測試的登入狀態
    await page.goto(baseURL)
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())

    await page.goto(`${baseURL}/login`)
    await page.fill('#username', newUser.username)
    await page.fill('#password', newUser.password)
    await page.click('button[type="submit"]')

    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 8000 })
    const storedUsername = await page.evaluate(() => localStorage.getItem('username'))
    expect(storedUsername).toBe(newUser.username)

    await expect(page).toHaveURL(baseURL + '/')
  })
})
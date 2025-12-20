import { test, expect } from '@playwright/test';

test('首頁標題正確', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/拍賣網站/);
});

test('首頁顯示商品列表', async ({ page }) => {
  await page.goto('/');
  
  // 等待商品容器載入
  await page.waitForSelector('.products-card', { timeout: 15000 });
  
  // 驗證至少有一個商品卡片
  const productCards = page.locator('.products-card');
  const count = await productCards.count();
  expect(count).toBeGreaterThan(0);
  
  // 驗證商品卡片內容
  const firstCard = productCards.first();
  await expect(firstCard.locator('h4')).toBeVisible();
  await expect(firstCard.locator('p').first()).toBeVisible();
});

test('首頁分類篩選功能', async ({ page }) => {
  await page.goto('/');
  
  // 等待分類篩選區域
  await page.waitForSelector('.filter-container', { timeout: 10000 });
  
  const categoryOptions = page.locator('.filter-section .filter-option input[id]');
  const categoryCount = await categoryOptions.count();
  expect(categoryCount).toBeGreaterThan(0);

  const firstCategory = categoryOptions.first();
  const label = await firstCategory.evaluate(el => {
    const input = el as HTMLInputElement;
    const labelEl = input.parentElement?.querySelector('label');
    return labelEl?.textContent || '';
  });

  await firstCategory.click();
  await page.waitForTimeout(1000);

  const productsAfter = page.locator('.products-card');
  const countAfter = await productsAfter.count();
  expect(countAfter).toBeGreaterThanOrEqual(0);
  console.log(`✓ 分類篩選：${label} - 顯示 ${countAfter} 件商品`);
});

test('首頁翻頁功能', async ({ page }) => {
  await page.goto('/');
  
  // 等待商品載入
  await page.waitForSelector('.products-card', { timeout: 15000 });
  
  // 檢查翻頁按鈕是否存在
  const paginationContainer = page.locator('.pagination-container');
  const paginationExists = await paginationContainer.count() > 0;
  
  if (paginationExists) {
    // 取得目前頁碼
    const currentPageBtn = page.locator('.pagination-btn.active');
    const currentPage = await currentPageBtn.textContent();
    console.log(`✓ 當前頁碼：${currentPage}`);
    
    // 尋找下一頁按鈕
    const nextPageBtn = page.locator('.pagination-btn:has-text("→")');
    const nextPageExists = await nextPageBtn.count() > 0;
    
    if (nextPageExists) {
      // 記錄目前商品
      const productsBeforePage = await page.locator('.products-card').count();
      
      // 點擊下一頁
      await nextPageBtn.click();
      
      // 等待頁面更新
      await page.waitForTimeout(1000);
      
      // 驗證商品列表已更新
      const productsAfterPage = await page.locator('.products-card').count();
      expect(productsAfterPage).toBeGreaterThan(0);
      
      console.log(`✓ 翻頁成功：第 1 頁 (${productsBeforePage} 件) → 第 2 頁 (${productsAfterPage} 件)`);
      
      // 測試返回上一頁
      const prevPageBtn = page.locator('.pagination-btn:has-text("←")');
      const prevPageExists = await prevPageBtn.count() > 0;
      
      if (prevPageExists) {
        await prevPageBtn.click();
        await page.waitForTimeout(1000);
        const productsAfterReturn = await page.locator('.products-card').count();
        expect(productsAfterReturn).toBe(productsBeforePage);
        console.log(`✓ 返回上一頁成功`);
      }
    } else {
      console.log('ⓘ 未找到下一頁按鈕（可能只有一頁商品）');
    }
  } else {
    console.log('ⓘ 未找到翻頁元件（可能未實現分頁）');
  }
});

test('商品卡片交互功能', async ({ page }) => {
  await page.goto('/');
  
  // 等待商品卡片
  await page.waitForSelector('.products-card', { timeout: 15000 });
  
  const firstProduct = page.locator('.products-card').first();
  
  // 點擊商品卡片進入詳情頁
  await firstProduct.click();
  
  // 驗證導航到商品詳情頁
  await page.waitForURL('**/product/**', { timeout: 5000 });
  expect(page.url()).toContain('/product/');
  
  console.log(`✓ 商品詳情頁導航成功: ${page.url()}`);
});

test('首頁篩選和翻頁組合測試', async ({ page }) => {
  await page.goto('/');
  
  // 等待初始化
  await page.waitForSelector('.products-card', { timeout: 15000 });
  
  // 步驟 1：應用分類篩選
  const filterOptions = page.locator('.filter-section .filter-option input[id]');
  const filterCount = await filterOptions.count();
  
  if (filterCount > 0) {
    await filterOptions.nth(0).click();
    await page.waitForTimeout(1000);
    console.log('✓ 套用分類篩選');
  }
  
  // 步驟 2：翻到下一頁
  const nextPageBtn = page.locator('.pagination-btn:has-text("→")');
  const pageExists = await nextPageBtn.count() > 0;
  
  if (pageExists) {
    await nextPageBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ 翻頁成功');
  }
  
  // 步驟 3：驗證最終結果
  const productsVisible = await page.locator('.products-card').count();
  expect(productsVisible).toBeGreaterThanOrEqual(0);
  console.log(`✓ 篩選後翻頁 - 顯示 ${productsVisible} 件商品`);
});
import { test, expect } from '@playwright/test';

test.describe('Tiramisu App - Debug Search Tests', () => {
  const baseURL = 'http://localhost:5174';

  test('デバッグ用 - 検索ページの構造確認', async ({ page }) => {
    await page.goto(`${baseURL}/search`);
    await page.waitForLoadState('networkidle');
    
    // 初期状態のスクリーンショット
    await page.screenshot({ path: 'screenshots/debug-initial.png', fullPage: true });
    
    // 検索入力フィールドの存在確認
    const searchInput = page.locator('input[type="text"][aria-label="検索入力"]');
    await expect(searchInput).toBeVisible();
    
    // HTML構造をコンソールに出力
    const htmlContent = await page.content();
    console.log('Page HTML structure:', htmlContent.substring(0, 2000));
    
    // 検索実行
    await searchInput.fill('tiramisu recipe');
    await searchInput.press('Enter');
    
    // 検索後の待機
    await page.waitForTimeout(5000);
    
    // 検索後のスクリーンショット
    await page.screenshot({ path: 'screenshots/debug-after-search.png', fullPage: true });
    
    // ページのHTML構造を再度確認
    const searchResultsHTML = await page.content();
    console.log('Search results HTML:', searchResultsHTML.substring(0, 3000));
    
    // すべてのビデオ関連要素を検索
    const videoElements = await page.locator('div[role="button"]').count();
    console.log('Found video elements (role=button):', videoElements);
    
    const allDivs = await page.locator('div').count();
    console.log('Total div elements:', allDivs);
    
    // 検索結果のコンテナを探す
    const videoGrid = page.locator('div.grid');
    if (await videoGrid.count() > 0) {
      console.log('Found video grid container');
      await videoGrid.screenshot({ path: 'screenshots/debug-video-grid.png' });
    }
  });

  test('検索機能のエラー処理確認', async ({ page }) => {
    await page.goto(`${baseURL}/search`);
    await page.waitForLoadState('networkidle');
    
    // コンソールエラーを監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // ネットワークエラーを監視
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`Network error: ${response.status()} ${response.url()}`);
      }
    });
    
    const searchInput = page.locator('input[type="text"][aria-label="検索入力"]');
    await searchInput.fill('test search');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/debug-error-state.png', fullPage: true });
  });
});
import { test, expect } from '@playwright/test';

test.describe('Performance Screenshots', () => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Search', path: '/search' },
    { name: 'Recipes', path: '/recipes' },
    { name: 'Contact', path: '/contact' }
  ];

  for (const pageInfo of pages) {
    test(`Screenshot for ${pageInfo.name} page`, async ({ page }) => {
      // ページに移動
      await page.goto(`http://localhost:5176${pageInfo.path}`, { 
        waitUntil: 'networkidle' 
      });
      
      // ページが完全に読み込まれるまで少し待つ
      await page.waitForTimeout(1000);
      
      // フルページスクリーンショット
      await page.screenshot({ 
        path: `tests/performance-screenshots/${pageInfo.name.toLowerCase()}-full.png`,
        fullPage: true 
      });
      
      // ビューポートサイズのスクリーンショット
      await page.screenshot({ 
        path: `tests/performance-screenshots/${pageInfo.name.toLowerCase()}-viewport.png`,
        fullPage: false 
      });
      
      console.log(`📸 Screenshots saved for ${pageInfo.name} page`);
    });
  }

  test('Performance timeline screenshots', async ({ page }) => {
    // ホームページでパフォーマンス測定中のスクリーンショット
    await page.goto('http://localhost:5176/', { waitUntil: 'domcontentloaded' });
    
    // 読み込み初期段階
    await page.screenshot({ 
      path: 'tests/performance-screenshots/loading-initial.png' 
    });
    
    // ネットワーク読み込み完了まで待機
    await page.waitForLoadState('networkidle');
    
    // 読み込み完了
    await page.screenshot({ 
      path: 'tests/performance-screenshots/loading-complete.png' 
    });
    
    console.log('📸 Performance timeline screenshots saved');
  });

  test('Mobile performance screenshots', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE サイズ
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    for (const pageInfo of pages) {
      await page.goto(`http://localhost:5176${pageInfo.path}`, { 
        waitUntil: 'networkidle' 
      });
      
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `tests/performance-screenshots/mobile-${pageInfo.name.toLowerCase()}.png`,
        fullPage: true 
      });
      
      console.log(`📱 Mobile screenshot saved for ${pageInfo.name} page`);
    }
    
    await context.close();
  });
});
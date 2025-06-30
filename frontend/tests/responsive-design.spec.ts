import { test, expect, devices, Page } from '@playwright/test';

// テスト対象のページ
const pages = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Search', path: '/search' },
  { name: 'Recipes', path: '/recipes' },
  { name: 'Contact', path: '/contact' },
];

// テスト対象の画面サイズ
const viewports = [
  { name: 'Mobile-320', width: 320, height: 568 },
  { name: 'Mobile-375', width: 375, height: 667 },
  { name: 'Mobile-414', width: 414, height: 896 },
  { name: 'Tablet-768', width: 768, height: 1024 },
  { name: 'Tablet-1024', width: 1024, height: 768 },
  { name: 'Desktop-1280', width: 1280, height: 720 },
  { name: 'Desktop-1920', width: 1920, height: 1080 },
  { name: 'Desktop-2560', width: 2560, height: 1440 },
];

test.describe('Responsive Design Tests', () => {
  // 各ページと各画面サイズの組み合わせでテスト
  for (const page of pages) {
    for (const viewport of viewports) {
      test(`${page.name} page - ${viewport.name} viewport`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height }
        });
        const browserPage = await context.newPage();

        try {
          // ページにアクセス
          await browserPage.goto(page.path, { waitUntil: 'networkidle' });
          
          // ページが読み込まれるまで待機
          await browserPage.waitForLoadState('domcontentloaded');
          await browserPage.waitForTimeout(2000); // 画像やアニメーションの読み込み待ち

          // スクリーンショットを撮影
          await browserPage.screenshot({
            path: `screenshots/responsive/${page.name.toLowerCase()}-${viewport.name}.png`,
            fullPage: true
          });

          // 基本的なレスポンシブチェック
          await checkBasicResponsive(browserPage, viewport);
          
          // ナビゲーションメニューのテスト
          await testNavigation(browserPage, viewport);
          
          // レイアウトの基本チェック
          await checkLayout(browserPage, viewport);

        } catch (error) {
          console.error(`Error testing ${page.name} at ${viewport.name}:`, error);
          throw error;
        } finally {
          await context.close();
        }
      });
    }
  }

  // オリエンテーション変更のテスト
  test('Orientation changes on tablet sizes', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // ポートレートモード
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: 'screenshots/responsive/orientation-portrait-768x1024.png',
      fullPage: true
    });

    // ランドスケープモード
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.screenshot({
      path: 'screenshots/responsive/orientation-landscape-1024x768.png',
      fullPage: true
    });

    await context.close();
  });

  // タッチとマウスインタラクションのテスト
  test('Touch vs Mouse interactions', async ({ browser }) => {
    // モバイルデバイス（タッチ）
    const mobileContext = await browser.newContext({
      ...devices['iPhone 12'],
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    
    await mobilePage.goto('/search');
    await testTouchInteractions(mobilePage);
    await mobileContext.close();

    // デスクトップ（マウス）
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      hasTouch: false
    });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('/search');
    await testMouseInteractions(desktopPage);
    await desktopContext.close();
  });
});

// ヘルパー関数
async function checkBasicResponsive(page: Page, viewport: any) {
  // 水平スクロールがないことを確認
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = viewport.width;
  
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // 10px のマージンを許可
  
  // 基本要素が表示されていることを確認
  await expect(page.locator('body')).toBeVisible();
  
  // ページタイトルが存在することを確認
  const title = await page.title();
  expect(title).toBeTruthy();
}

async function testNavigation(page: Page, viewport: any) {
  const isMobile = viewport.width < 768;
  
  if (isMobile) {
    // モバイルメニューのテスト
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // メニューが開いていることを確認
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // スクリーンショット
      await page.screenshot({
        path: `screenshots/responsive/mobile-menu-${viewport.name}.png`
      });
    }
  } else {
    // デスクトップナビゲーションのテスト
    const desktopNav = page.locator('nav');
    await expect(desktopNav).toBeVisible();
  }
}

async function checkLayout(page: Page, viewport: any) {
  // 主要コンテナの幅チェック
  const containers = await page.locator('.container, .max-w-7xl, .max-w-6xl, .max-w-4xl').all();
  
  for (const container of containers) {
    const boundingBox = await container.boundingBox();
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);
    }
  }
  
  // テキストの可読性チェック（最小フォントサイズ）
  const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6').all();
  
  for (let i = 0; i < Math.min(textElements.length, 10); i++) {
    const element = textElements[i];
    const fontSize = await element.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.fontSize);
    });
    
    if (viewport.width < 768) {
      // モバイルでは最小14px
      expect(fontSize).toBeGreaterThanOrEqual(14);
    }
  }
}

async function testTouchInteractions(page: Page) {
  // タッチ可能な要素のサイズチェック
  const buttons = await page.locator('button, a, input[type="submit"]').all();
  
  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    const button = buttons[i];
    const boundingBox = await button.boundingBox();
    
    if (boundingBox) {
      // 最小タッチターゲットサイズ44px x 44px
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    }
  }
  
  // タッチイベントのテスト
  const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.tap();
    await expect(searchInput).toBeFocused();
  }
}

async function testMouseInteractions(page: Page) {
  // ホバー効果のテスト
  const hoverElements = await page.locator('button, a, .hover\\:').all();
  
  for (let i = 0; i < Math.min(hoverElements.length, 3); i++) {
    const element = hoverElements[i];
    if (await element.isVisible()) {
      await element.hover();
      await page.waitForTimeout(200);
      
      // ホバー状態のスクリーンショット
      await page.screenshot({
        path: `screenshots/responsive/hover-state-${i}.png`
      });
    }
  }
}
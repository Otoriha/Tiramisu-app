import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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

test.describe('Responsive Screenshots', () => {
  test.beforeAll(async () => {
    // スクリーンショットディレクトリを作成
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'responsive');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  // 各ページのスクリーンショットを撮影
  for (const pageInfo of pages) {
    test(`Screenshots for ${pageInfo.name} page`, async ({ browser }) => {
      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height }
        });
        const page = await context.newPage();

        try {
          // ページにアクセス
          await page.goto(pageInfo.path, { waitUntil: 'networkidle', timeout: 10000 });
          
          // ページが読み込まれるまで待機
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(1000);

          // スクリーンショットを撮影
          await page.screenshot({
            path: `screenshots/responsive/${pageInfo.name.toLowerCase()}-${viewport.name}.png`,
            fullPage: true
          });

          console.log(`Screenshot captured: ${pageInfo.name} - ${viewport.name}`);

        } catch (error) {
          console.error(`Error capturing screenshot for ${pageInfo.name} at ${viewport.name}:`, error);
          
          // エラーでもスクリーンショットを撮影
          try {
            await page.screenshot({
              path: `screenshots/responsive/${pageInfo.name.toLowerCase()}-${viewport.name}-error.png`,
              fullPage: true
            });
          } catch (screenshotError) {
            console.error('Failed to capture error screenshot:', screenshotError);
          }
        } finally {
          await context.close();
        }
      }
    });
  }

  // オリエンテーション変更のテスト
  test('Orientation screenshots', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
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

      console.log('Orientation screenshots captured');
    } catch (error) {
      console.error('Error capturing orientation screenshots:', error);
    } finally {
      await context.close();
    }
  });
});
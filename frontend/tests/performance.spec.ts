import { test, expect, chromium, Page, Browser } from '@playwright/test';
import type { CDPSession } from '@playwright/test';

// パフォーマンスメトリクスの型定義
interface PerformanceMetrics {
  pageName: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  resourceMetrics: ResourceMetrics;
  memoryUsage: MemoryUsage;
  jsExecutionTime: number;
}

interface ResourceMetrics {
  totalResources: number;
  totalSize: number;
  images: ResourceDetail[];
  scripts: ResourceDetail[];
  stylesheets: ResourceDetail[];
  apiCalls: ApiCallDetail[];
}

interface ResourceDetail {
  url: string;
  size: number;
  duration: number;
  type: string;
}

interface ApiCallDetail {
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
}

interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// ネットワーク条件の定義
const NETWORK_CONDITIONS = {
  'Fast 3G': {
    offline: false,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8,
    latency: 40
  },
  'Slow 3G': {
    offline: false,
    downloadThroughput: 0.5 * 1024 * 1024 / 8,
    uploadThroughput: 0.5 * 1024 * 1024 / 8,
    latency: 400
  },
  'Offline': {
    offline: true,
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0
  }
};

// テスト対象のページ
const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Search', path: '/search' },
  { name: 'Recipes', path: '/recipes' },
  { name: 'Contact', path: '/contact' }
];

test.describe('Tiramisu App Performance Tests', () => {
  let browser: Browser;
  let performanceResults: PerformanceMetrics[] = [];

  test.beforeAll(async () => {
    browser = await chromium.launch({
      args: ['--enable-precise-memory-info']
    });
  });

  test.afterAll(async () => {
    await browser.close();
    
    // パフォーマンス結果のサマリーを出力
    console.log('\n=== Performance Test Summary ===\n');
    performanceResults.forEach(result => {
      console.log(`Page: ${result.pageName}`);
      console.log(`  Load Time: ${result.loadTime.toFixed(2)}ms`);
      console.log(`  FCP: ${result.firstContentfulPaint.toFixed(2)}ms`);
      console.log(`  LCP: ${result.largestContentfulPaint.toFixed(2)}ms`);
      console.log(`  TTI: ${result.timeToInteractive.toFixed(2)}ms`);
      console.log(`  Total Resources: ${result.resourceMetrics.totalResources}`);
      console.log(`  Total Size: ${(result.resourceMetrics.totalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Memory Usage: ${(result.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log('---');
    });
  });

  // 各ページのパフォーマンステスト
  PAGES.forEach(pageInfo => {
    test(`Performance test for ${pageInfo.name} page`, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // パフォーマンスメトリクスを収集
      const metrics = await measurePagePerformance(page, pageInfo);
      performanceResults.push(metrics);
      
      // スクリーンショットを保存
      await page.screenshot({ 
        path: `tests/performance-screenshots/${pageInfo.name.toLowerCase()}-performance.png`,
        fullPage: true 
      });
      
      await context.close();
    });
  });

  // ネットワーク条件別のテスト
  Object.entries(NETWORK_CONDITIONS).forEach(([conditionName, condition]) => {
    test(`Performance under ${conditionName} network`, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const client = await context.newCDPSession(page);
      
      // ネットワーク条件を設定
      await client.send('Network.emulateNetworkConditions', condition);
      
      // ホームページでテスト
      const startTime = Date.now();
      await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      console.log(`${conditionName} - Load time: ${loadTime}ms`);
      
      await context.close();
    });
  });

  // バンドルサイズ分析
  test('Bundle size analysis', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const jsFiles: ResourceDetail[] = [];
    const cssFiles: ResourceDetail[] = [];
    
    // リソースの監視
    page.on('response', async response => {
      const url = response.url();
      const headers = response.headers();
      
      if (url.endsWith('.js') || headers['content-type']?.includes('javascript')) {
        const size = parseInt(headers['content-length'] || '0');
        jsFiles.push({
          url,
          size,
          duration: 0,
          type: 'script'
        });
      } else if (url.endsWith('.css') || headers['content-type']?.includes('css')) {
        const size = parseInt(headers['content-length'] || '0');
        cssFiles.push({
          url,
          size,
          duration: 0,
          type: 'stylesheet'
        });
      }
    });
    
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
    
    const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0);
    
    console.log('\n=== Bundle Size Analysis ===');
    console.log(`Total JS: ${(totalJsSize / 1024).toFixed(2)}KB`);
    console.log(`Total CSS: ${(totalCssSize / 1024).toFixed(2)}KB`);
    console.log(`Total: ${((totalJsSize + totalCssSize) / 1024).toFixed(2)}KB`);
    
    await context.close();
  });

  // 画像最適化のテスト
  test('Image optimization analysis', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const images: ResourceDetail[] = [];
    
    page.on('response', async response => {
      const url = response.url();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';
      
      if (contentType.startsWith('image/')) {
        const size = parseInt(headers['content-length'] || '0');
        images.push({
          url,
          size,
          duration: response.timing().responseEnd - response.timing().requestStart,
          type: contentType
        });
      }
    });
    
    // 全ページを巡回して画像を収集
    for (const pageInfo of PAGES) {
      await page.goto(`http://localhost:5176${pageInfo.path}`, { waitUntil: 'networkidle' });
    }
    
    console.log('\n=== Image Optimization Analysis ===');
    console.log(`Total images: ${images.length}`);
    console.log(`Total size: ${(images.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)}MB`);
    
    // 大きな画像を特定
    const largeImages = images.filter(img => img.size > 100 * 1024); // 100KB以上
    if (largeImages.length > 0) {
      console.log('\nLarge images (>100KB):');
      largeImages.forEach(img => {
        console.log(`  - ${img.url}: ${(img.size / 1024).toFixed(2)}KB`);
      });
    }
    
    await context.close();
  });
});

// ページパフォーマンスを測定する関数
async function measurePagePerformance(page: Page, pageInfo: { name: string; path: string }): Promise<PerformanceMetrics> {
  const resourceMetrics: ResourceMetrics = {
    totalResources: 0,
    totalSize: 0,
    images: [],
    scripts: [],
    stylesheets: [],
    apiCalls: []
  };
  
  // リソースの監視
  const resourcePromises: Promise<void>[] = [];
  
  page.on('response', response => {
    const promise = (async () => {
      const url = response.url();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';
      const size = parseInt(headers['content-length'] || '0');
      const timing = response.timing();
      const duration = timing.responseEnd - timing.requestStart;
      
      resourceMetrics.totalResources++;
      resourceMetrics.totalSize += size;
      
      const resourceDetail: ResourceDetail = {
        url,
        size,
        duration,
        type: contentType
      };
      
      if (contentType.startsWith('image/')) {
        resourceMetrics.images.push(resourceDetail);
      } else if (url.endsWith('.js') || contentType.includes('javascript')) {
        resourceMetrics.scripts.push(resourceDetail);
      } else if (url.endsWith('.css') || contentType.includes('css')) {
        resourceMetrics.stylesheets.push(resourceDetail);
      }
      
      // API呼び出しの検出
      if (url.includes('/api/') || url.includes('localhost:3000')) {
        resourceMetrics.apiCalls.push({
          url,
          method: response.request().method(),
          status: response.status(),
          duration,
          size
        });
      }
    })();
    
    resourcePromises.push(promise);
  });
  
  // ナビゲーション開始
  const startTime = Date.now();
  await page.goto(`http://localhost:5176${pageInfo.path}`, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - startTime;
  
  // すべてのリソースの処理を待つ
  await Promise.all(resourcePromises);
  
  // パフォーマンスメトリクスを取得
  const performanceData = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
    
    // Time to Interactive の概算
    const tti = navigation.loadEventEnd || navigation.domComplete;
    
    // Total Blocking Time の計算
    const longTasks = performance.getEntriesByType('longtask');
    const tbt = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
    
    // Cumulative Layout Shift
    let cls = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    layoutShiftEntries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });
    
    // メモリ使用量
    const memory = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
    
    // JavaScript実行時間の概算
    const jsExecutionTime = navigation.loadEventEnd - navigation.responseEnd;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcp,
      timeToInteractive: tti,
      totalBlockingTime: tbt,
      cumulativeLayoutShift: cls,
      memoryUsage: {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      },
      jsExecutionTime
    };
  });
  
  return {
    pageName: pageInfo.name,
    loadTime,
    ...performanceData,
    resourceMetrics
  };
}
import { test, expect, chromium } from '@playwright/test';

interface PageMetrics {
  name: string;
  url: string;
  loadTime: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  resourceCount: number;
  totalSize: number;
  memoryUsage: number;
}

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Search', path: '/search' },
  { name: 'Recipes', path: '/recipes' },
  { name: 'Contact', path: '/contact' }
];

test.describe('Tiramisu Performance Analysis', () => {
  let allMetrics: PageMetrics[] = [];

  test.afterAll(async () => {
    // パフォーマンス結果の詳細分析とレポート生成
    console.log('\n=== TIRAMISU APP PERFORMANCE REPORT ===\n');
    
    const avgLoadTime = allMetrics.reduce((sum, m) => sum + m.loadTime, 0) / allMetrics.length;
    const avgFCP = allMetrics.reduce((sum, m) => sum + m.fcp, 0) / allMetrics.length;
    const avgLCP = allMetrics.reduce((sum, m) => sum + m.lcp, 0) / allMetrics.length;
    const totalResourceSize = allMetrics.reduce((sum, m) => sum + m.totalSize, 0);
    const avgMemoryUsage = allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / allMetrics.length;

    console.log('📊 Overall Performance Summary:');
    console.log(`   Average Load Time: ${(avgLoadTime / 1000).toFixed(2)}s`);
    console.log(`   Average FCP: ${avgFCP.toFixed(0)}ms`);
    console.log(`   Average LCP: ${avgLCP.toFixed(0)}ms`);
    console.log(`   Total Resource Size: ${(totalResourceSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Average Memory Usage: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`);

    console.log('\n📋 Page-by-Page Analysis:');
    allMetrics.forEach(metric => {
      console.log(`\n🌟 ${metric.name} Page:`);
      console.log(`   URL: ${metric.url}`);
      console.log(`   Load Time: ${(metric.loadTime / 1000).toFixed(2)}s`);
      console.log(`   First Contentful Paint: ${metric.fcp.toFixed(0)}ms`);
      console.log(`   Largest Contentful Paint: ${metric.lcp.toFixed(0)}ms`);
      console.log(`   Cumulative Layout Shift: ${metric.cls.toFixed(3)}`);
      console.log(`   Total Blocking Time: ${metric.tbt.toFixed(0)}ms`);
      console.log(`   Resources Loaded: ${metric.resourceCount}`);
      console.log(`   Total Size: ${(metric.totalSize / 1024).toFixed(2)}KB`);
      console.log(`   Memory Usage: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      
      // パフォーマンススコアの計算
      const score = calculatePerformanceScore(metric);
      console.log(`   Performance Score: ${score}/100 ${getScoreEmoji(score)}`);
    });

    console.log('\n🔍 Performance Bottlenecks:');
    const bottlenecks = identifyBottlenecks(allMetrics);
    bottlenecks.forEach(bottleneck => {
      console.log(`   ⚠️  ${bottleneck}`);
    });

    console.log('\n💡 Optimization Recommendations:');
    const recommendations = generateRecommendations(allMetrics);
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(50));
  });

  for (const pageInfo of PAGES) {
    test(`Performance analysis for ${pageInfo.name} page`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      let resourceCount = 0;
      let totalSize = 0;
      
      // リソース監視
      page.on('response', response => {
        resourceCount++;
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          totalSize += parseInt(contentLength);
        }
      });
      
      // ページ読み込み時間測定
      const startTime = performance.now();
      await page.goto(`http://localhost:5176${pageInfo.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      const loadTime = performance.now() - startTime;
      
      // パフォーマンスメトリクス取得
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
        
        // CLS計算
        let cls = 0;
        const layoutShiftEntries = performance.getEntriesByType('layout-shift');
        layoutShiftEntries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        
        // TBT計算
        const longTasks = performance.getEntriesByType('longtask');
        const tbt = longTasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0);
        
        // メモリ使用量
        const memory = (performance as any).memory || { usedJSHeapSize: 0 };
        
        return {
          fcp,
          lcp,
          cls,
          tbt,
          memoryUsage: memory.usedJSHeapSize
        };
      });
      
      const pageMetrics: PageMetrics = {
        name: pageInfo.name,
        url: `http://localhost:5176${pageInfo.path}`,
        loadTime,
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        cls: metrics.cls,
        tbt: metrics.tbt,
        resourceCount,
        totalSize,
        memoryUsage: metrics.memoryUsage
      };
      
      allMetrics.push(pageMetrics);
      
      // 基本的なパフォーマンス条件をチェック
      expect(loadTime).toBeLessThan(10000); // 10秒以内
      expect(metrics.fcp).toBeLessThan(5000); // FCP 5秒以内
      expect(metrics.lcp).toBeLessThan(8000); // LCP 8秒以内
      expect(metrics.cls).toBeLessThan(0.5); // CLS 0.5以下
      
      await context.close();
    });
  }

  test('Network performance analysis', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    
    console.log('\n🌐 Network Performance Analysis:');
    
    const networkConditions = [
      { name: 'Fast 3G', downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
      { name: 'Slow 3G', downloadThroughput: 0.5 * 1024 * 1024 / 8, uploadThroughput: 0.5 * 1024 * 1024 / 8, latency: 400 }
    ];
    
    for (const condition of networkConditions) {
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: condition.downloadThroughput,
        uploadThroughput: condition.uploadThroughput,
        latency: condition.latency
      });
      
      const startTime = performance.now();
      await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
      const loadTime = performance.now() - startTime;
      
      console.log(`   ${condition.name}: ${(loadTime / 1000).toFixed(2)}s`);
      
      // ネットワーク条件に応じた妥当性チェック
      if (condition.name === 'Fast 3G') {
        expect(loadTime).toBeLessThan(30000); // 30秒以内
      } else if (condition.name === 'Slow 3G') {
        expect(loadTime).toBeLessThan(60000); // 60秒以内
      }
    }
    
    await context.close();
  });

  test('Bundle size and resource analysis', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let otherSize = 0;
    const resources: any[] = [];
    
    page.on('response', async response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      const size = parseInt(response.headers()['content-length'] || '0');
      
      resources.push({ url, contentType, size });
      
      if (url.endsWith('.js') || contentType.includes('javascript')) {
        jsSize += size;
      } else if (url.endsWith('.css') || contentType.includes('css')) {
        cssSize += size;
      } else if (contentType.startsWith('image/')) {
        imageSize += size;
      } else {
        otherSize += size;
      }
    });
    
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
    
    console.log('\n📦 Bundle & Resource Analysis:');
    console.log(`   JavaScript: ${(jsSize / 1024).toFixed(2)}KB`);
    console.log(`   CSS: ${(cssSize / 1024).toFixed(2)}KB`);
    console.log(`   Images: ${(imageSize / 1024).toFixed(2)}KB`);
    console.log(`   Other: ${(otherSize / 1024).toFixed(2)}KB`);
    console.log(`   Total: ${((jsSize + cssSize + imageSize + otherSize) / 1024).toFixed(2)}KB`);
    
    // 大きなリソースを特定
    const largeResources = resources
      .filter(r => r.size > 100 * 1024) // 100KB以上
      .sort((a, b) => b.size - a.size);
    
    if (largeResources.length > 0) {
      console.log('\n   📋 Large Resources (>100KB):');
      largeResources.slice(0, 5).forEach((resource, index) => {
        console.log(`   ${index + 1}. ${resource.url.split('/').pop()}: ${(resource.size / 1024).toFixed(2)}KB`);
      });
    }
    
    // バンドルサイズの妥当性チェック
    expect(jsSize).toBeLessThan(5 * 1024 * 1024); // JS 5MB以下
    expect(cssSize).toBeLessThan(1 * 1024 * 1024); // CSS 1MB以下
    
    await context.close();
  });
});

function calculatePerformanceScore(metrics: PageMetrics): number {
  let score = 100;
  
  // Load Time scoring
  if (metrics.loadTime > 5000) score -= 20;
  else if (metrics.loadTime > 3000) score -= 10;
  
  // FCP scoring
  if (metrics.fcp > 3000) score -= 20;
  else if (metrics.fcp > 1800) score -= 10;
  
  // LCP scoring
  if (metrics.lcp > 4000) score -= 25;
  else if (metrics.lcp > 2500) score -= 15;
  
  // CLS scoring
  if (metrics.cls > 0.25) score -= 15;
  else if (metrics.cls > 0.1) score -= 10;
  
  // TBT scoring
  if (metrics.tbt > 600) score -= 20;
  else if (metrics.tbt > 300) score -= 10;
  
  return Math.max(0, score);
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  return '🔴';
}

function identifyBottlenecks(metrics: PageMetrics[]): string[] {
  const bottlenecks: string[] = [];
  
  const avgLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
  const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
  const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
  const avgCLS = metrics.reduce((sum, m) => sum + m.cls, 0) / metrics.length;
  const avgTBT = metrics.reduce((sum, m) => sum + m.tbt, 0) / metrics.length;
  const totalSize = metrics.reduce((sum, m) => sum + m.totalSize, 0);
  
  if (avgLoadTime > 5000) bottlenecks.push('High average page load time');
  if (avgFCP > 3000) bottlenecks.push('Slow First Contentful Paint across pages');
  if (avgLCP > 4000) bottlenecks.push('Slow Largest Contentful Paint across pages');
  if (avgCLS > 0.25) bottlenecks.push('High Cumulative Layout Shift');
  if (avgTBT > 600) bottlenecks.push('High Total Blocking Time');
  if (totalSize > 5 * 1024 * 1024) bottlenecks.push('Large total resource size');
  
  // Individual page bottlenecks
  metrics.forEach(metric => {
    if (metric.loadTime > avgLoadTime * 1.5) {
      bottlenecks.push(`${metric.name} page has significantly slower load time`);
    }
    if (metric.memoryUsage > 100 * 1024 * 1024) {
      bottlenecks.push(`${metric.name} page has high memory usage`);
    }
  });
  
  return bottlenecks;
}

function generateRecommendations(metrics: PageMetrics[]): string[] {
  const recommendations: string[] = [];
  
  const avgLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
  const avgFCP = metrics.reduce((sum, m) => sum + m.fcp, 0) / metrics.length;
  const totalSize = metrics.reduce((sum, m) => sum + m.totalSize, 0);
  
  if (avgLoadTime > 5000) {
    recommendations.push('Implement code splitting and lazy loading to reduce initial bundle size');
    recommendations.push('Optimize critical rendering path by inlining critical CSS');
    recommendations.push('Use service worker for caching static assets');
  }
  
  if (avgFCP > 3000) {
    recommendations.push('Optimize font loading with font-display: swap');
    recommendations.push('Minimize render-blocking resources');
    recommendations.push('Use preload hints for critical resources');
  }
  
  if (totalSize > 2 * 1024 * 1024) {
    recommendations.push('Implement image optimization and use WebP format');
    recommendations.push('Enable gzip/brotli compression on server');
    recommendations.push('Remove unused CSS and JavaScript');
  }
  
  recommendations.push('Implement virtualization for long lists');
  recommendations.push('Use React.memo() for component optimization');
  recommendations.push('Add performance monitoring in production');
  
  return recommendations;
}
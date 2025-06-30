import { test, expect, chromium, Page, Browser } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface DetailedAnalysis {
  timestamp: string;
  testRun: string;
  pages: PageAnalysis[];
  networkTests: NetworkAnalysis[];
  bundleAnalysis: BundleAnalysis;
  imageAnalysis: ImageAnalysis;
  recommendations: Recommendation[];
}

interface PageAnalysis {
  name: string;
  url: string;
  metrics: {
    loadTime: number;
    fcp: number;
    lcp: number;
    tti: number;
    cls: number;
    tbt: number;
    memoryUsage: number;
    jsExecutionTime: number;
  };
  resources: {
    total: number;
    totalSize: number;
    breakdown: {
      images: { count: number; size: number };
      scripts: { count: number; size: number };
      stylesheets: { count: number; size: number };
      other: { count: number; size: number };
    };
  };
  performance: {
    score: number;
    bottlenecks: string[];
  };
}

interface NetworkAnalysis {
  condition: string;
  loadTime: number;
  impact: string;
}

interface BundleAnalysis {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  chunks: ChunkInfo[];
  treeshaking: TreeshakingInfo;
}

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize?: number;
}

interface TreeshakingInfo {
  unusedCode: number;
  potentialSavings: number;
}

interface ImageAnalysis {
  totalImages: number;
  totalSize: number;
  formats: { [format: string]: { count: number; size: number } };
  oversizedImages: { url: string; size: number; recommendation: string }[];
  optimizationPotential: number;
}

interface Recommendation {
  category: 'Performance' | 'Bundle' | 'Images' | 'Network' | 'Memory';
  priority: 'High' | 'Medium' | 'Low';
  issue: string;
  solution: string;
  impact: string;
}

test.describe('Detailed Performance Analysis', () => {
  let browser: Browser;
  let analysis: DetailedAnalysis;

  test.beforeAll(async () => {
    browser = await chromium.launch({
      args: ['--enable-precise-memory-info', '--disable-web-security']
    });
    
    analysis = {
      timestamp: new Date().toISOString(),
      testRun: `performance-${Date.now()}`,
      pages: [],
      networkTests: [],
      bundleAnalysis: {
        totalSize: 0,
        jsSize: 0,
        cssSize: 0,
        chunks: [],
        treeshaking: { unusedCode: 0, potentialSavings: 0 }
      },
      imageAnalysis: {
        totalImages: 0,
        totalSize: 0,
        formats: {},
        oversizedImages: [],
        optimizationPotential: 0
      },
      recommendations: []
    };
  });

  test.afterAll(async () => {
    await browser.close();
    
    // 分析結果を保存
    const reportPath = path.join(__dirname, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    
    // HTMLレポートを生成
    await generateHTMLReport(analysis);
    
    console.log(`\nDetailed performance report saved to: ${reportPath}`);
    console.log(`HTML report available at: ${path.join(__dirname, 'performance-report.html')}`);
  });

  test('Comprehensive performance analysis', async () => {
    const pages = [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Search', path: '/search' },
      { name: 'Recipes', path: '/recipes' },
      { name: 'Contact', path: '/contact' }
    ];

    for (const pageInfo of pages) {
      const pageAnalysis = await analyzePagePerformance(browser, pageInfo);
      analysis.pages.push(pageAnalysis);
      
      // パフォーマンススコアの計算
      pageAnalysis.performance.score = calculatePerformanceScore(pageAnalysis.metrics);
      pageAnalysis.performance.bottlenecks = identifyBottlenecks(pageAnalysis);
    }
    
    // 全体的な推奨事項を生成
    analysis.recommendations = generateRecommendations(analysis);
  });

  test('Network condition impact analysis', async () => {
    const networkConditions = [
      { name: 'Fast 3G', downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, latency: 40 },
      { name: 'Slow 3G', downloadThroughput: 0.5 * 1024 * 1024 / 8, uploadThroughput: 0.5 * 1024 * 1024 / 8, latency: 400 },
      { name: 'Regular 2G', downloadThroughput: 0.25 * 1024 * 1024 / 8, uploadThroughput: 0.25 * 1024 * 1024 / 8, latency: 800 }
    ];

    for (const condition of networkConditions) {
      const networkAnalysis = await analyzeNetworkCondition(browser, condition);
      analysis.networkTests.push(networkAnalysis);
    }
  });

  test('Bundle and code splitting analysis', async () => {
    const bundleAnalysis = await analyzeBundleSize(browser);
    analysis.bundleAnalysis = bundleAnalysis;
  });

  test('Image optimization analysis', async () => {
    const imageAnalysis = await analyzeImageOptimization(browser);
    analysis.imageAnalysis = imageAnalysis;
  });
});

async function analyzePagePerformance(browser: Browser, pageInfo: { name: string; path: string }): Promise<PageAnalysis> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // リソース追跡
  const resources: any[] = [];
  page.on('response', response => {
    resources.push({
      url: response.url(),
      size: parseInt(response.headers()['content-length'] || '0'),
      type: response.headers()['content-type'] || '',
      timing: response.timing()
    });
  });
  
  // パフォーマンス測定開始
  const startTime = performance.now();
  await page.goto(`http://localhost:5176${pageInfo.path}`, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  const loadTime = performance.now() - startTime;
  
  // パフォーマンスメトリクスを取得
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
      tti: navigation.loadEventEnd || navigation.domComplete,
      cls,
      tbt,
      memoryUsage: memory.usedJSHeapSize,
      jsExecutionTime: navigation.loadEventEnd - navigation.responseEnd
    };
  });
  
  // リソース分析
  const resourceBreakdown = {
    images: { count: 0, size: 0 },
    scripts: { count: 0, size: 0 },
    stylesheets: { count: 0, size: 0 },
    other: { count: 0, size: 0 }
  };
  
  resources.forEach(resource => {
    const contentType = resource.type.toLowerCase();
    if (contentType.includes('image')) {
      resourceBreakdown.images.count++;
      resourceBreakdown.images.size += resource.size;
    } else if (contentType.includes('javascript') || resource.url.endsWith('.js')) {
      resourceBreakdown.scripts.count++;
      resourceBreakdown.scripts.size += resource.size;
    } else if (contentType.includes('css') || resource.url.endsWith('.css')) {
      resourceBreakdown.stylesheets.count++;
      resourceBreakdown.stylesheets.size += resource.size;
    } else {
      resourceBreakdown.other.count++;
      resourceBreakdown.other.size += resource.size;
    }
  });
  
  await context.close();
  
  return {
    name: pageInfo.name,
    url: `http://localhost:5176${pageInfo.path}`,
    metrics: {
      loadTime,
      ...metrics
    },
    resources: {
      total: resources.length,
      totalSize: resources.reduce((sum, r) => sum + r.size, 0),
      breakdown: resourceBreakdown
    },
    performance: {
      score: 0, // 後で計算
      bottlenecks: [] // 後で識別
    }
  };
}

async function analyzeNetworkCondition(browser: Browser, condition: any): Promise<NetworkAnalysis> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  
  // ネットワーク条件を設定
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: condition.downloadThroughput,
    uploadThroughput: condition.uploadThroughput,
    latency: condition.latency
  });
  
  const startTime = performance.now();
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  const loadTime = performance.now() - startTime;
  
  let impact = 'Low';
  if (loadTime > 5000) impact = 'High';
  else if (loadTime > 3000) impact = 'Medium';
  
  await context.close();
  
  return {
    condition: condition.name,
    loadTime,
    impact
  };
}

async function analyzeBundleSize(browser: Browser): Promise<BundleAnalysis> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let jsSize = 0;
  let cssSize = 0;
  const chunks: ChunkInfo[] = [];
  
  page.on('response', async response => {
    const url = response.url();
    const size = parseInt(response.headers()['content-length'] || '0');
    
    if (url.endsWith('.js') || response.headers()['content-type']?.includes('javascript')) {
      jsSize += size;
      chunks.push({ name: url.split('/').pop() || 'unknown', size });
    } else if (url.endsWith('.css') || response.headers()['content-type']?.includes('css')) {
      cssSize += size;
      chunks.push({ name: url.split('/').pop() || 'unknown', size });
    }
  });
  
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
  
  await context.close();
  
  return {
    totalSize: jsSize + cssSize,
    jsSize,
    cssSize,
    chunks,
    treeshaking: {
      unusedCode: 0, // 実際の実装では静的解析が必要
      potentialSavings: 0
    }
  };
}

async function analyzeImageOptimization(browser: Browser): Promise<ImageAnalysis> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const images: any[] = [];
  const formats: { [format: string]: { count: number; size: number } } = {};
  
  page.on('response', response => {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.startsWith('image/')) {
      const size = parseInt(response.headers()['content-length'] || '0');
      const format = contentType.split('/')[1];
      
      images.push({ url: response.url(), size, format });
      
      if (!formats[format]) {
        formats[format] = { count: 0, size: 0 };
      }
      formats[format].count++;
      formats[format].size += size;
    }
  });
  
  const pages = ['/', '/about', '/search', '/recipes', '/contact'];
  for (const pagePath of pages) {
    await page.goto(`http://localhost:5176${pagePath}`, { waitUntil: 'networkidle' });
  }
  
  const oversizedImages = images
    .filter(img => img.size > 100 * 1024) // 100KB以上
    .map(img => ({
      url: img.url,
      size: img.size,
      recommendation: img.size > 500 * 1024 ? 'Convert to WebP and resize' : 'Convert to WebP'
    }));
  
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const optimizationPotential = oversizedImages.reduce((sum, img) => sum + img.size * 0.3, 0); // 30%削減と仮定
  
  await context.close();
  
  return {
    totalImages: images.length,
    totalSize,
    formats,
    oversizedImages,
    optimizationPotential
  };
}

function calculatePerformanceScore(metrics: any): number {
  // Lighthouse風のスコア計算
  let score = 100;
  
  // FCP (First Contentful Paint)
  if (metrics.fcp > 3000) score -= 20;
  else if (metrics.fcp > 1800) score -= 10;
  
  // LCP (Largest Contentful Paint)
  if (metrics.lcp > 4000) score -= 25;
  else if (metrics.lcp > 2500) score -= 15;
  
  // CLS (Cumulative Layout Shift)
  if (metrics.cls > 0.25) score -= 15;
  else if (metrics.cls > 0.1) score -= 10;
  
  // TTI (Time to Interactive)
  if (metrics.tti > 7300) score -= 20;
  else if (metrics.tti > 3800) score -= 10;
  
  // Total Blocking Time
  if (metrics.tbt > 600) score -= 20;
  else if (metrics.tbt > 300) score -= 10;
  
  return Math.max(0, score);
}

function identifyBottlenecks(analysis: PageAnalysis): string[] {
  const bottlenecks: string[] = [];
  
  if (analysis.metrics.fcp > 3000) bottlenecks.push('Slow First Contentful Paint');
  if (analysis.metrics.lcp > 4000) bottlenecks.push('Slow Largest Contentful Paint');
  if (analysis.metrics.cls > 0.25) bottlenecks.push('High Cumulative Layout Shift');
  if (analysis.metrics.tbt > 600) bottlenecks.push('High Total Blocking Time');
  if (analysis.metrics.loadTime > 5000) bottlenecks.push('Slow Page Load Time');
  if (analysis.resources.totalSize > 2 * 1024 * 1024) bottlenecks.push('Large Resource Size');
  if (analysis.metrics.memoryUsage > 50 * 1024 * 1024) bottlenecks.push('High Memory Usage');
  
  return bottlenecks;
}

function generateRecommendations(analysis: DetailedAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // 全般的なパフォーマンス推奨事項
  const avgLoadTime = analysis.pages.reduce((sum, page) => sum + page.metrics.loadTime, 0) / analysis.pages.length;
  if (avgLoadTime > 5000) {
    recommendations.push({
      category: 'Performance',
      priority: 'High',
      issue: `Average page load time is ${(avgLoadTime / 1000).toFixed(2)}s`,
      solution: 'Implement code splitting, lazy loading, and optimize critical rendering path',
      impact: 'Significant improvement in user experience and SEO'
    });
  }
  
  // バンドルサイズの推奨事項
  if (analysis.bundleAnalysis.totalSize > 1024 * 1024) { // 1MB以上
    recommendations.push({
      category: 'Bundle',
      priority: 'High',
      issue: `Bundle size is ${(analysis.bundleAnalysis.totalSize / 1024 / 1024).toFixed(2)}MB`,
      solution: 'Implement code splitting, tree shaking, and remove unused dependencies',
      impact: 'Faster initial load times and reduced bandwidth usage'
    });
  }
  
  // 画像最適化の推奨事項
  if (analysis.imageAnalysis.oversizedImages.length > 0) {
    recommendations.push({
      category: 'Images',
      priority: 'Medium',
      issue: `${analysis.imageAnalysis.oversizedImages.length} oversized images found`,
      solution: 'Convert images to WebP format, implement responsive images, and use image compression',
      impact: `Potential ${(analysis.imageAnalysis.optimizationPotential / 1024 / 1024).toFixed(2)}MB savings`
    });
  }
  
  // ネットワーク最適化の推奨事項
  const slowNetworkImpact = analysis.networkTests.filter(test => test.impact === 'High').length;
  if (slowNetworkImpact > 0) {
    recommendations.push({
      category: 'Network',
      priority: 'High',
      issue: 'Poor performance on slow network conditions',
      solution: 'Implement service worker for caching, optimize for offline-first, and prioritize critical resources',
      impact: 'Better user experience on slow connections'
    });
  }
  
  return recommendations;
}

async function generateHTMLReport(analysis: DetailedAnalysis): Promise<void> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tiramisu App Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #333; }
        .metric { display: inline-block; background: #f8f9fa; padding: 15px; margin: 10px; border-radius: 6px; min-width: 200px; }
        .score { font-size: 2em; font-weight: bold; }
        .score.good { color: #28a745; }
        .score.needs-improvement { color: #ffc107; }
        .score.poor { color: #dc3545; }
        .recommendation { border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; background: #f8f9fa; }
        .recommendation.high { border-color: #dc3545; }
        .recommendation.medium { border-color: #ffc107; }
        .recommendation.low { border-color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .chart { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Tiramisu App Performance Report</h1>
        <p><strong>Generated:</strong> ${new Date(analysis.timestamp).toLocaleString()}</p>
        
        <h2>Overall Performance Summary</h2>
        <div class="metrics-grid">
            ${analysis.pages.map(page => `
                <div class="metric">
                    <h3>${page.name} Page</h3>
                    <div class="score ${getScoreClass(page.performance.score)}">${page.performance.score}</div>
                    <p>Load Time: ${(page.metrics.loadTime / 1000).toFixed(2)}s</p>
                    <p>FCP: ${page.metrics.fcp.toFixed(0)}ms</p>
                    <p>LCP: ${page.metrics.lcp.toFixed(0)}ms</p>
                </div>
            `).join('')}
        </div>
        
        <h2>Detailed Page Metrics</h2>
        <table>
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Load Time</th>
                    <th>FCP</th>
                    <th>LCP</th>
                    <th>TTI</th>
                    <th>CLS</th>
                    <th>Memory</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                ${analysis.pages.map(page => `
                    <tr>
                        <td>${page.name}</td>
                        <td>${(page.metrics.loadTime / 1000).toFixed(2)}s</td>
                        <td>${page.metrics.fcp.toFixed(0)}ms</td>
                        <td>${page.metrics.lcp.toFixed(0)}ms</td>
                        <td>${page.metrics.tti.toFixed(0)}ms</td>
                        <td>${page.metrics.cls.toFixed(3)}</td>
                        <td>${(page.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</td>
                        <td class="score ${getScoreClass(page.performance.score)}">${page.performance.score}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>Network Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Network Condition</th>
                    <th>Load Time</th>
                    <th>Impact</th>
                </tr>
            </thead>
            <tbody>
                ${analysis.networkTests.map(test => `
                    <tr>
                        <td>${test.condition}</td>
                        <td>${(test.loadTime / 1000).toFixed(2)}s</td>
                        <td>${test.impact}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>Bundle Analysis</h2>
        <div class="metric">
            <h3>Bundle Size</h3>
            <p>Total: ${(analysis.bundleAnalysis.totalSize / 1024).toFixed(2)}KB</p>
            <p>JavaScript: ${(analysis.bundleAnalysis.jsSize / 1024).toFixed(2)}KB</p>
            <p>CSS: ${(analysis.bundleAnalysis.cssSize / 1024).toFixed(2)}KB</p>
        </div>
        
        <h2>Image Analysis</h2>
        <div class="metric">
            <h3>Images</h3>
            <p>Total Images: ${analysis.imageAnalysis.totalImages}</p>
            <p>Total Size: ${(analysis.imageAnalysis.totalSize / 1024 / 1024).toFixed(2)}MB</p>
            <p>Optimization Potential: ${(analysis.imageAnalysis.optimizationPotential / 1024 / 1024).toFixed(2)}MB</p>
        </div>
        
        <h2>Recommendations</h2>
        ${analysis.recommendations.map(rec => `
            <div class="recommendation ${rec.priority.toLowerCase()}">
                <h3>${rec.category} - ${rec.priority} Priority</h3>
                <p><strong>Issue:</strong> ${rec.issue}</p>
                <p><strong>Solution:</strong> ${rec.solution}</p>
                <p><strong>Impact:</strong> ${rec.impact}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;
  
  const reportPath = path.join(__dirname, 'performance-report.html');
  fs.writeFileSync(reportPath, htmlContent.trim());
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}
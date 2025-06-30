import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ResponsiveIssue {
  type: 'layout' | 'overflow' | 'text' | 'interaction' | 'performance';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  viewport: string;
  page: string;
  element?: string;
  recommendation?: string;
}

interface AnalysisResult {
  issues: ResponsiveIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    pagesAnalyzed: number;
    viewportsAnalyzed: number;
  };
  recommendations: string[];
}

const pages = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Search', path: '/search' },
  { name: 'Recipes', path: '/recipes' },
  { name: 'Contact', path: '/contact' },
];

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

test.describe('Responsive Design Analysis', () => {
  let analysisResult: AnalysisResult = {
    issues: [],
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0,
      pagesAnalyzed: 0,
      viewportsAnalyzed: 0,
    },
    recommendations: [],
  };

  test.beforeAll(async () => {
    // スクリーンショットディレクトリを作成
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'responsive');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test('Comprehensive Responsive Analysis', async ({ browser }) => {
    for (const pageInfo of pages) {
      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height }
        });
        const page = await context.newPage();

        try {
          await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);

          // 詳細分析を実行
          await analyzeLayout(page, pageInfo, viewport, analysisResult);
          await analyzeOverflow(page, pageInfo, viewport, analysisResult);
          await analyzeTextReadability(page, pageInfo, viewport, analysisResult);
          await analyzeInteractions(page, pageInfo, viewport, analysisResult);
          await analyzeMediaQueries(page, pageInfo, viewport, analysisResult);

          // スクリーンショットを撮影
          await page.screenshot({
            path: `screenshots/responsive/${pageInfo.name.toLowerCase()}-${viewport.name}.png`,
            fullPage: true
          });

          analysisResult.summary.viewportsAnalyzed++;

        } catch (error) {
          analysisResult.issues.push({
            type: 'layout',
            severity: 'critical',
            description: `Failed to load page: ${error}`,
            viewport: viewport.name,
            page: pageInfo.name,
            recommendation: 'Check page routing and ensure all dependencies are loaded correctly'
          });
        } finally {
          await context.close();
        }
      }
      analysisResult.summary.pagesAnalyzed++;
    }

    // 結果をカウント
    analysisResult.summary.totalIssues = analysisResult.issues.length;
    analysisResult.summary.criticalIssues = analysisResult.issues.filter(i => i.severity === 'critical').length;
    analysisResult.summary.majorIssues = analysisResult.issues.filter(i => i.severity === 'major').length;
    analysisResult.summary.minorIssues = analysisResult.issues.filter(i => i.severity === 'minor').length;

    // 推奨事項を生成
    generateRecommendations(analysisResult);

    // レポートを生成
    await generateReport(analysisResult);
  });
});

async function analyzeLayout(page: Page, pageInfo: any, viewport: any, result: AnalysisResult) {
  // レイアウトシフトのチェック
  const layoutShift = await page.evaluate(() => {
    return new Promise((resolve) => {
      let cumulativeShift = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            cumulativeShift += (entry as any).value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      
      setTimeout(() => {
        observer.disconnect();
        resolve(cumulativeShift);
      }, 3000);
    });
  });

  if (layoutShift > 0.1) {
    result.issues.push({
      type: 'layout',
      severity: layoutShift > 0.25 ? 'critical' : 'major',
      description: `Significant layout shift detected (CLS: ${layoutShift.toFixed(3)})`,
      viewport: viewport.name,
      page: pageInfo.name,
      recommendation: 'Add explicit dimensions to images and reserve space for dynamic content'
    });
  }

  // コンテナの幅チェック
  const containerOverflow = await page.evaluate(() => {
    const containers = document.querySelectorAll('.container, [class*="max-w-"], main, section');
    const viewportWidth = window.innerWidth;
    const issues = [];

    containers.forEach((container, index) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > viewportWidth) {
        issues.push({
          element: container.tagName + (container.className ? '.' + container.className.split(' ')[0] : ''),
          width: rect.width,
          viewportWidth: viewportWidth
        });
      }
    });

    return issues;
  });

  containerOverflow.forEach((issue: any) => {
    result.issues.push({
      type: 'layout',
      severity: 'major',
      description: `Container wider than viewport: ${issue.element} (${issue.width}px > ${issue.viewportWidth}px)`,
      viewport: viewport.name,
      page: pageInfo.name,
      element: issue.element,
      recommendation: 'Use responsive width classes and ensure proper container max-widths'
    });
  });
}

async function analyzeOverflow(page: Page, pageInfo: any, viewport: any, result: AnalysisResult) {
  // 水平スクロールバーの検出
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  if (hasHorizontalScroll) {
    result.issues.push({
      type: 'overflow',
      severity: 'major',
      description: 'Horizontal scrollbar detected',
      viewport: viewport.name,
      page: pageInfo.name,
      recommendation: 'Check for fixed-width elements and ensure proper responsive breakpoints'
    });
  }

  // 隠れたコンテンツの検出
  const hiddenContent = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const issues = [];
    const viewportWidth = window.innerWidth;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth && rect.width > 10) {
        issues.push({
          element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
          right: rect.right,
          width: rect.width
        });
      }
    });

    return issues.slice(0, 5); // 最初の5件のみ
  });

  hiddenContent.forEach((issue: any) => {
    result.issues.push({
      type: 'overflow',
      severity: 'minor',
      description: `Element extends beyond viewport: ${issue.element}`,
      viewport: viewport.name,
      page: pageInfo.name,
      element: issue.element,
      recommendation: 'Use responsive design patterns and proper overflow handling'
    });
  });
}

async function analyzeTextReadability(page: Page, pageInfo: any, viewport: any, result: AnalysisResult) {
  const textIssues = await page.evaluate((viewportWidth) => {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
    const issues = [];
    const minFontSize = viewportWidth < 768 ? 14 : 12;

    textElements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      const fontSize = parseFloat(styles.fontSize);
      const lineHeight = parseFloat(styles.lineHeight);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // フォントサイズチェック
      if (fontSize < minFontSize && el.textContent && el.textContent.trim().length > 0) {
        issues.push({
          type: 'font-size',
          element: el.tagName.toLowerCase(),
          fontSize: fontSize,
          minRequired: minFontSize
        });
      }

      // 行の高さチェック
      if (lineHeight < fontSize * 1.2 && el.textContent && el.textContent.trim().length > 10) {
        issues.push({
          type: 'line-height',
          element: el.tagName.toLowerCase(),
          lineHeight: lineHeight,
          fontSize: fontSize
        });
      }
    });

    return issues.slice(0, 10); // 最初の10件のみ
  }, viewport.width);

  textIssues.forEach((issue: any) => {
    if (issue.type === 'font-size') {
      result.issues.push({
        type: 'text',
        severity: 'minor',
        description: `Font size too small: ${issue.fontSize}px (minimum: ${issue.minRequired}px)`,
        viewport: viewport.name,
        page: pageInfo.name,
        element: issue.element,
        recommendation: 'Increase font size for better readability on mobile devices'
      });
    } else if (issue.type === 'line-height') {
      result.issues.push({
        type: 'text',
        severity: 'minor',
        description: `Line height too small: ${issue.lineHeight}px for font size ${issue.fontSize}px`,
        viewport: viewport.name,
        page: pageInfo.name,
        element: issue.element,
        recommendation: 'Increase line height to at least 1.2x font size for better readability'
      });
    }
  });
}

async function analyzeInteractions(page: Page, pageInfo: any, viewport: any, result: AnalysisResult) {
  if (viewport.width < 768) { // モバイルデバイスのみ
    const touchTargetIssues = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick]');
      const issues = [];
      const minTouchTarget = 44; // 44px minimum

      interactiveElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if ((rect.width < minTouchTarget || rect.height < minTouchTarget) && rect.width > 0 && rect.height > 0) {
          issues.push({
            element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ')[0] : ''),
            width: rect.width,
            height: rect.height,
            minRequired: minTouchTarget
          });
        }
      });

      return issues.slice(0, 10);
    });

    touchTargetIssues.forEach((issue: any) => {
      result.issues.push({
        type: 'interaction',
        severity: 'major',
        description: `Touch target too small: ${issue.element} (${Math.round(issue.width)}x${Math.round(issue.height)}px, minimum: ${issue.minRequired}x${issue.minRequired}px)`,
        viewport: viewport.name,
        page: pageInfo.name,
        element: issue.element,
        recommendation: 'Increase touch target size to at least 44x44px for better mobile usability'
      });
    });
  }
}

async function analyzeMediaQueries(page: Page, pageInfo: any, viewport: any, result: AnalysisResult) {
  // メディアクエリが適切に適用されているかチェック
  const mediaQueryInfo = await page.evaluate((viewportWidth) => {
    const stylesheets = Array.from(document.styleSheets);
    let mediaQueries = [];

    try {
      stylesheets.forEach(sheet => {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSMediaRule) {
              mediaQueries.push(rule.conditionText);
            }
          });
        }
      });
    } catch (e) {
      // Cross-origin stylesheets may not be accessible
    }

    return {
      mediaQueries: mediaQueries,
      currentBreakpoint: viewportWidth < 640 ? 'mobile' : 
                       viewportWidth < 768 ? 'mobile-large' :
                       viewportWidth < 1024 ? 'tablet' :
                       viewportWidth < 1280 ? 'desktop' : 'desktop-large'
    };
  }, viewport.width);

  // レスポンシブデザインパターンの確認
  const responsiveClasses = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    let responsiveClassCount = 0;
    const commonResponsiveClasses = ['sm:', 'md:', 'lg:', 'xl:', '2xl:', 'mobile', 'tablet', 'desktop'];

    elements.forEach(el => {
      const className = el.className.toString();
      if (commonResponsiveClasses.some(cls => className.includes(cls))) {
        responsiveClassCount++;
      }
    });

    return responsiveClassCount;
  });

  if (responsiveClasses === 0) {
    result.issues.push({
      type: 'layout',
      severity: 'major',
      description: 'No responsive CSS classes detected',
      viewport: viewport.name,
      page: pageInfo.name,
      recommendation: 'Implement responsive design using CSS media queries or utility classes'
    });
  }
}

function generateRecommendations(result: AnalysisResult) {
  const recommendations = new Set<string>();

  // 問題の種類と頻度に基づいて推奨事項を生成
  const issueTypes = result.issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (issueTypes.overflow > 2) {
    recommendations.add('Implement a mobile-first responsive design approach with proper container max-widths');
  }

  if (issueTypes.text > 3) {
    recommendations.add('Review and standardize typography scales for different screen sizes');
  }

  if (issueTypes.interaction > 2) {
    recommendations.add('Audit and increase touch target sizes for mobile devices (minimum 44x44px)');
  }

  if (issueTypes.layout > 3) {
    recommendations.add('Add explicit dimensions to images and implement proper loading strategies');
  }

  if (result.summary.criticalIssues > 0) {
    recommendations.add('Address critical issues immediately as they severely impact user experience');
  }

  result.recommendations = Array.from(recommendations);
}

async function generateReport(result: AnalysisResult) {
  const reportContent = `# Responsive Design Analysis Report

## Summary
- **Pages Analyzed**: ${result.summary.pagesAnalyzed}
- **Viewports Tested**: ${result.summary.viewportsAnalyzed}
- **Total Issues Found**: ${result.summary.totalIssues}
  - Critical: ${result.summary.criticalIssues}
  - Major: ${result.summary.majorIssues}
  - Minor: ${result.summary.minorIssues}

## Issues by Category

### Critical Issues (${result.summary.criticalIssues})
${result.issues.filter(i => i.severity === 'critical').map(issue => 
`- **${issue.page}** (${issue.viewport}): ${issue.description}
  - Recommendation: ${issue.recommendation || 'No specific recommendation'}`
).join('\n')}

### Major Issues (${result.summary.majorIssues})
${result.issues.filter(i => i.severity === 'major').map(issue => 
`- **${issue.page}** (${issue.viewport}): ${issue.description}
  - Recommendation: ${issue.recommendation || 'No specific recommendation'}`
).join('\n')}

### Minor Issues (${result.summary.minorIssues})
${result.issues.filter(i => i.severity === 'minor').map(issue => 
`- **${issue.page}** (${issue.viewport}): ${issue.description}
  - Recommendation: ${issue.recommendation || 'No specific recommendation'}`
).join('\n')}

## Overall Recommendations
${result.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
1. Address critical issues immediately
2. Plan fixes for major issues in the next development cycle
3. Schedule minor issue fixes for future improvements
4. Implement automated responsive testing in CI/CD pipeline

---
*Generated on ${new Date().toISOString()}*
`;

  fs.writeFileSync('responsive-analysis-report.md', reportContent);
  console.log('Responsive analysis report generated: responsive-analysis-report.md');
}
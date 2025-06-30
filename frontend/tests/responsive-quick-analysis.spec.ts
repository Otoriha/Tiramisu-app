import { test } from '@playwright/test';
import * as fs from 'fs';

interface ResponsiveIssue {
  type: string;
  severity: string;
  description: string;
  viewport: string;
  page: string;
  recommendation: string;
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

test.describe('Quick Responsive Analysis', () => {
  const issues: ResponsiveIssue[] = [];
  
  test('Analyze responsive issues', async ({ browser }) => {
    for (const pageInfo of pages) {
      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height }
        });
        const page = await context.newPage();

        try {
          await page.goto(pageInfo.path, { waitUntil: 'networkidle', timeout: 10000 });
          await page.waitForTimeout(1000);

          // 水平スクロールチェック
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });

          if (hasHorizontalScroll) {
            issues.push({
              type: 'overflow',
              severity: 'major',
              description: '水平スクロールが発生しています',
              viewport: viewport.name,
              page: pageInfo.name,
              recommendation: '要素の幅を調整し、レスポンシブ対応を改善してください'
            });
          }

          // 小さなフォントサイズのチェック
          const smallFonts = await page.evaluate((viewportWidth) => {
            const elements = document.querySelectorAll('*');
            const smallFontElements = [];
            const minSize = viewportWidth < 768 ? 12 : 10;

            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const styles = window.getComputedStyle(el);
              const fontSize = parseFloat(styles.fontSize);
              
              if (fontSize < minSize && el.textContent && el.textContent.trim().length > 5) {
                smallFontElements.push({
                  tag: el.tagName.toLowerCase(),
                  fontSize: fontSize,
                  text: el.textContent.trim().substring(0, 30)
                });
                if (smallFontElements.length >= 3) break;
              }
            }
            return smallFontElements;
          }, viewport.width);

          if (smallFonts.length > 0 && viewport.width < 768) {
            issues.push({
              type: 'text',
              severity: 'minor',
              description: `小さなフォントサイズが検出されました (${smallFonts.length}個)`,
              viewport: viewport.name,
              page: pageInfo.name,
              recommendation: 'モバイルデバイスでの可読性向上のため、フォントサイズを12px以上に設定してください'
            });
          }

          // 要素のはみ出しチェック
          const overflowElements = await page.evaluate((viewportWidth) => {
            const elements = document.querySelectorAll('*');
            const overflowing = [];

            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const rect = el.getBoundingClientRect();
              
              if (rect.right > viewportWidth && rect.width > 20) {
                overflowing.push({
                  tag: el.tagName.toLowerCase(),
                  className: el.className.toString().substring(0, 30),
                  width: Math.round(rect.width),
                  right: Math.round(rect.right)
                });
                if (overflowing.length >= 3) break;
              }
            }
            return overflowing;
          }, viewport.width);

          if (overflowElements.length > 0) {
            issues.push({
              type: 'layout',
              severity: 'major',
              description: `要素がビューポートからはみ出しています (${overflowElements.length}個)`,
              viewport: viewport.name,
              page: pageInfo.name,
              recommendation: 'レスポンシブデザインパターンを使用して要素の幅を調整してください'
            });
          }

          // ナビゲーションの確認
          const navVisible = await page.isVisible('nav');
          const mobileMenuButton = await page.isVisible('[data-testid="mobile-menu-button"], .mobile-menu-button, button[aria-label*="menu"], button[aria-label*="Menu"]');
          
          if (viewport.width < 768 && !mobileMenuButton && navVisible) {
            issues.push({
              type: 'interaction',
              severity: 'major',
              description: 'モバイルでハンバーガーメニューが検出されません',
              viewport: viewport.name,
              page: pageInfo.name,
              recommendation: 'モバイル用のハンバーガーメニューを実装してください'
            });
          }

          // タッチターゲットサイズチェック（モバイルのみ）
          if (viewport.width < 768) {
            const smallTouchTargets = await page.evaluate(() => {
              const interactiveElements = document.querySelectorAll('button, a, input, select');
              const smallTargets = [];

              for (let i = 0; i < interactiveElements.length; i++) {
                const el = interactiveElements[i];
                const rect = el.getBoundingClientRect();
                
                if ((rect.width < 44 || rect.height < 44) && rect.width > 0 && rect.height > 0) {
                  smallTargets.push({
                    tag: el.tagName.toLowerCase(),
                    size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
                  });
                  if (smallTargets.length >= 5) break;
                }
              }
              return smallTargets;
            });

            if (smallTouchTargets.length > 0) {
              issues.push({
                type: 'interaction',
                severity: 'major',
                description: `タッチターゲットが小さすぎます (${smallTouchTargets.length}個が44px未満)`,
                viewport: viewport.name,
                page: pageInfo.name,
                recommendation: 'インタラクティブ要素のサイズを最低44x44pxにしてください'
              });
            }
          }

        } catch (error) {
          issues.push({
            type: 'error',
            severity: 'critical',
            description: `ページの読み込みに失敗しました: ${error}`,
            viewport: viewport.name,
            page: pageInfo.name,
            recommendation: 'ページのルーティングと依存関係を確認してください'
          });
        } finally {
          await context.close();
        }
      }
    }

    // レポート生成
    await generateAnalysisReport(issues);
  });
});

async function generateAnalysisReport(issues: ResponsiveIssue[]) {
  const summary = {
    totalIssues: issues.length,
    criticalIssues: issues.filter(i => i.severity === 'critical').length,
    majorIssues: issues.filter(i => i.severity === 'major').length,
    minorIssues: issues.filter(i => i.severity === 'minor').length,
    pagesAnalyzed: 5,
    viewportsAnalyzed: 8
  };

  const issuesByType = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const issuesByPage = issues.reduce((acc, issue) => {
    acc[issue.page] = (acc[issue.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportContent = `# Tiramisu App - レスポンシブデザイン分析レポート

## 実行概要
- **分析日時**: ${new Date().toLocaleString('ja-JP')}
- **分析対象ページ**: ${summary.pagesAnalyzed}ページ
- **テスト画面サイズ**: ${summary.viewportsAnalyzed}種類
- **検出された問題**: ${summary.totalIssues}件

## 問題の重要度別サマリー
- **クリティカル**: ${summary.criticalIssues}件 - 即座に対応が必要
- **メジャー**: ${summary.majorIssues}件 - 次の開発サイクルで対応
- **マイナー**: ${summary.minorIssues}件 - 今後の改善で対応

## 問題の種類別分析
${Object.entries(issuesByType).map(([type, count]) => `- **${type}**: ${count}件`).join('\n')}

## ページ別問題数
${Object.entries(issuesByPage).map(([page, count]) => `- **${page}**: ${count}件`).join('\n')}

## 詳細な問題一覧

### クリティカルな問題 (${summary.criticalIssues}件)
${issues.filter(i => i.severity === 'critical').map((issue, index) => `
${index + 1}. **${issue.page}ページ** (${issue.viewport})
   - 問題: ${issue.description}
   - 推奨対応: ${issue.recommendation}
`).join('')}

### メジャーな問題 (${summary.majorIssues}件)
${issues.filter(i => i.severity === 'major').map((issue, index) => `
${index + 1}. **${issue.page}ページ** (${issue.viewport})
   - 問題: ${issue.description}
   - 推奨対応: ${issue.recommendation}
`).join('')}

### マイナーな問題 (${summary.minorIssues}件)
${issues.filter(i => i.severity === 'minor').map((issue, index) => `
${index + 1}. **${issue.page}ページ** (${issue.viewport})
   - 問題: ${issue.description}
   - 推奨対応: ${issue.recommendation}
`).join('')}

## 改善の優先順位と推奨事項

### 即座に対応すべき項目
${summary.criticalIssues > 0 ? 
  '1. クリティカルな問題の解決（ページの読み込みエラーなど）\n2. 基本的な機能の動作確認' : 
  '現在、即座に対応が必要なクリティカルな問題はありません。'}

### 短期的な改善項目（1-2週間以内）
${summary.majorIssues > 0 ? `
1. **レイアウトの修正**: 要素のはみ出しや水平スクロールの解決
2. **タッチターゲットの改善**: モバイルでのインタラクション向上
3. **ナビゲーションの最適化**: モバイルメニューの実装・改善` : 
'現在、短期的に対応が必要なメジャーな問題はありません。'}

### 中長期的な改善項目（1ヶ月以内）
${summary.minorIssues > 0 ? `
1. **タイポグラフィの調整**: フォントサイズの統一と可読性向上
2. **レスポンシブデザインの細かな調整**
3. **ユーザビリティの向上**` : 
'現在、中長期的に対応が必要なマイナーな問題はありません。'}

## 技術的な推奨事項

### CSS/デザインシステム
- Tailwind CSSのレスポンシブ用プレフィックス（sm:, md:, lg:, xl:）を積極的に活用
- モバイルファーストのアプローチを採用
- 最小タッチターゲットサイズ（44x44px）の遵守

### 開発プロセス
- レスポンシブテストの自動化をCI/CDパイプラインに組み込み
- 定期的なクロスブラウザテストの実施
- デザインシステムの文書化と共有

## 次のアクション

1. **緊急対応**: クリティカルな問題の解決
2. **計画策定**: メジャーな問題の修正スケジュール作成
3. **継続的改善**: 定期的なレスポンシブテストの実施体制構築

---
*このレポートは自動分析により生成されました。詳細な調査が必要な場合は、手動での確認も併せて実施してください。*
`;

  fs.writeFileSync('responsive-analysis-report.md', reportContent, 'utf8');
  
  console.log('\n' + '='.repeat(60));
  console.log('レスポンシブ分析レポートが生成されました');
  console.log('ファイル: responsive-analysis-report.md');
  console.log('='.repeat(60));
  console.log(`総問題数: ${summary.totalIssues}件`);
  console.log(`- クリティカル: ${summary.criticalIssues}件`);
  console.log(`- メジャー: ${summary.majorIssues}件`);
  console.log(`- マイナー: ${summary.minorIssues}件`);
  console.log('='.repeat(60) + '\n');
}
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'HomePage', path: '/' },
  { name: 'SearchPage', path: '/search' },
  { name: 'RecipesPage', path: '/recipes' },
  { name: 'AboutPage', path: '/about' },
  { name: 'ContactPage', path: '/contact' },
];

test.describe('Quick Accessibility Audit', () => {
  test.use({
    baseURL: 'http://localhost:5177',
  });

  test('Generate accessibility report', async ({ page }) => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: pages.length,
        totalViolations: 0,
        totalPasses: 0,
        criticalIssues: 0,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0
      },
      pageResults: {} as Record<string, any>,
      violations: [] as any[],
      recommendations: [] as string[]
    };

    console.log('=== Tiramisu App アクセシビリティ監査レポート ===\n');

    for (const pageInfo of pages) {
      console.log(`\nテスト中: ${pageInfo.name} (${pageInfo.path})`);
      
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // スクリーンショット撮影
      await page.screenshot({ 
        path: `screenshots/accessibility-${pageInfo.name.toLowerCase()}.png`,
        fullPage: true 
      });

      // axe-coreによるアクセシビリティテスト
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // ページごとの結果を記録
      const criticalViolations = axeResults.violations.filter(v => v.impact === 'critical');
      const seriousViolations = axeResults.violations.filter(v => v.impact === 'serious');
      const moderateViolations = axeResults.violations.filter(v => v.impact === 'moderate');
      const minorViolations = axeResults.violations.filter(v => v.impact === 'minor');

      report.pageResults[pageInfo.name] = {
        url: pageInfo.path,
        violations: axeResults.violations.length,
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length,
        score: Math.round((axeResults.passes.length / (axeResults.passes.length + axeResults.violations.length)) * 100),
        criticalCount: criticalViolations.length,
        seriousCount: seriousViolations.length,
        moderateCount: moderateViolations.length,
        minorCount: minorViolations.length
      };

      // 集計
      report.summary.totalViolations += axeResults.violations.length;
      report.summary.totalPasses += axeResults.passes.length;
      report.summary.criticalIssues += criticalViolations.length;
      report.summary.seriousIssues += seriousViolations.length;
      report.summary.moderateIssues += moderateViolations.length;
      report.summary.minorIssues += minorViolations.length;

      // 違反の詳細を記録
      if (axeResults.violations.length > 0) {
        console.log(`  ⚠️  ${axeResults.violations.length} 件の違反が見つかりました`);
        
        axeResults.violations.forEach((violation) => {
          report.violations.push({
            page: pageInfo.name,
            rule: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,
            nodes: violation.nodes.map(node => ({
              html: node.html,
              target: node.target.join(', '),
              failureSummary: node.failureSummary
            }))
          });
          
          console.log(`    - ${violation.impact?.toUpperCase()}: ${violation.help}`);
        });
      } else {
        console.log(`  ✅ 違反なし`);
      }
      
      console.log(`  スコア: ${report.pageResults[pageInfo.name].score}%`);
    }

    // 全体スコアの計算
    const overallScore = Math.round((report.summary.totalPasses / (report.summary.totalPasses + report.summary.totalViolations)) * 100);

    // 推奨事項の生成
    if (report.summary.criticalIssues > 0) {
      report.recommendations.push('🔴 緊急: クリティカルなアクセシビリティ問題を直ちに修正してください');
    }
    if (report.summary.seriousIssues > 0) {
      report.recommendations.push('🟠 重要: 深刻なアクセシビリティ問題を優先的に対処してください');
    }
    if (report.summary.moderateIssues > 0) {
      report.recommendations.push('🟡 中程度: 中程度のアクセシビリティ問題の改善を検討してください');
    }
    if (report.summary.minorIssues > 0) {
      report.recommendations.push('🟢 軽微: 軽微なアクセシビリティ問題も可能な限り修正してください');
    }

    report.recommendations.push('💡 定期的なアクセシビリティ監査の実施を推奨します');
    report.recommendations.push('💡 開発プロセスにアクセシビリティテストを組み込んでください');
    report.recommendations.push('💡 スクリーンリーダーユーザーによる実際のテストも検討してください');

    // レポートの出力
    console.log('\n=== サマリー ===');
    console.log(`全体スコア: ${overallScore}%`);
    console.log(`総ページ数: ${report.summary.totalPages}`);
    console.log(`総違反数: ${report.summary.totalViolations}`);
    console.log(`- クリティカル: ${report.summary.criticalIssues}`);
    console.log(`- 深刻: ${report.summary.seriousIssues}`);
    console.log(`- 中程度: ${report.summary.moderateIssues}`);
    console.log(`- 軽微: ${report.summary.minorIssues}`);
    
    console.log('\n=== 推奨事項 ===');
    report.recommendations.forEach(rec => console.log(rec));

    // 詳細な違反情報
    console.log('\n=== 主要な違反の詳細 ===');
    const topViolations = report.violations
      .filter(v => v.impact === 'critical' || v.impact === 'serious')
      .slice(0, 10);
    
    topViolations.forEach((violation, index) => {
      console.log(`\n${index + 1}. [${violation.impact?.toUpperCase()}] ${violation.page} - ${violation.help}`);
      console.log(`   ルール: ${violation.rule}`);
      console.log(`   説明: ${violation.description}`);
      console.log(`   詳細: ${violation.helpUrl}`);
      
      if (violation.nodes.length > 0) {
        console.log(`   影響を受ける要素 (最初の3つ):`);
        violation.nodes.slice(0, 3).forEach((node: any) => {
          console.log(`     - ${node.target}`);
          console.log(`       HTML: ${node.html.substring(0, 100)}...`);
        });
      }
    });

    // レポート内容の出力
    console.log('\n=== レポートデータ（JSON形式）===');
    console.log(JSON.stringify(report, null, 2));

    // アサーション（テストの合否判定）
    expect(overallScore).toBeGreaterThanOrEqual(75); // 75%以上のスコアを要求
    expect(report.summary.criticalIssues).toBe(0); // クリティカルな問題は許容しない
  });
});
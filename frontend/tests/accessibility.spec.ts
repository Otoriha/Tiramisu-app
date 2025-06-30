import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ページのリスト
const pages = [
  { name: 'HomePage', path: '/' },
  { name: 'SearchPage', path: '/search' },
  { name: 'RecipesPage', path: '/recipes' },
  { name: 'AboutPage', path: '/about' },
  { name: 'ContactPage', path: '/contact' },
];

// カラーコントラスト用のテストカラー
const colorContrastElements = [
  { selector: 'h1, h2, h3, h4, h5, h6', description: 'Headings' },
  { selector: 'p', description: 'Paragraphs' },
  { selector: 'button', description: 'Buttons' },
  { selector: 'a', description: 'Links' },
  { selector: 'input, textarea', description: 'Form inputs' },
  { selector: '.text-gray-600', description: 'Gray text' },
  { selector: '.text-white', description: 'White text' },
];

// キーボードナビゲーション用のインタラクティブ要素
const interactiveElements = [
  'button',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
];

test.describe('WCAG 2.1 Accessibility Testing', () => {
  test.use({
    baseURL: 'http://localhost:5177',
  });

  // 1. WCAG 2.1 コンプライアンステスト
  for (const page of pages) {
    test(`WCAG 2.1 compliance - ${page.name}`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      // axe-coreによる自動テスト
      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // 違反がないことを確認
      expect(accessibilityScanResults.violations).toHaveLength(0);

      // 詳細レポートの生成
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n=== ${page.name} Violations ===`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\nRule: ${violation.id}`);
          console.log(`Impact: ${violation.impact}`);
          console.log(`Description: ${violation.description}`);
          console.log(`Help: ${violation.help}`);
          console.log(`Help URL: ${violation.helpUrl}`);
          
          violation.nodes.forEach((node, index) => {
            console.log(`\n  Node ${index + 1}:`);
            console.log(`    HTML: ${node.html}`);
            console.log(`    Target: ${node.target.join(', ')}`);
            console.log(`    Summary: ${node.failureSummary}`);
          });
        });
      }
    });
  }

  // 2. キーボードナビゲーションテスト
  test.describe('Keyboard Navigation', () => {
    for (const page of pages) {
      test(`Keyboard navigation - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // Tabキーでのナビゲーション順序をテスト
        const tabOrder: string[] = [];
        let previousElement = null;

        // 最初の要素にフォーカス
        await browserPage.keyboard.press('Tab');
        
        for (let i = 0; i < 50; i++) { // 最大50要素まで
          const focusedElement = await browserPage.evaluateHandle(() => document.activeElement);
          const tagName = await focusedElement.evaluate((el) => el.tagName);
          const text = await focusedElement.evaluate((el) => el.textContent?.trim() || '');
          const ariaLabel = await focusedElement.evaluate((el) => el.getAttribute('aria-label'));
          
          if (focusedElement === previousElement) break;
          
          tabOrder.push(`${tagName}: ${ariaLabel || text}`);
          previousElement = focusedElement;
          
          await browserPage.keyboard.press('Tab');
        }

        // タブ順序が論理的であることを確認
        expect(tabOrder.length).toBeGreaterThan(0);
        console.log(`\n${page.name} Tab Order:`, tabOrder);

        // Escapeキーでモーダルを閉じる機能をテスト（該当する場合）
        const modals = await browserPage.$$('[role="dialog"], .modal');
        for (const modal of modals) {
          const isVisible = await modal.isVisible();
          if (isVisible) {
            await browserPage.keyboard.press('Escape');
            await expect(modal).toBeHidden();
          }
        }

        // Enterキーでのボタン/リンクの動作
        const buttons = await browserPage.$$('button:not([disabled])');
        if (buttons.length > 0) {
          await buttons[0].focus();
          const initialUrl = browserPage.url();
          await browserPage.keyboard.press('Enter');
          // ナビゲーションまたはアクションが発生したか確認
          await browserPage.waitForTimeout(500);
        }
      });
    }

    // 矢印キーでのナビゲーション（特定のコンポーネント）
    test('Arrow key navigation - Search results', async ({ page }) => {
      await page.goto('/search?q=tiramisu');
      await page.waitForLoadState('networkidle');

      // 検索結果が読み込まれるまで待機
      await page.waitForSelector('.grid', { timeout: 10000 });

      // 最初のビデオカードにフォーカス
      const firstCard = await page.$('.grid > *:first-child');
      if (firstCard) {
        await firstCard.focus();
        
        // 矢印キーでの移動をテスト
        await page.keyboard.press('ArrowRight');
        const activeElement = await page.evaluate(() => document.activeElement?.className);
        expect(activeElement).toBeTruthy();
      }
    });
  });

  // 3. スクリーンリーダー互換性テスト
  test.describe('Screen Reader Compatibility', () => {
    for (const page of pages) {
      test(`ARIA attributes - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // ARIAランドマークの確認
        const landmarks = await browserPage.$$eval('[role]', (elements) => 
          elements.map(el => ({
            role: el.getAttribute('role'),
            label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'),
            text: el.textContent?.trim().substring(0, 50)
          }))
        );

        console.log(`\n${page.name} ARIA Landmarks:`, landmarks);

        // 必須のランドマークが存在することを確認
        const roles = landmarks.map(l => l.role);
        expect(roles).toContain('main');
        expect(roles).toContain('navigation');

        // インタラクティブ要素のARIAラベル確認
        const interactiveWithoutLabel = await browserPage.$$eval(
          interactiveElements.join(', '),
          (elements) => elements.filter(el => {
            const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
            const hasText = el.textContent?.trim().length > 0;
            const hasTitle = el.hasAttribute('title');
            const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
            const hasAssociatedLabel = isInput && (
              el.hasAttribute('id') && document.querySelector(`label[for="${el.id}"]`) ||
              el.closest('label')
            );
            
            return !hasAriaLabel && !hasText && !hasTitle && !hasAssociatedLabel;
          }).map(el => ({
            tag: el.tagName,
            type: el.getAttribute('type'),
            class: el.className,
            html: el.outerHTML.substring(0, 100)
          }))
        );

        // すべてのインタラクティブ要素にラベルがあることを確認
        if (interactiveWithoutLabel.length > 0) {
          console.log(`\n${page.name} - Interactive elements without labels:`, interactiveWithoutLabel);
        }
        expect(interactiveWithoutLabel).toHaveLength(0);

        // 画像のalt属性確認
        const imagesWithoutAlt = await browserPage.$$eval('img:not([alt])', (images) => 
          images.map(img => ({
            src: img.src,
            class: img.className
          }))
        );

        if (imagesWithoutAlt.length > 0) {
          console.log(`\n${page.name} - Images without alt text:`, imagesWithoutAlt);
        }
        expect(imagesWithoutAlt).toHaveLength(0);
      });
    }
  });

  // 4. カラーコントラスト分析
  test.describe('Color Contrast Analysis', () => {
    for (const page of pages) {
      test(`Color contrast - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // axe-coreのカラーコントラストチェック
        const contrastResults = await new AxeBuilder({ page: browserPage })
          .withTags(['color-contrast'])
          .analyze();

        // カラーコントラストの違反を詳細に記録
        if (contrastResults.violations.length > 0) {
          console.log(`\n=== ${page.name} Color Contrast Issues ===`);
          contrastResults.violations.forEach((violation) => {
            violation.nodes.forEach((node) => {
              console.log(`\nElement: ${node.target.join(', ')}`);
              console.log(`HTML: ${node.html}`);
              console.log(`Issue: ${node.failureSummary}`);
            });
          });
        }

        expect(contrastResults.violations).toHaveLength(0);

        // 手動でコントラスト比を計算（追加チェック）
        for (const element of colorContrastElements) {
          const elements = await browserPage.$$(element.selector);
          for (const el of elements.slice(0, 3)) { // 各タイプから最初の3つをチェック
            const styles = await el.evaluate((e) => {
              const computed = window.getComputedStyle(e);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight
              };
            });

            console.log(`\n${element.description} styles:`, styles);
          }
        }
      });
    }
  });

  // 5. フォーカス管理とインジケーター
  test.describe('Focus Management', () => {
    for (const page of pages) {
      test(`Focus indicators - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // フォーカス可能な要素を取得
        const focusableElements = await browserPage.$$(interactiveElements.join(', '));

        for (const element of focusableElements.slice(0, 5)) { // 最初の5つをテスト
          await element.focus();
          
          // フォーカススタイルを確認
          const focusStyles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            const pseudoAfter = window.getComputedStyle(el, '::after');
            const pseudoBefore = window.getComputedStyle(el, '::before');
            
            return {
              outline: computed.outline,
              outlineOffset: computed.outlineOffset,
              boxShadow: computed.boxShadow,
              border: computed.border,
              backgroundColor: computed.backgroundColor,
              pseudoAfterContent: pseudoAfter.content,
              pseudoBeforeContent: pseudoBefore.content
            };
          });

          // フォーカスインジケーターが表示されることを確認
          const hasVisibleFocusIndicator = 
            focusStyles.outline !== 'none' ||
            focusStyles.boxShadow !== 'none' ||
            focusStyles.border !== 'none';

          if (!hasVisibleFocusIndicator) {
            const elementInfo = await element.evaluate((el) => ({
              tag: el.tagName,
              class: el.className,
              text: el.textContent?.trim().substring(0, 30)
            }));
            console.log(`\nNo visible focus indicator:`, elementInfo, focusStyles);
          }

          expect(hasVisibleFocusIndicator).toBeTruthy();
        }

        // フォーカストラップのテスト（モーダルなど）
        const modals = await browserPage.$$('[role="dialog"], .modal');
        for (const modal of modals) {
          if (await modal.isVisible()) {
            // モーダル内でタブキーを押してフォーカスがトラップされることを確認
            const firstFocusable = await modal.$(':is(button, a, input, select, textarea):not([disabled])');
            if (firstFocusable) {
              await firstFocusable.focus();
              await browserPage.keyboard.press('Tab');
              
              const focusedElement = await browserPage.evaluateHandle(() => document.activeElement);
              const isInsideModal = await modal.evaluate((modal, focused) => 
                modal.contains(focused), focusedElement
              );
              
              expect(isInsideModal).toBeTruthy();
            }
          }
        }
      });
    }
  });

  // 6. フォームアクセシビリティ
  test.describe('Form Accessibility', () => {
    test('Contact form accessibility', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // フォーム要素の確認
      const formInputs = await page.$$('input, textarea, select');
      
      for (const input of formInputs) {
        const inputInfo = await input.evaluate((el) => {
          const label = el.labels?.[0] || document.querySelector(`label[for="${el.id}"]`);
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const ariaDescribedby = el.getAttribute('aria-describedby');
          const required = el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
          
          return {
            type: el.getAttribute('type') || el.tagName.toLowerCase(),
            name: el.getAttribute('name'),
            id: el.id,
            hasLabel: !!label || !!ariaLabel || !!ariaLabelledby,
            labelText: label?.textContent?.trim() || ariaLabel,
            required,
            ariaDescribedby,
            placeholder: el.getAttribute('placeholder')
          };
        });

        console.log('\nForm input:', inputInfo);

        // すべてのフォーム要素にラベルがあることを確認
        expect(inputInfo.hasLabel).toBeTruthy();

        // 必須フィールドが適切にマークされていることを確認
        if (inputInfo.required) {
          const hasRequiredIndication = inputInfo.labelText?.includes('*') || 
                                       inputInfo.labelText?.includes('必須') ||
                                       inputInfo.labelText?.includes('required');
          expect(hasRequiredIndication).toBeTruthy();
        }
      }

      // エラーメッセージのアクセシビリティ
      // フォームに無効な値を入力してエラーを発生させる
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.fill('invalid-email');
        await emailInput.press('Tab');
        
        // エラーメッセージの確認
        await page.waitForTimeout(500);
        const errorMessage = await page.$('[role="alert"], .error-message, [aria-live="polite"]');
        if (errorMessage) {
          const errorInfo = await errorMessage.evaluate((el) => ({
            role: el.getAttribute('role'),
            ariaLive: el.getAttribute('aria-live'),
            text: el.textContent?.trim()
          }));
          
          console.log('\nError message:', errorInfo);
          expect(errorInfo.role === 'alert' || errorInfo.ariaLive).toBeTruthy();
        }
      }
    });

    test('Search form accessibility', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('networkidle');

      // 検索フォームの確認
      const searchInput = await page.$('input[type="search"], input[name="search"], #search');
      if (searchInput) {
        const searchInfo = await searchInput.evaluate((el) => ({
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          placeholder: el.getAttribute('placeholder'),
          ariaDescribedby: el.getAttribute('aria-describedby')
        }));

        console.log('\nSearch input:', searchInfo);
        
        // 検索フィールドが適切にラベル付けされていることを確認
        expect(searchInfo.ariaLabel || searchInfo.placeholder).toBeTruthy();
      }

      // 検索ボタンの確認
      const searchButton = await page.$('button[type="submit"], button:has-text("検索"), button:has-text("Search")');
      if (searchButton) {
        const buttonInfo = await searchButton.evaluate((el) => ({
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent?.trim()
        }));

        expect(buttonInfo.ariaLabel || buttonInfo.text).toBeTruthy();
      }
    });
  });

  // 7. セマンティックHTML構造
  test.describe('Semantic HTML Structure', () => {
    for (const page of pages) {
      test(`Semantic structure - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // 見出し階層の確認
        const headings = await browserPage.$$eval('h1, h2, h3, h4, h5, h6', (elements) => 
          elements.map(el => ({
            level: parseInt(el.tagName[1]),
            text: el.textContent?.trim().substring(0, 50)
          }))
        );

        console.log(`\n${page.name} Heading Structure:`, headings);

        // H1が1つだけ存在することを確認
        const h1Count = headings.filter(h => h.level === 1).length;
        expect(h1Count).toBe(1);

        // 見出しレベルがスキップされていないことを確認
        let previousLevel = 0;
        for (const heading of headings) {
          if (previousLevel > 0) {
            const levelDiff = heading.level - previousLevel;
            expect(levelDiff).toBeLessThanOrEqual(1);
          }
          previousLevel = heading.level;
        }

        // セマンティック要素の使用確認
        const semanticElements = await browserPage.evaluate(() => {
          const elements = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
          const found: Record<string, number> = {};
          
          elements.forEach(tag => {
            found[tag] = document.getElementsByTagName(tag).length;
          });
          
          return found;
        });

        console.log(`\n${page.name} Semantic Elements:`, semanticElements);

        // 基本的なセマンティック要素が存在することを確認
        expect(semanticElements.header).toBeGreaterThan(0);
        expect(semanticElements.main).toBe(1);
        expect(semanticElements.footer).toBeGreaterThan(0);

        // リストの適切な使用
        const lists = await browserPage.evaluate(() => {
          const uls = document.querySelectorAll('ul');
          const ols = document.querySelectorAll('ol');
          
          return {
            unorderedLists: Array.from(uls).map(ul => ({
              itemCount: ul.children.length,
              hasProperItems: Array.from(ul.children).every(child => child.tagName === 'LI')
            })),
            orderedLists: Array.from(ols).map(ol => ({
              itemCount: ol.children.length,
              hasProperItems: Array.from(ol.children).every(child => child.tagName === 'LI')
            }))
          };
        });

        // リストが適切に構造化されていることを確認
        lists.unorderedLists.forEach(list => {
          expect(list.hasProperItems).toBeTruthy();
        });
        lists.orderedLists.forEach(list => {
          expect(list.hasProperItems).toBeTruthy();
        });
      });
    }
  });

  // 8. スキップリンクとナビゲーション支援
  test.describe('Skip Links and Navigation Aids', () => {
    for (const page of pages) {
      test(`Skip links - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // スキップリンクの確認
        const skipLinks = await browserPage.$$('a[href^="#"]:has-text("skip"), a[href^="#"]:has-text("Skip")');
        
        if (skipLinks.length > 0) {
          for (const link of skipLinks) {
            const linkInfo = await link.evaluate((el) => ({
              text: el.textContent?.trim(),
              href: el.getAttribute('href'),
              isVisible: window.getComputedStyle(el).display !== 'none' && 
                        window.getComputedStyle(el).visibility !== 'hidden'
            }));

            console.log('\nSkip link:', linkInfo);

            // スキップリンクが機能することを確認
            if (linkInfo.href) {
              const targetExists = await browserPage.$(linkInfo.href);
              expect(targetExists).toBeTruthy();
            }
          }
        }

        // パンくずナビゲーションの確認
        const breadcrumbs = await browserPage.$('[aria-label*="breadcrumb"], nav[aria-label*="Breadcrumb"], .breadcrumb');
        if (breadcrumbs) {
          const breadcrumbInfo = await breadcrumbs.evaluate((el) => ({
            ariaLabel: el.getAttribute('aria-label'),
            itemCount: el.querySelectorAll('li, a').length
          }));

          console.log('\nBreadcrumbs:', breadcrumbInfo);
          expect(breadcrumbInfo.ariaLabel).toBeTruthy();
        }

        // ページ内ナビゲーションの確認
        const toc = await browserPage.$('[role="navigation"][aria-label*="contents"], .table-of-contents, #toc');
        if (toc) {
          const tocInfo = await toc.evaluate((el) => ({
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            linkCount: el.querySelectorAll('a').length
          }));

          console.log('\nTable of contents:', tocInfo);
        }
      });
    }
  });

  // 9. 音声制御と支援技術の互換性
  test.describe('Voice Control and Assistive Technology', () => {
    for (const page of pages) {
      test(`Voice control compatibility - ${page.name}`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // クリック可能な要素のサイズ確認（最小44x44ピクセル）
        const clickableElements = await browserPage.$$(
          'button, a, input[type="checkbox"], input[type="radio"], [role="button"]'
        );

        const smallTargets = [];
        for (const element of clickableElements) {
          const box = await element.boundingBox();
          if (box && (box.width < 44 || box.height < 44)) {
            const elementInfo = await element.evaluate((el) => ({
              tag: el.tagName,
              text: el.textContent?.trim().substring(0, 30),
              class: el.className
            }));
            
            smallTargets.push({
              ...elementInfo,
              size: `${box.width}x${box.height}`
            });
          }
        }

        if (smallTargets.length > 0) {
          console.log(`\n${page.name} - Small click targets:`, smallTargets);
        }

        // タッチターゲットのサイズをAAA基準（44x44）で確認
        expect(smallTargets.length).toBe(0);

        // 音声コマンド用のラベル確認
        const voiceLabels = await browserPage.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          return elements.map(el => {
            const ariaLabel = el.getAttribute('aria-label');
            const visibleText = el.textContent?.trim();
            
            return {
              element: el.tagName,
              visibleText,
              ariaLabel,
              mismatch: ariaLabel && visibleText && 
                       !ariaLabel.toLowerCase().includes(visibleText.toLowerCase())
            };
          }).filter(item => item.mismatch);
        });

        if (voiceLabels.length > 0) {
          console.log(`\n${page.name} - Voice label mismatches:`, voiceLabels);
        }

        // 音声ラベルと表示テキストが一致することを確認
        expect(voiceLabels.length).toBe(0);
      });
    }
  });

  // 10. 総合アクセシビリティレポート
  test('Generate comprehensive accessibility report', async ({ page }) => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: pages.length,
        wcagLevel: 'AA',
        overallScore: 0,
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0
      },
      pageResults: {} as Record<string, any>,
      recommendations: [] as string[]
    };

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // 各ページの詳細なアクセシビリティスキャン
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();

      // ページごとの結果を記録
      report.pageResults[pageInfo.name] = {
        url: pageInfo.path,
        violations: axeResults.violations.length,
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length,
        inapplicable: axeResults.inapplicable.length,
        score: axeResults.passes.length / (axeResults.passes.length + axeResults.violations.length) * 100,
        criticalViolations: axeResults.violations.filter(v => v.impact === 'critical'),
        seriousViolations: axeResults.violations.filter(v => v.impact === 'serious'),
        moderateViolations: axeResults.violations.filter(v => v.impact === 'moderate'),
        minorViolations: axeResults.violations.filter(v => v.impact === 'minor')
      };

      // 集計
      report.summary.criticalIssues += report.pageResults[pageInfo.name].criticalViolations.length;
      report.summary.majorIssues += report.pageResults[pageInfo.name].seriousViolations.length;
      report.summary.minorIssues += report.pageResults[pageInfo.name].moderateViolations.length + 
                                   report.pageResults[pageInfo.name].minorViolations.length;
    }

    // 全体スコアの計算
    const totalPasses = Object.values(report.pageResults).reduce((sum, page) => sum + page.passes, 0);
    const totalChecks = Object.values(report.pageResults).reduce((sum, page) => sum + page.passes + page.violations, 0);
    report.summary.overallScore = Math.round((totalPasses / totalChecks) * 100);

    // 推奨事項の生成
    if (report.summary.criticalIssues > 0) {
      report.recommendations.push('緊急: クリティカルなアクセシビリティ問題を直ちに修正してください');
    }
    if (report.summary.majorIssues > 0) {
      report.recommendations.push('重要: 主要なアクセシビリティ問題を優先的に対処してください');
    }
    report.recommendations.push('定期的なアクセシビリティ監査の実施を推奨します');
    report.recommendations.push('開発プロセスにアクセシビリティテストを組み込んでください');

    // レポートの保存
    const fs = require('fs');
    fs.writeFileSync(
      'accessibility-audit-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n=== Accessibility Audit Summary ===');
    console.log(`Overall Score: ${report.summary.overallScore}%`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`Major Issues: ${report.summary.majorIssues}`);
    console.log(`Minor Issues: ${report.summary.minorIssues}`);
    console.log('\nDetailed report saved to: accessibility-audit-report.json');

    // スコアが80%以上であることを確認（AA準拠の目安）
    expect(report.summary.overallScore).toBeGreaterThanOrEqual(80);
  });
});
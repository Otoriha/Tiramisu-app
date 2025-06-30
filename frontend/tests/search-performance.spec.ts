import { test, expect } from '@playwright/test';

test.describe('Search Performance and User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('Measure search performance metrics', async ({ page }) => {
    // Navigate to search page
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    // Measure time to input focus
    const startTime = Date.now();
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.focus();
    const focusTime = Date.now() - startTime;
    
    console.log(`Time to focus search input: ${focusTime}ms`);

    // Measure search execution time
    const searchStartTime = Date.now();
    await searchInput.fill('tiramisu');
    await searchInput.press('Enter');
    
    // Wait for search results or loading state
    await page.waitForTimeout(1000);
    
    // Check for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, [data-testid="loading"], [aria-label*="loading"]');
    if (await loadingIndicators.count() > 0) {
      console.log('Loading indicator found');
      await page.waitForFunction(() => {
        const loadings = document.querySelectorAll('.loading, .spinner, [data-testid="loading"], [aria-label*="loading"]');
        return loadings.length === 0;
      }, { timeout: 30000 });
    }
    
    const searchEndTime = Date.now() - searchStartTime;
    console.log(`Total search time: ${searchEndTime}ms`);

    // Take screenshot of results
    await page.screenshot({ path: 'screenshots/performance-search-results.png', fullPage: true });

    // Check if results are displayed
    const videoCards = page.locator('[data-testid="video-item"], .video-card, .grid > div');
    const resultsCount = await videoCards.count();
    console.log(`Number of search results: ${resultsCount}`);

    // Performance assertions
    expect(focusTime).toBeLessThan(1000);
    expect(searchEndTime).toBeLessThan(15000);
  });

  test('Test API error handling', async ({ page }) => {
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    // Intercept API calls and simulate error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill('test error');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Check for error message
    const errorMessage = page.locator('.error, .alert-error, [data-testid="error"], [role="alert"]');
    if (await errorMessage.count() > 0) {
      console.log('Error message displayed correctly');
      await page.screenshot({ path: 'screenshots/api-error-handling.png', fullPage: true });
    }
  });

  test('Test responsive design on different screen sizes', async ({ page }) => {
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'screenshots/mobile-search-view.png', fullPage: true });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/tablet-search-view.png', fullPage: true });

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'screenshots/desktop-search-view.png', fullPage: true });

    // Test search functionality on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill('mobile search test');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/mobile-search-results.png', fullPage: true });
  });

  test('Test search input validation and edge cases', async ({ page }) => {
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    // Test very long search query
    const longQuery = 'a'.repeat(500);
    await searchInput.fill(longQuery);
    await page.waitForTimeout(1000);
    
    const inputValue = await searchInput.inputValue();
    console.log(`Long query input length: ${inputValue.length}`);
    
    // Test special characters
    await searchInput.clear();
    await searchInput.fill('!@#$%^&*()_+{}[]|\\:";\'<>?,./-~`');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/special-chars-search.png', fullPage: true });

    // Test Unicode characters
    await searchInput.clear();
    await searchInput.fill('ティラミス 🍰 レシピ');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/unicode-search.png', fullPage: true });
  });

  test('Test search suggestions and autocomplete', async ({ page }) => {
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    // Look for search suggestions
    const suggestionButtons = page.locator('button:has-text("ティラミス"), button:has-text("レシピ"), button:has-text("作り方")');
    
    if (await suggestionButtons.count() > 0) {
      console.log(`Found ${await suggestionButtons.count()} suggestion buttons`);
      await page.screenshot({ path: 'screenshots/search-suggestions.png', fullPage: true });
      
      // Click on first suggestion
      await suggestionButtons.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/suggestion-clicked.png', fullPage: true });
    }
  });

  test('Test search history and URL synchronization', async ({ page }) => {
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    
    // Test URL synchronization
    await searchInput.fill('test query');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Current URL after search: ${currentUrl}`);
    
    // Check if query parameter is in URL
    const urlContainsQuery = currentUrl.includes('test query') || currentUrl.includes('q=');
    console.log(`URL contains query parameter: ${urlContainsQuery}`);
    
    // Test browser back/forward
    await page.goBack();
    await page.waitForTimeout(1000);
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // Check if search state is maintained
    const inputValue = await searchInput.inputValue();
    console.log(`Input value after navigation: ${inputValue}`);
  });

  test('Test accessibility features', async ({ page }) => {
    const searchPageLink = page.locator('a[href*="search"], a:has-text("Search"), a:has-text("検索")').first();
    
    if (await searchPageLink.isVisible()) {
      await searchPageLink.click();
    }

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if search input is focusable
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeFocused();
    
    // Test ARIA labels
    const ariaLabel = await searchInput.getAttribute('aria-label');
    console.log(`Search input ARIA label: ${ariaLabel}`);
    
    // Test screen reader announcements
    await searchInput.fill('accessibility test');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Check for loading announcements
    const loadingAnnouncement = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    if (await loadingAnnouncement.count() > 0) {
      console.log('Loading announcement found for screen readers');
    }
    
    await page.screenshot({ path: 'screenshots/accessibility-test.png', fullPage: true });
  });
});
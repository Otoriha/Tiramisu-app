import { test, expect, Page } from '@playwright/test';

test.describe('Tiramisu App Search Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:5174');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Navigate to search page and verify search functionality', async () => {
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });

    // Look for search input or navigation to search page
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    const searchButton = page.locator('button:has-text("Search"), button:has-text("検索")').first();
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();

    // Try to navigate to search page if not already there
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/02-search-page.png', fullPage: true });
    }

    // Verify search elements are present
    const finalSearchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await expect(finalSearchInput).toBeVisible();
  });

  test('Test YouTube search with tiramisu recipe', async () => {
    // Navigate to search page if needed
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await searchInput.fill('tiramisu recipe');

    // Submit search
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/03-tiramisu-search-results.png', fullPage: true });

    // Check if results are displayed
    const resultElements = page.locator('[data-testid="video-item"], .video-card, .search-result');
    if (await resultElements.count() > 0) {
      console.log(`Found ${await resultElements.count()} search results for "tiramisu recipe"`);
    }
  });

  test('Test search with dessert making', async () => {
    // Navigate to search page if needed
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await searchInput.fill('dessert making');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/04-dessert-search-results.png', fullPage: true });
  });

  test('Test edge cases - empty search', async () => {
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await searchInput.fill('');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/05-empty-search.png', fullPage: true });
  });

  test('Test edge cases - very long search term', async () => {
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    const longSearchTerm = 'very long search term that should test the input handling and API limits for search functionality in the application';
    await searchInput.fill(longSearchTerm);
    await searchInput.press('Enter');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/06-long-search-term.png', fullPage: true });
  });

  test('Test edge cases - special characters', async () => {
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await searchInput.fill('tiramisu @#$%^&*()');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/07-special-characters-search.png', fullPage: true });
  });

  test('Test search result interactions', async () => {
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await searchInput.fill('tiramisu');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(3000);

    // Try to click on first search result
    const firstResult = page.locator('[data-testid="video-item"], .video-card, .search-result').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/08-clicked-search-result.png', fullPage: true });
    }
  });

  test('Check for loading states and error handling', async () => {
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]').first();
    await searchInput.fill('test search');
    
    // Check for loading state immediately after search
    await searchInput.press('Enter');
    
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, [data-testid="loading"]');
    if (await loadingIndicators.count() > 0) {
      await page.screenshot({ path: 'screenshots/09-loading-state.png', fullPage: true });
    }
    
    await page.waitForTimeout(3000);
    
    // Check for error messages
    const errorMessages = page.locator('.error, .alert-error, [data-testid="error"]');
    if (await errorMessages.count() > 0) {
      await page.screenshot({ path: 'screenshots/10-error-state.png', fullPage: true });
    }
  });

  test('Test search filters and tags if available', async () => {
    const searchLink = page.locator('a:has-text("Search"), a:has-text("検索")').first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Look for filter buttons, tags, or categories
    const filters = page.locator('.filter, .tag, .category, [data-testid="filter"]');
    const filterButtons = page.locator('button:has-text("Filter"), button:has-text("フィルター")');
    
    if (await filters.count() > 0 || await filterButtons.count() > 0) {
      await page.screenshot({ path: 'screenshots/11-search-filters.png', fullPage: true });
      
      // Try to interact with filters if they exist
      if (await filterButtons.first().isVisible()) {
        await filterButtons.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/12-filter-interaction.png', fullPage: true });
      }
    }
  });
});
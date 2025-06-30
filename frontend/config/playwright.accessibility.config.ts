import { defineConfig, devices } from '@playwright/test';

/**
 * Accessibility testing configuration
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/accessibility.spec.ts',
  
  /* Run tests in files in parallel */
  fullyParallel: false, // アクセシビリティテストは順次実行
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: 1, // アクセシビリティテストは単一ワーカーで実行
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report-accessibility' }],
    ['json', { outputFile: 'accessibility-test-results.json' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5177',

    /* Collect trace when retrying the failed test */
    trace: 'on',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Timeout for each test */
    timeout: 60000, // アクセシビリティテストは時間がかかる可能性がある
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // アクセシビリティテスト用の追加設定
        viewport: { width: 1280, height: 720 },
        hasTouch: false,
        isMobile: false,
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
        isMobile: true,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
import { defineConfig, devices } from '@playwright/test';

const webServerCommand = process.env.E2E_WEB_SERVER_CMD;

export default defineConfig({
  testDir: './e2e/parity',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'playwright-results.json' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8000',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(webServerCommand
    ? {
        webServer: {
          command: webServerCommand,
          url: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8000',
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
      }
    : {}),
});

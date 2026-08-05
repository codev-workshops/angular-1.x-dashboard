import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    actionTimeout: 15000,
    expect: { timeout: 15000 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

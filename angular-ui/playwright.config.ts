import { defineConfig } from '@playwright/test';

const isWindows = process.platform === 'win32';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: isWindows
      ? 'npm.cmd run start -- --host localhost --port 4200'
      : 'npm run start -- --host localhost --port 4200',
    url: 'http://localhost:4200/login',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
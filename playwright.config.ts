import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './Tests/specs',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    slowMo: 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};

export default config;

import 'dotenv/config';
import { defineConfig } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';


// Minimal .env loader (avoids adding the `dotenv` dependency).
try {
  const envPath = resolve(process.cwd(), '.env');
  const envContents = readFileSync(envPath, 'utf8');
  envContents.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
  });
} catch (e) {
  // ignore missing .env
}

const config: PlaywrightTestConfig = {
  testDir: './Tests/specs',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: !!process.env.CI,
    baseURL: process.env.BASE_URL ?? 'https://dev.jrnl.com',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: 2000,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};

export default config;

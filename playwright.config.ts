import { defineConfig, devices } from '@playwright/test'
import { BASE_PATH } from './app.config.ts'

// End-to-end tests run against the production build, because the service
// worker only exists there (it is off in `pnpm dev`). Same base path as
// GitHub Pages, so paths and the worker scope match the live site.
const PORT = 4173
const baseURL = `http://localhost:${PORT}${BASE_PATH}`

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Kept low on purpose: laptops running this are often small. Pass
  // --workers=N to override.
  workers: 2,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    locale: 'fa-IR',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})

import { expect, type Page } from '@playwright/test'

/**
 * Opens the app and waits until the service worker has precached it and
 * controls the page, the state a user is in after their first visit.
 */
export async function installApp(page: Page): Promise<void> {
  await page.goto('./')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
}

/** Fills and saves the new-note form (Persian UI), then waits for the list. */
export async function addNote(page: Page, title: string, body?: string): Promise<void> {
  await page.goto('./#/add')
  await page.getByLabel('عنوان').fill(title)
  if (body) await page.getByLabel(/متن/).fill(body)
  await page.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByRole('heading', { name: 'خشت' })).toBeVisible()
}

/** The note buttons on the home page, in display order. */
export const noteItems = (page: Page) => page.locator('main ul button')

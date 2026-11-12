import { expect, test } from '@playwright/test'
import { APP_ID } from '../../app.config.ts'
import { addNote, noteItems } from './helpers.ts'

test('a JSON backup restores into a fresh browser', async ({ page, browser }, testInfo) => {
  await page.goto('./')
  await addNote(page, 'خرید هفته', 'نان و پنیر')
  await addNote(page, 'Call Sara 12:30')

  await page.goto('./#/settings')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /ذخیره فایل پشتیبان/ }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(new RegExp(`^${APP_ID}-backup-\\d{4}-\\d{2}-\\d{2}\\.json$`))
  const file = testInfo.outputPath('backup.json')
  await download.saveAs(file)

  // A second, empty browser profile stands in for a new phone. A context
  // made by hand does not inherit the config, so pass the base URL along.
  const fresh = await browser.newContext({ locale: 'fa-IR', baseURL: testInfo.project.use.baseURL })
  const other = await fresh.newPage()
  await other.goto('./#/settings')
  await other.locator('input[type=file]').setInputFiles(file)
  await expect(other.locator('p[role=status]')).toContainText('۲ جدید')

  // Restoring the same file again adds nothing.
  await other.locator('input[type=file]').setInputFiles(file)
  await expect(other.locator('p[role=status]')).toContainText('۲ بدون تغییر')

  await other.goto('./')
  await expect(noteItems(other)).toHaveCount(2)
  await expect(other.getByText('نان و پنیر')).toBeVisible()
  await fresh.close()
})

test('a damaged backup file changes nothing', async ({ page }) => {
  await page.goto('./')
  await addNote(page, 'سالم')
  await page.goto('./#/settings')
  await page.locator('input[type=file]').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from(`{"app":"${APP_ID}","no`),
  })
  await expect(page.locator('p[role=status]')).toContainText('دست نخورده')

  await page.goto('./')
  await expect(noteItems(page)).toHaveCount(1)
  await expect(page.getByText('سالم')).toBeVisible()
})

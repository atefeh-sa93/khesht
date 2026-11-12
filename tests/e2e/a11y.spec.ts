import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { APP_ID } from '../../app.config.ts'
import { addNote, noteItems } from './helpers.ts'

// Every screen, in both languages, checked against WCAG 2.1 A and AA plus
// axe best practices. Any violation fails, not only serious ones, so small
// problems can't pile up below the bar.
async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()
  const found = violations.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)
  expect(found).toEqual([])
}

const labels = {
  fa: { save: 'ذخیره', otherDay: 'روز دیگر', delete: 'حذف' },
  en: { save: 'Save', otherDay: 'Other day', delete: 'Delete' },
}

for (const locale of ['fa', 'en'] as const) {
  test.describe(locale, () => {
    const l = labels[locale]

    // The add helper speaks Persian, so data goes in first, then the language switches.
    async function open(page: Page, withData: boolean) {
      await page.goto('./')
      if (withData) {
        await addNote(page, 'خرید هفته', 'نان و پنیر')
        await addNote(page, 'Call Sara 12:30')
      }
      if (locale === 'en') await page.getByRole('button', { name: /Switch to English/ }).click()
    }

    test('empty home page', async ({ page }) => {
      await open(page, false)
      await audit(page)
    })

    test('home page with notes, and the undo toast', async ({ page }) => {
      await open(page, true)
      await audit(page)
      await noteItems(page).first().click()
      await page.getByRole('button', { name: l.delete }).click()
      await expect(page.locator('[role=status] button')).toBeVisible()
      await audit(page)
    })

    test('new note form, empty and with an error', async ({ page }) => {
      await open(page, false)
      await page.goto('./#/add')
      await audit(page)
      await page.getByRole('button', { name: l.save }).click()
      await expect(page.locator('[aria-invalid=true]')).toBeVisible()
      await audit(page)
    })

    test('edit form with the date selects open', async ({ page }) => {
      await open(page, true)
      await noteItems(page).first().click()
      await page.getByRole('button', { name: l.otherDay }).click()
      await expect(page.getByRole('combobox')).toHaveCount(3)
      await audit(page)
    })

    test('settings, with a restore result and a restore error', async ({ page }) => {
      await open(page, false)
      await page.goto('./#/settings')
      await audit(page)
      const file = page.locator('input[type=file]')
      const status = page.locator('p[role=status]')
      await file.setInputFiles({
        name: 'backup.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({ app: APP_ID, version: 1, exportedAt: '', notes: [] })),
      })
      await expect(status).not.toBeEmpty()
      await audit(page)
      await file.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{') })
      await expect(status.locator('.text-danger-text')).toBeVisible()
      await audit(page)
    })

    test('not found page', async ({ page }) => {
      await open(page, false)
      await page.goto('./#/nope')
      await audit(page)
    })

    test('offline badge', async ({ page, context }) => {
      await open(page, false)
      await context.setOffline(true)
      await expect(page.locator('header [role=status] > span')).toBeVisible()
      await audit(page)
      await context.setOffline(false)
    })
  })
}

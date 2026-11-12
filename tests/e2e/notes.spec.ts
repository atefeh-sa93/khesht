import { expect, test } from '@playwright/test'
import { addNote, noteItems } from './helpers.ts'

test('an empty home page leads to the first note', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByText('هنوز یادداشتی ننوشته‌ای.')).toBeVisible()
  await page.getByRole('button', { name: 'نوشتن اولین یادداشت' }).click()
  await expect(page).toHaveURL(/#\/add$/)
  await expect(page.getByRole('heading', { name: 'یادداشت جدید' })).toBeVisible()
})

test('a note needs a title', async ({ page }) => {
  await page.goto('./#/add')
  await page.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByText('یک عنوان بنویس.')).toBeVisible()
  await expect(page.getByLabel('عنوان')).toBeFocused()
  await expect(page.getByLabel('عنوان')).toHaveAttribute('aria-invalid', 'true')
})

test('adds, edits and lists notes newest first, under today', async ({ page }) => {
  await page.goto('./')
  await addNote(page, 'اول')
  await addNote(page, 'دوم', 'متن دوم')
  await expect(page.getByRole('heading', { level: 2 })).toContainText('امروز')
  await expect(noteItems(page)).toHaveCount(2)
  await expect(noteItems(page).first()).toContainText('دوم')

  await noteItems(page).first().click()
  await expect(page.getByRole('heading', { name: 'ویرایش یادداشت' })).toBeVisible()
  await expect(page.getByLabel(/متن/)).toHaveValue('متن دوم')
  await page.getByLabel('عنوان').fill('دوم ویرایش‌شده')
  await page.getByRole('button', { name: 'ذخیره' }).click()
  await expect(noteItems(page).first()).toContainText('دوم ویرایش‌شده')
})

test('deletes a note and brings it back with undo', async ({ page }) => {
  await page.goto('./')
  await addNote(page, 'پاک‌شدنی')
  await noteItems(page).first().click()
  await page.getByRole('button', { name: 'حذف' }).click()

  await expect(page.getByText('یادداشت حذف شد')).toBeVisible()
  await expect(page.getByText('پاک‌شدنی')).toBeHidden()
  await page.getByRole('button', { name: 'برگرداندن' }).click()
  await expect(page.getByText('پاک‌شدنی')).toBeVisible()
})

test('picks another day in the Jalali calendar', async ({ page }) => {
  // A fixed "today" (21 Aban 1405), so the year list and the labels below
  // stay the same whenever the test runs.
  await page.clock.setFixedTime(new Date('2026-11-12T10:00:00'))
  await page.goto('./#/add')
  await page.getByLabel('عنوان').fill('مهرماه')
  await page.getByRole('button', { name: 'روز دیگر' }).click()
  await page.getByRole('combobox', { name: 'ماه' }).selectOption({ label: 'مهر' })
  await page.getByRole('combobox', { name: 'روز' }).selectOption({ label: '۵' })
  await page.getByRole('combobox', { name: 'سال' }).selectOption({ label: '۱۴۰۴' })
  await page.getByRole('button', { name: 'ذخیره' }).click()

  // 5 Mehr 1404 is Saturday 27 September 2025; another year, so it is shown.
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('شنبه ۵ مهر ۱۴۰۴')
})

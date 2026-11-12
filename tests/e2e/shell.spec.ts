import { expect, test } from '@playwright/test'

test('the bottom navigation moves between tabs', async ({ page }) => {
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: 'ناوبری اصلی' })
  await expect(nav.getByRole('link', { name: 'خانه' })).toHaveAttribute('aria-current', 'page')

  await nav.getByRole('link', { name: 'تنظیمات' }).click()
  await expect(page).toHaveURL(/#\/settings$/)
  await expect(page.getByRole('heading', { name: 'تنظیمات' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'تنظیمات' })).toHaveAttribute('aria-current', 'page')
})

test('an unknown address shows not found, without the navigation', async ({ page }) => {
  await page.goto('./#/nope')
  await expect(page.getByRole('heading', { name: 'این صفحه پیدا نشد.' })).toBeVisible()
  await expect(page.getByRole('navigation')).toHaveCount(0)
  await page.getByRole('link', { name: 'برگشت به خانه' }).click()
  await expect(page).toHaveURL(/#\/$/)
})

test('language and calendar change from settings and are remembered', async ({ page }) => {
  await page.goto('./#/settings')
  await page.getByText('English', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await page.getByText('Gregorian', { exact: true }).click()

  await page.reload()
  await expect(page.getByRole('radio', { name: /English/ })).toBeChecked()
  await expect(page.getByRole('radio', { name: /Gregorian/ })).toBeChecked()

  await page.goto('./')
  await expect(page.getByText("You haven't written any notes yet.")).toBeVisible()
})

test('the version is shown in settings', async ({ page }) => {
  await page.goto('./#/settings')
  await expect(page.getByText(/^نسخه/)).toContainText(/\S+ · \d{4}-\d{2}-\d{2}/)
})

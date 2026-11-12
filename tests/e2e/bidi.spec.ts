import { expect, test, type Locator } from '@playwright/test'

// Checks real layout, which unit tests cannot: in right-to-left text each
// number in <Nums> must sit where a reader expects it, not where a single
// left-to-right run would put it.

async function left(locator: Locator): Promise<number> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('not visible')
  return box.x
}

test('the title counter reads "9 of 120" from the right in Persian', async ({ page }) => {
  await page.goto('./#/add')
  await page.getByLabel('عنوان').fill('خرید هفته')
  const numbers = page.locator('[id$="title-hint"] bdi')
  await expect(numbers).toHaveText(['۹', '۱۲۰'])
  // First number on the right in RTL.
  expect(await left(numbers.nth(0))).toBeGreaterThan(await left(numbers.nth(1)))
})

test('the same counter reads from the left in English', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /Switch to English/ }).click()
  await page.goto('./#/add')
  await page.getByLabel('Title').fill('Shopping')
  const numbers = page.locator('[id$="title-hint"] bdi')
  await expect(numbers).toHaveText(['8', '120'])
  expect(await left(numbers.nth(0))).toBeLessThan(await left(numbers.nth(1)))
})

test('without isolation the browser would reverse the numbers', async ({ page }) => {
  // The reason <Nums> exists, shown in a real browser: plain "۹/۱۲۰" in an
  // RTL paragraph puts the 9 on the left.
  await page.goto('./')
  const reversed = await page.evaluate(() => {
    const p = document.createElement('p')
    p.dir = 'rtl'
    p.textContent = '۹/۱۲۰'
    document.body.append(p)
    const range = document.createRange()
    range.setStart(p.firstChild!, 0)
    range.setEnd(p.firstChild!, 1)
    const nine = range.getBoundingClientRect().left
    range.setStart(p.firstChild!, 2)
    range.setEnd(p.firstChild!, 5)
    const hundredTwenty = range.getBoundingClientRect().left
    p.remove()
    return nine < hundredTwenty
  })
  expect(reversed).toBe(true)
})

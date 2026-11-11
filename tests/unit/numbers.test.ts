import { describe, expect, it } from 'vitest'
import {
  formatDigits,
  formatNumber,
  formatPercent,
  localizeDigits,
  normalizeDigits,
  parseWholeNumber,
} from '../../src/lib/numbers.ts'

describe('normalizeDigits', () => {
  it('converts Persian and Arabic digits to Latin', () => {
    expect(normalizeDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789')
    expect(normalizeDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789')
  })

  it('leaves other characters alone', () => {
    expect(normalizeDigits('abc 12')).toBe('abc 12')
  })
})

describe('localizeDigits', () => {
  it('writes Latin and Arabic digits in Persian for fa', () => {
    expect(localizeDigits('2750000', 'fa')).toBe('۲۷۵۰۰۰۰')
    expect(localizeDigits('٤٥', 'fa')).toBe('۴۵')
  })

  it('writes Persian and Arabic digits in Latin for en', () => {
    expect(localizeDigits('۱۲٣', 'en')).toBe('123')
  })

  it('keeps separators and other characters, so the length is unchanged', () => {
    const typed = '1,250٬000 x'
    const localized = localizeDigits(typed, 'fa')
    expect(localized).toBe('۱,۲۵۰٬۰۰۰ x')
    expect(localized).toHaveLength(typed.length)
  })
})

describe('parseWholeNumber', () => {
  it.each([
    ['120000', 120000],
    ['۱۲۰۰۰۰', 120000],
    ['١٢٠٠٠٠', 120000],
    ['120,000', 120000],
    ['۱۲۰٬۰۰۰', 120000],
    ['١٢٠،٠٠٠', 120000],
    ['120 000', 120000],
    ["120'000", 120000],
    ['  ۴۵۰۰  ', 4500],
    ['۱2۳', 123],
    ['0', 0],
    ['۰۰۰', 0],
  ])('parses %j as %d', (input, expected) => {
    expect(parseWholeNumber(input)).toBe(expected)
  })

  it.each([
    ['-5000'],
    ['−5000'],
    ['-۵۰۰۰'],
    ['12.5'],
    ['۱۲٫۵'],
    ['۱۲/۵'],
    [''],
    ['   '],
    ['abc'],
    ['12a'],
    ['1e5'],
    ['9007199254740993'],
  ])('rejects %j', (input) => {
    expect(parseWholeNumber(input)).toBeNull()
  })
})

describe('formatNumber', () => {
  it('uses Persian digits and separator for fa', () => {
    expect(formatNumber(4280000, 'fa')).toBe('۴٬۲۸۰٬۰۰۰')
  })

  it('uses Latin digits and comma for en', () => {
    expect(formatNumber(4280000, 'en')).toBe('4,280,000')
  })

  it('round-trips through parseWholeNumber in both locales', () => {
    for (const locale of ['fa', 'en'] as const) {
      expect(parseWholeNumber(formatNumber(1650000, locale))).toBe(1650000)
    }
  })
})

describe('formatDigits', () => {
  it('never groups, so years read as years', () => {
    expect(formatDigits(1405, 'fa')).toBe('۱۴۰۵')
    expect(formatDigits(2026, 'en')).toBe('2026')
  })
})

describe('formatPercent', () => {
  it('rounds to a whole percent in each language', () => {
    expect(formatPercent(0.18, 'fa')).toBe('۱۸٪')
    expect(formatPercent(0.184, 'en')).toBe('18%')
  })
})

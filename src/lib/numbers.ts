import type { Locale } from './locale.ts'

// Numbers in the user's own digits. Persian users type and read Persian
// digits (۱۲۳), but phone keyboards often send Latin ones, and pasted text
// may hold Arabic ones (١٢٣). Everything is read back to Latin before parsing.

const PERSIAN_ZERO = 0x06f0
const ARABIC_ZERO = 0x0660

// Thousands separators users may type or paste: Latin comma, Arabic
// thousands separator (what fa-IR formatting outputs), Arabic comma,
// apostrophe, whitespace and the zero-width non-joiner.
const SEPARATORS = /[,٬،'\s‌]/g

// Decimal points: Latin dot, Arabic decimal separator, and slash, which
// Persian users often type as a decimal point.
const DECIMAL_POINT = /[.٫/]/

const NEGATIVE_SIGN = /^[-−]/

/** Rewrites Persian and Arabic digits as Latin ones, keeping everything else. */
export function normalizeDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const code = ch.charCodeAt(0)
    const zero = code >= PERSIAN_ZERO ? PERSIAN_ZERO : ARABIC_ZERO
    return String(code - zero)
  })
}

/**
 * Rewrites every digit in the locale's own script, keeping everything else
 * as is. Pass what the user types in a number field through this, so the
 * digits match the UI language. The length never changes, so the caret can
 * stay where it was.
 */
export function localizeDigits(input: string, locale: Locale): string {
  const latin = normalizeDigits(input)
  if (locale === 'en') return latin
  return latin.replace(/\d/g, (d) => String.fromCharCode(PERSIAN_ZERO + Number(d)))
}

/**
 * Parses a whole number the user typed. Accepts Persian, Arabic and Latin
 * digits, with or without thousands separators. Returns null for anything
 * that is not a whole number of zero or more, including decimals, negative
 * numbers and numbers too large to be exact.
 */
export function parseWholeNumber(input: string): number | null {
  const text = normalizeDigits(input.trim())
  if (NEGATIVE_SIGN.test(text) || DECIMAL_POINT.test(text)) return null

  const digits = text.replace(SEPARATORS, '')
  if (!/^\d+$/.test(digits)) return null

  const value = Number(digits)
  return Number.isSafeInteger(value) ? value : null
}

const grouped: Record<Locale, Intl.NumberFormat> = {
  fa: new Intl.NumberFormat('fa-IR'),
  en: new Intl.NumberFormat('en-US'),
}

/** Locale digits with thousands separators: "۱۲٬۵۰۰", "12,500". */
export function formatNumber(value: number, locale: Locale): string {
  return grouped[locale].format(value)
}

const ungrouped: Record<Locale, Intl.NumberFormat> = {
  fa: new Intl.NumberFormat('fa-IR', { useGrouping: false }),
  en: new Intl.NumberFormat('en-US', { useGrouping: false }),
}

/** Locale digits without separators, for years, days and ids: "۱۴۰۵". */
export function formatDigits(value: number, locale: Locale): string {
  return ungrouped[locale].format(value)
}

const percent: Record<Locale, Intl.NumberFormat> = {
  fa: new Intl.NumberFormat('fa-IR', { style: 'percent', maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 }),
}

/** A ratio as a whole percent: 0.18 as "۱۸٪" or "18%". */
export function formatPercent(ratio: number, locale: Locale): string {
  return percent[locale].format(ratio)
}

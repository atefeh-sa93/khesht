import { describe, expect, it } from 'vitest'
import { DEFAULT_CALENDAR } from '../../app.config.ts'
import { detectLocale, resolveSettings } from '../../src/app/settings.ts'
import { dirOf } from '../../src/lib/locale.ts'

describe('detectLocale', () => {
  it.each([
    [['fa-IR', 'en-US'], 'fa'],
    [['fa'], 'fa'],
    [['FA-ir'], 'fa'],
    [['en-US', 'fa-IR'], 'en'],
    [['de-DE'], 'en'],
    [[], 'en'],
  ] as const)('%j → %s', (languages, locale) => {
    expect(detectLocale(languages)).toBe(locale)
  })
})

describe('resolveSettings', () => {
  it('detects the language and uses the default calendar when nothing is saved', () => {
    expect(resolveSettings(null, ['en-GB'])).toEqual({ locale: 'en', calendar: DEFAULT_CALENDAR })
    expect(resolveSettings(null, ['fa-IR'])).toEqual({ locale: 'fa', calendar: DEFAULT_CALENDAR })
  })

  it('prefers the saved choices over the browser language and the default', () => {
    const saved = JSON.stringify({ locale: 'en', calendar: 'gregorian' })
    expect(resolveSettings(saved, ['fa-IR'])).toEqual({ locale: 'en', calendar: 'gregorian' })
  })

  it('keeps a saved calendar when only the language is missing', () => {
    expect(resolveSettings('{"calendar":"jalali"}', ['en-US'])).toEqual({ locale: 'en', calendar: 'jalali' })
  })

  it.each(['not json', '{"locale":"de","calendar":"lunar"}', '42', 'null', '[]'])('ignores bad saved value %j', (saved) => {
    expect(resolveSettings(saved, ['fa-IR'])).toEqual({ locale: 'fa', calendar: DEFAULT_CALENDAR })
  })
})

describe('dirOf', () => {
  it('is right-to-left for Persian and left-to-right for English', () => {
    expect(dirOf('fa')).toBe('rtl')
    expect(dirOf('en')).toBe('ltr')
  })
})

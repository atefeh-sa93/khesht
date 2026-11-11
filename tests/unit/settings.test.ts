import { describe, expect, it } from 'vitest'
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
  it('detects the language when nothing is saved', () => {
    expect(resolveSettings(null, ['en-GB'])).toEqual({ locale: 'en' })
    expect(resolveSettings(null, ['fa-IR'])).toEqual({ locale: 'fa' })
  })

  it('prefers the saved choice over the browser language', () => {
    expect(resolveSettings(JSON.stringify({ locale: 'en' }), ['fa-IR'])).toEqual({ locale: 'en' })
  })

  it.each(['not json', '{"locale":"de"}', '42', 'null', '[]'])('ignores bad saved value %j', (saved) => {
    expect(resolveSettings(saved, ['fa-IR'])).toEqual({ locale: 'fa' })
  })
})

describe('dirOf', () => {
  it('is right-to-left for Persian and left-to-right for English', () => {
    expect(dirOf('fa')).toBe('rtl')
    expect(dirOf('en')).toBe('ltr')
  })
})

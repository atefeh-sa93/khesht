export type Locale = 'fa' | 'en'

export type Direction = 'rtl' | 'ltr'

/** Text direction of a language: right-to-left for Persian. */
export function dirOf(locale: Locale): Direction {
  return locale === 'fa' ? 'rtl' : 'ltr'
}

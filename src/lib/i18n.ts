import type { Locale } from './locale.ts'

// UI strings, typed: a missing key in one language is a type error.
// Each feature adds its own strings here as it is built.
const strings = {
  fa: {
    appName: 'خشت',
    tagline: 'قالب شروع برای اپ‌های فارسی که بدون اینترنت هم کار می‌کنند.',
    language: 'زبان',
    // The switch is labelled in the language it switches to, so a user who
    // cannot read the current one can still find it.
    switchLanguage: 'Switch to English',
    otherLanguageShort: 'EN',
    today: 'امروز',
    mainNav: 'ناوبری اصلی',
    navHome: 'خانه',
    navSettings: 'تنظیمات',
    settingsTitle: 'تنظیمات',
    calendar: 'تقویم',
    jalali: 'شمسی',
    gregorian: 'میلادی',
    version: 'نسخه',
    notFound: 'این صفحه پیدا نشد.',
    backHome: 'برگشت به خانه',
    updateReady: 'نسخه جدید آماده است',
    reload: 'بارگذاری',
    later: 'بعداً',
    offline: 'آفلاین',
    offlineHint: 'همه‌چیز روی همین دستگاه ذخیره می‌شود',
  },
  en: {
    appName: 'Khesht',
    tagline: 'A starter for Persian apps that work without internet.',
    language: 'Language',
    switchLanguage: 'تغییر به فارسی',
    otherLanguageShort: 'فا',
    today: 'Today',
    mainNav: 'Main navigation',
    navHome: 'Home',
    navSettings: 'Settings',
    settingsTitle: 'Settings',
    calendar: 'Calendar',
    jalali: 'Jalali',
    gregorian: 'Gregorian',
    version: 'Version',
    notFound: "This page doesn't exist.",
    backHome: 'Back to home',
    updateReady: 'A new version is ready',
    reload: 'Reload',
    later: 'Later',
    offline: 'Offline',
    offlineHint: 'Everything is saved on this device',
  },
} satisfies Record<Locale, Record<string, string>>

export type StringKey = keyof (typeof strings)['fa']

export function t(locale: Locale, key: StringKey): string {
  return strings[locale][key]
}

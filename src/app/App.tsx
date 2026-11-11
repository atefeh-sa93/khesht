import { t } from '../lib/i18n.ts'
import { updateSettings, useSettings } from './settings.ts'

// Placeholder screen. The app shell with routes and settings replaces it (#8).
export default function App() {
  const { locale } = useSettings()

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-brand-800">{t(locale, 'appName')}</h1>
        <button
          type="button"
          onClick={() => updateSettings({ locale: locale === 'fa' ? 'en' : 'fa' })}
          // The visible text starts the name, so voice control users can say it.
          aria-label={`${t(locale, 'otherLanguageShort')}, ${t(locale, 'switchLanguage')}`}
          className="rounded-control border border-border-strong px-3 py-1.5 text-sm text-brand-800"
        >
          {t(locale, 'otherLanguageShort')}
        </button>
      </div>
      <p className="text-text-secondary">{t(locale, 'tagline')}</p>
    </main>
  )
}

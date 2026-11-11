import { PageHeader } from '../../app/PageHeader.tsx'
import { useSettings } from '../../app/settings.ts'
import { t } from '../../lib/i18n.ts'
import { formatDate, todayIso } from '../../lib/jalali.ts'

// Placeholder home page. The notes example (#12) takes its place.
export function HomePage() {
  const { locale, calendar } = useSettings()

  return (
    <>
      <PageHeader title={t(locale, 'appName')} />
      <p className="text-text-secondary">{t(locale, 'tagline')}</p>
      <p className="text-sm text-text-muted">
        {t(locale, 'today')}: {formatDate(todayIso(), locale, calendar)}
      </p>
    </>
  )
}

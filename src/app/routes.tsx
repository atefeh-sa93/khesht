import { Link, Route, Switch } from 'wouter'
import { HomePage } from '../features/home/HomePage.tsx'
import { SettingsPage } from '../features/settings/SettingsPage.tsx'
import { t } from '../lib/i18n.ts'
import { paths } from './navigation.ts'
import { useSettings } from './settings.ts'

/** Every screen of the app. Add a route here and, for a tab, an entry in TABS (tabs.ts). */
export function Routes() {
  const { locale } = useSettings()

  return (
    <Switch>
      <Route path={paths.home} component={HomePage} />
      <Route path={paths.settings} component={SettingsPage} />
      <Route>
        <h1 className="text-lg font-medium">{t(locale, 'notFound')}</h1>
        <Link href={paths.home} replace className="text-brand-600 underline">
          {t(locale, 'backHome')}
        </Link>
      </Route>
    </Switch>
  )
}

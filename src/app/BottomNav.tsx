import { Link, useLocation } from 'wouter'
import { t } from '../lib/i18n.ts'
import { useSettings } from './settings.ts'
import { TABS } from './tabs.ts'

export function BottomNav() {
  const { locale } = useSettings()
  const [location] = useLocation()

  return (
    <nav
      aria-label={t(locale, 'mainNav')}
      className="fixed inset-x-0 bottom-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = location === path
          return (
            <li key={path} className="flex-1">
              {/* Tabs replace the history entry, so Back leaves the app instead of cycling tabs. */}
              <Link
                href={path}
                replace
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? 'text-brand-600' : 'text-text-muted'}`}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                {t(locale, label)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

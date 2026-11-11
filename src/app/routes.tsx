import { Link, Route, Switch } from 'wouter'
import type { Note } from '../db/schema.ts'
import { NoteForm } from '../features/notes/NoteForm.tsx'
import { NoteList } from '../features/notes/NoteList.tsx'
import { SettingsPage } from '../features/settings/SettingsPage.tsx'
import { t } from '../lib/i18n.ts'
import { paths, useGoBack, useNavigate } from './navigation.ts'
import { useSettings } from './settings.ts'

interface Props {
  onDeleted: (note: Note) => void
}

/** Every screen of the app. Add a route here and, for a tab, an entry in TABS (tabs.ts). */
export function Routes({ onDeleted }: Props) {
  const { locale } = useSettings()
  const navigate = useNavigate()
  const goBack = useGoBack()

  function deletedAndBack(note: Note) {
    onDeleted(note)
    goBack()
  }

  return (
    <Switch>
      <Route path={paths.home}>
        <NoteList onAdd={() => navigate(paths.add)} onEdit={(id) => navigate(paths.edit(id))} />
      </Route>
      <Route path={paths.add}>
        <NoteForm onDone={goBack} onDeleted={deletedAndBack} />
      </Route>
      <Route path="/edit/:id">
        {(params) => <NoteForm key={params.id} noteId={params.id} onDone={goBack} onDeleted={deletedAndBack} />}
      </Route>
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

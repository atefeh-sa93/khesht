import { PageHeader } from '../../app/PageHeader.tsx'
import { useSettings } from '../../app/settings.ts'
import { t } from '../../lib/i18n.ts'
import { addDays, formatDate, todayIso } from '../../lib/jalali.ts'
import { IconNote, IconPlus } from '../../ui/icons.tsx'
import { groupByDay } from './groupByDay.ts'
import { useNotes } from './useNotes.ts'

interface Props {
  onAdd: () => void
  onEdit: (id: string) => void
}

/** The home page of the example: notes grouped by day, newest first. */
export function NoteList({ onAdd, onEdit }: Props) {
  const { locale, calendar } = useSettings()
  const notes = useNotes()
  const today = todayIso()

  function dayLabel(date: string) {
    const label = formatDate(date, locale, calendar, { year: date.slice(0, 4) !== today.slice(0, 4) })
    if (date === today) return `${t(locale, 'today')} · ${label}`
    if (date === addDays(today, -1)) return `${t(locale, 'yesterday')} · ${label}`
    return label
  }

  return (
    <>
      <PageHeader title={t(locale, 'appName')} />
      {notes === undefined ? null : notes.length === 0 ? (
        <section className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <IconNote size={48} strokeWidth={1.2} className="text-brand-400" />
          <p className="text-text-secondary">{t(locale, 'notesEmpty')}</p>
          <p className="max-w-xs text-sm text-text-muted">{t(locale, 'tagline')}</p>
          <button type="button" onClick={onAdd} className="mt-2 rounded-control bg-brand-600 px-5 py-2.5 font-medium text-white">
            {t(locale, 'writeFirstNote')}
          </button>
        </section>
      ) : (
        <div className="flex flex-col gap-4 pb-20">
          {groupByDay(notes).map((day) => (
            <section key={day.date} aria-label={dayLabel(day.date)}>
              <h2 className="text-xs text-text-secondary">{dayLabel(day.date)}</h2>
              <ul>
                {day.notes.map((note) => (
                  <li key={note.id} className="border-b border-border last:border-0">
                    <button type="button" onClick={() => onEdit(note.id)} className="block w-full py-2.5 text-start">
                      {/* dir="auto": a note typed in the other language keeps its own direction and punctuation. */}
                      <span dir="auto" className="block truncate text-sm">
                        {note.title}
                      </span>
                      {note.body && (
                        <span dir="auto" className="block truncate text-xs text-text-secondary">
                          {note.body}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <button
            type="button"
            onClick={onAdd}
            aria-label={t(locale, 'addNote')}
            className="fixed bottom-20 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg end-[max(1.5rem,calc(50vw-14rem+1.5rem))]"
          >
            <IconPlus size={26} />
          </button>
        </div>
      )}
    </>
  )
}

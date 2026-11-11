import { useLiveQuery } from 'dexie-react-hooks'
import { useId, useRef, useState, type FormEvent } from 'react'
import { useSettings } from '../../app/settings.ts'
import { db, type Note } from '../../db/schema.ts'
import { t, type StringKey } from '../../lib/i18n.ts'
import { addDays, daysInMonth, fromCalendar, monthName, toCalendar, todayIso } from '../../lib/jalali.ts'
import { formatDigits } from '../../lib/numbers.ts'
import { requestPersistence } from '../../pwa/persistStorage.ts'
import { IconTrash, IconX } from '../../ui/icons.tsx'
import { Nums } from '../../ui/Num.tsx'
import { TITLE_MAX, addNote, deleteNote, updateNote, validateNote, type NoteErrors } from './noteStore.ts'

interface Props {
  noteId?: string
  onDone: () => void
  onDeleted: (note: Note) => void
}

const ERROR_TEXT: Record<NonNullable<NoteErrors['title'] | NoteErrors['date']>, StringKey> = {
  titleMissing: 'errorTitleMissing',
  titleTooLong: 'errorTitleTooLong',
  dateInvalid: 'errorDate',
}

/** Loads the note to edit (if any), then mounts the form with its starting values. */
export function NoteForm({ noteId, onDone, onDeleted }: Props) {
  // null = new note or not found, undefined = still loading.
  const existing = useLiveQuery(async () => (noteId ? ((await db.notes.get(noteId)) ?? null) : null), [noteId])
  if (existing === undefined) return null
  return <NoteFormFields note={existing ?? undefined} onDone={onDone} onDeleted={onDeleted} />
}

interface FieldsProps {
  note?: Note
  onDone: () => void
  onDeleted: (note: Note) => void
}

function NoteFormFields({ note, onDone, onDeleted }: FieldsProps) {
  const { locale, calendar } = useSettings()
  const id = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const today = todayIso()
  const yesterday = addDays(today, -1)

  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [date, setDate] = useState(note?.date ?? today)
  const [pickOther, setPickOther] = useState(!!note && note.date !== today && note.date !== yesterday)
  const [errors, setErrors] = useState<NoteErrors>({})

  const parts = toCalendar(date, calendar)

  // Keeps the day valid when the month changes, e.g. 31 Farvardin → Esfand.
  function setDatePart(part: 'year' | 'month' | 'day', value: number) {
    const next = { ...parts, [part]: value }
    next.day = Math.min(next.day, daysInMonth(next.year, next.month, calendar))
    setDate(fromCalendar(next.year, next.month, next.day, calendar))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const input = { title, body, date }
    const found = validateNote(input)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      if (found.title) titleRef.current?.focus()
      return
    }

    if (note) await updateNote(db, note.id, input)
    else {
      await addNote(db, input)
      // Now there is data worth keeping. Not awaited: it may show a browser prompt.
      void requestPersistence()
    }
    onDone()
  }

  // No confirm dialog: deleting is instant and the list offers undo instead.
  async function remove() {
    if (!note) return
    const deleted = await deleteNote(db, note.id)
    if (deleted) onDeleted(deleted)
    else onDone()
  }

  const currentYear = toCalendar(today, calendar).year
  const years = [...new Set([parts.year, currentYear - 2, currentYear - 1, currentYear])].sort()
  const dayCount = daysInMonth(parts.year, parts.month, calendar)
  const chip = 'rounded-full border px-3 py-1.5 text-sm'
  const chipOn = 'border-brand-400 bg-brand-50 text-brand-900'
  const chipOff = 'border-border-strong'
  const field = 'w-full rounded-control border border-border-strong bg-surface px-3 py-2'

  return (
    <form onSubmit={submit} noValidate className="flex min-h-[calc(100dvh-2rem)] flex-col gap-5">
      <header className="flex items-center justify-between">
        <button type="button" onClick={onDone} aria-label={t(locale, 'close')} className="p-1">
          <IconX size={22} />
        </button>
        <h1 className="font-medium">{t(locale, note ? 'editNote' : 'newNote')}</h1>
        {note ? (
          <button type="button" onClick={remove} aria-label={t(locale, 'delete')} className="p-1 text-danger-text">
            <IconTrash size={22} />
          </button>
        ) : (
          <span className="w-7" />
        )}
      </header>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-title`} className="text-xs text-text-secondary">
          {t(locale, 'title')}
        </label>
        <input
          ref={titleRef}
          id={`${id}-title`}
          autoFocus={!note}
          autoComplete="off"
          dir="auto"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors({ ...errors, title: undefined })
          }}
          aria-invalid={!!errors.title}
          aria-describedby={`${id}-title-hint`}
          placeholder={t(locale, 'titlePlaceholder')}
          className={field}
        />
        <p id={`${id}-title-hint`} className="flex min-h-5 justify-between gap-2 text-xs">
          <span className="text-danger-text">{errors.title && t(locale, ERROR_TEXT[errors.title])}</span>
          {/* "40/120": each number in its own <bdi>, or RTL text would show 120 first. */}
          <span className="text-text-muted">
            <span className="sr-only">{t(locale, 'titleLength')}: </span>
            <Nums values={[title.length, TITLE_MAX]} separator="/" />
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-body`} className="text-xs text-text-secondary">
          {t(locale, 'body')}
        </label>
        <textarea id={`${id}-body`} dir="auto" value={body} onChange={(e) => setBody(e.target.value)} rows={5} className={`${field} resize-y`} />
      </div>

      <fieldset aria-describedby={errors.date ? `${id}-date-error` : undefined}>
        <legend className="mb-2 text-xs text-text-secondary">{t(locale, 'date')}</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!pickOther && date === today}
            className={`${chip} ${!pickOther && date === today ? chipOn : chipOff}`}
            onClick={() => {
              setPickOther(false)
              setDate(today)
            }}
          >
            {t(locale, 'today')}
          </button>
          <button
            type="button"
            aria-pressed={!pickOther && date === yesterday}
            className={`${chip} ${!pickOther && date === yesterday ? chipOn : chipOff}`}
            onClick={() => {
              setPickOther(false)
              setDate(yesterday)
            }}
          >
            {t(locale, 'yesterday')}
          </button>
          <button type="button" aria-pressed={pickOther} className={`${chip} ${pickOther ? chipOn : chipOff}`} onClick={() => setPickOther(true)}>
            {t(locale, 'otherDay')}
          </button>
        </div>
        {pickOther && (
          // Day, month, year in the chosen calendar; stored as ISO Gregorian either way.
          <div className="mt-3 grid grid-cols-[1fr_2fr_1.3fr] gap-2">
            <select aria-label={t(locale, 'day')} className={field} value={parts.day} onChange={(e) => setDatePart('day', Number(e.target.value))}>
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {formatDigits(d, locale)}
                </option>
              ))}
            </select>
            <select aria-label={t(locale, 'month')} className={field} value={parts.month} onChange={(e) => setDatePart('month', Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {monthName(m, locale, calendar)}
                </option>
              ))}
            </select>
            <select aria-label={t(locale, 'year')} className={field} value={parts.year} onChange={(e) => setDatePart('year', Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {formatDigits(y, locale)}
                </option>
              ))}
            </select>
          </div>
        )}
        {errors.date && (
          <p id={`${id}-date-error`} className="mt-2 text-xs text-danger-text">
            {t(locale, ERROR_TEXT[errors.date])}
          </p>
        )}
      </fieldset>

      <button type="submit" className="mt-auto rounded-control bg-brand-600 p-3 font-medium text-white">
        {t(locale, 'save')}
      </button>
    </form>
  )
}

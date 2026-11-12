import { useRef, useState, type ChangeEvent, type ComponentType } from 'react'
import { useSettings } from '../../app/settings.ts'
import { db } from '../../db/schema.ts'
import { t, type StringKey } from '../../lib/i18n.ts'
import { todayIso } from '../../lib/jalali.ts'
import { IconDownload, IconUpload } from '../../ui/icons.tsx'
import { Num } from '../../ui/Num.tsx'
import { backupFileName, download } from './backupFormat.ts'
import { exportJson } from './exportJson.ts'
import { ImportError, importJson, type ImportErrorCode, type ImportResult } from './importJson.ts'

const ERROR_TEXT: Record<ImportErrorCode, StringKey> = {
  notJson: 'importNotJson',
  notBackup: 'importNotBackup',
  unsupportedVersion: 'importUnsupportedVersion',
  invalidRecord: 'importInvalidRecord',
}

type Outcome = { ok: true; result: ImportResult } | { ok: false; code: ImportErrorCode }

/** Save a backup file and restore from one. Restoring merges and never deletes. */
export function BackupSection() {
  const { locale, calendar } = useSettings()
  const fileInput = useRef<HTMLInputElement>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  async function saveBackup() {
    download(await exportJson(db), backupFileName(todayIso(), calendar), 'application/json')
  }

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // so picking the same file again still fires
    if (!file) return
    try {
      setOutcome({ ok: true, result: await importJson(db, await file.text()) })
    } catch (error) {
      if (!(error instanceof ImportError)) throw error
      setOutcome({ ok: false, code: error.code })
    }
  }

  const counts: [number, StringKey][] = outcome?.ok
    ? [
        [outcome.result.added, 'importAdded'],
        [outcome.result.updated, 'importUpdated'],
        [outcome.result.unchanged, 'importUnchanged'],
      ]
    : []

  return (
    <section>
      <h2 className="mb-2 text-xs text-text-secondary">{t(locale, 'backup')}</h2>
      <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3">
        <p className="text-xs text-text-secondary">{t(locale, 'backupHint')}</p>
        <Action icon={IconDownload} label={t(locale, 'exportBackup')} hint={t(locale, 'exportBackupHint')} onClick={saveBackup} />
        <Action icon={IconUpload} label={t(locale, 'importBackup')} hint={t(locale, 'importMerges')} onClick={() => fileInput.current?.click()} />
        <input ref={fileInput} type="file" accept=".json,application/json" onChange={restore} className="hidden" aria-hidden="true" tabIndex={-1} />
        <p role="status" className="text-xs empty:hidden">
          {outcome?.ok === true && (
            <>
              {t(locale, 'importDone')}:{' '}
              {/* Each count in its own <bdi> (Num), so "۳ جدید، ۱ به‌روزشده" never runs together. */}
              {counts.map(([count, label], i) => (
                <span key={label}>
                  {i > 0 && (locale === 'fa' ? '، ' : ', ')}
                  <Num value={count} /> {t(locale, label)}
                </span>
              ))}
            </>
          )}
          {outcome?.ok === false && (
            <span className="text-danger-text">
              {t(locale, ERROR_TEXT[outcome.code])} {t(locale, 'importFailed')}
            </span>
          )}
        </p>
      </div>
    </section>
  )
}

type ActionIcon = ComponentType<{ size?: number; className?: string }>

/** A button that says what it does and, underneath, what the result is for. */
function Action({ icon: Icon, label, hint, onClick }: { icon: ActionIcon; label: string; hint: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-start gap-2.5 rounded-control border border-border-strong bg-surface px-3 py-2.5 text-start">
      <Icon size={18} className="mt-0.5 flex-none text-brand-600" />
      <span>
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-text-secondary">{hint}</span>
      </span>
    </button>
  )
}

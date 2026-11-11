import { APP_ID } from '../../../app.config.ts'
import type { Note } from '../../db/schema.ts'
import { toCalendar, type Calendar, type IsoDate } from '../../lib/jalali.ts'

/**
 * Version of the backup file format. It follows the database schema: when
 * a new schema version changes what a record holds, bump this and teach
 * importJson to convert older files instead of rejecting them.
 */
export const BACKUP_VERSION = 1

/** The whole file. Add a field for each table you add, in exportJson and importJson too. */
export interface Backup {
  app: string // APP_ID, so another app's file is never imported by mistake
  version: number
  exportedAt: string
  notes: Note[]
}

/**
 * File name with the date in the user's calendar, e.g.
 * "khesht-backup-1405-08-21.json" or "khesht-backup-2026-11-12.json".
 * Digits stay Latin so the name works on every file system and sorts.
 */
export function backupFileName(today: IsoDate, calendar: Calendar): string {
  const { year, month, day } = toCalendar(today, calendar)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${APP_ID}-backup-${year}-${pad(month)}-${pad(day)}.json`
}

/** Hands a file to the browser as a download. */
export function download(content: string, fileName: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // Some browsers start the download after click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

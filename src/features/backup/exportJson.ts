import { APP_ID } from '../../../app.config.ts'
import type { AppDb } from '../../db/schema.ts'
import { BACKUP_VERSION, type Backup } from './backupFormat.ts'

/** Everything in the database, as a backup file's text. */
export async function exportJson(db: AppDb, now: Date = new Date()): Promise<string> {
  const notes = await db.transaction('r', db.notes, () => db.notes.orderBy('date').toArray())
  const backup: Backup = { app: APP_ID, version: BACKUP_VERSION, exportedAt: now.toISOString(), notes }
  return JSON.stringify(backup, null, 2)
}

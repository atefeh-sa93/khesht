import { APP_ID } from '../../../app.config.ts'
import type { AppDb, Note } from '../../db/schema.ts'
import { parseIsoDate } from '../../lib/jalali.ts'
import { TITLE_MAX } from '../notes/noteStore.ts'
import { BACKUP_VERSION } from './backupFormat.ts'

export type ImportErrorCode = 'notJson' | 'notBackup' | 'unsupportedVersion' | 'invalidRecord'

export class ImportError extends Error {
  readonly code: ImportErrorCode

  constructor(code: ImportErrorCode, detail?: string) {
    super(detail ? `${code}: ${detail}` : code)
    this.code = code
  }
}

export interface ImportResult {
  added: number
  updated: number
  unchanged: number
}

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value)
const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const isTime = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    parseIsoDate(value)
    return true
  } catch {
    return false
  }
}

/**
 * A note from the file, checked field by field and rebuilt from known
 * fields only, so nothing unexpected reaches the database. Null if invalid.
 * Write one of these for each table you add.
 */
function toNote(value: unknown): Note | null {
  if (!isObject(value)) return null
  const { id, title, body, date, createdAt, updatedAt } = value
  if (!isText(id) || !isIsoDate(date) || !isTime(createdAt) || !isTime(updatedAt)) return null
  if (typeof title !== 'string' || !title.trim() || title.trim().length > TITLE_MAX) return null
  if (body !== undefined && typeof body !== 'string') return null
  return { id, title, date, createdAt, updatedAt, ...(body ? { body } : {}) }
}

/**
 * Checks a whole backup file before anything is written. Any problem
 * throws, so a bad file is rejected as a whole and never half-imported.
 */
export function parseBackup(text: string): { notes: Note[] } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new ImportError('notJson')
  }
  if (!isObject(data) || data.app !== APP_ID || !Array.isArray(data.notes)) throw new ImportError('notBackup')
  if (data.version !== BACKUP_VERSION) throw new ImportError('unsupportedVersion', String(data.version))

  const notes = data.notes.map(toNote)
  const bad = notes.indexOf(null)
  if (bad !== -1) throw new ImportError('invalidRecord', `note ${bad}`)

  return { notes: notes as Note[] }
}

/**
 * Merges a backup into the database. Nothing is ever deleted: new records
 * are added, and a record already here is replaced only when the backup's
 * copy was edited later. Runs in one transaction, so it is all or nothing.
 */
export async function importJson(db: AppDb, text: string): Promise<ImportResult> {
  const backup = parseBackup(text)

  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.bulkGet(backup.notes.map((n) => n.id))
    const result: ImportResult = { added: 0, updated: 0, unchanged: 0 }
    const toWrite: Note[] = []
    backup.notes.forEach((note, i) => {
      const current = existing[i]
      if (!current) result.added++
      else if (note.updatedAt > current.updatedAt) result.updated++
      else return void result.unchanged++
      toWrite.push(note)
    })
    await db.notes.bulkPut(toWrite)
    return result
  })
}

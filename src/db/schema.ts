import Dexie, { type EntityTable } from 'dexie'
import { APP_ID } from '../../app.config.ts'

/** A note in the example feature. Replace or add tables for your own app. */
export interface Note {
  id: string // crypto.randomUUID(), so records can later merge across devices
  title: string
  body?: string
  date: string // ISO Gregorian "2026-11-11"; Jalali is display only
  createdAt: number // ms since epoch
  updatedAt: number // ms since epoch; the newer copy wins when a backup is restored
}

export type AppDb = Dexie & {
  notes: EntityTable<Note, 'id'>
}

/**
 * Every schema version, oldest first. The rule: never edit a version that
 * has been released, because browsers that already opened it will not run
 * it again. For each change, add a new version below the others, with an
 * upgrade() that converts the data already stored. For example, to add a
 * "pinned" flag with an index (0 or 1: IndexedDB cannot index booleans):
 *
 *   db.version(2)
 *     .stores({ notes: 'id, date, updatedAt, pinned' })
 *     .upgrade((tx) => tx.table('notes').toCollection().modify((note) => {
 *       note.pinned = 0
 *     }))
 *
 * stores() lists only the primary key and the indexed fields; other fields
 * are stored without being declared. tests/unit/db.test.ts runs this exact
 * example against a version 1 database.
 */
export function defineVersions(db: Dexie): void {
  db.version(1).stores({
    notes: 'id, date, updatedAt',
  })
}

/** Opens (or creates) the database. Tests pass their own name. */
export function createDb(name: string = APP_ID): AppDb {
  const db = new Dexie(name) as AppDb
  defineVersions(db)
  return db
}

export const db = createDb()

import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Note } from '../../db/schema.ts'

/**
 * All notes, live. Reads straight from IndexedDB and re-renders on every
 * change, so there is no separate state store to keep in sync. Undefined
 * while the first query is loading. For many records, query a range
 * instead (see the month range test in tests/unit/db.test.ts).
 */
export function useNotes(): Note[] | undefined {
  return useLiveQuery(() => db.notes.toArray())
}

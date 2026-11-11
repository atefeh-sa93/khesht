import type { AppDb, Note } from '../../db/schema.ts'
import { parseIsoDate } from '../../lib/jalali.ts'

/** Longest title, in characters. The form shows a counter against it. */
export const TITLE_MAX = 120

export interface NoteInput {
  title: string
  body?: string
  date: string
}

export type NoteErrors = Partial<{ title: 'titleMissing' | 'titleTooLong'; date: 'dateInvalid' }>

/** Trimmed; a blank body is left out rather than stored empty. */
function clean(input: NoteInput): NoteInput {
  const body = input.body?.trim()
  return { title: input.title.trim(), ...(body ? { body } : {}), date: input.date }
}

/** What is wrong with the input, by field; empty when it can be saved. */
export function validateNote(input: NoteInput): NoteErrors {
  const errors: NoteErrors = {}
  const title = input.title.trim()
  if (!title) errors.title = 'titleMissing'
  else if (title.length > TITLE_MAX) errors.title = 'titleTooLong'
  try {
    parseIsoDate(input.date)
  } catch {
    errors.date = 'dateInvalid'
  }
  return errors
}

function assertValid(input: NoteInput): void {
  const errors = validateNote(input)
  if (Object.keys(errors).length > 0) throw new Error(`Invalid note: ${Object.values(errors).join(', ')}`)
}

export async function addNote(db: AppDb, input: NoteInput, now = Date.now()): Promise<Note> {
  assertValid(input)
  const note: Note = { id: crypto.randomUUID(), ...clean(input), createdAt: now, updatedAt: now }
  await db.notes.add(note)
  return note
}

/** Replaces the editable fields and bumps updatedAt; createdAt never changes. */
export async function updateNote(db: AppDb, id: string, input: NoteInput, now = Date.now()): Promise<void> {
  assertValid(input)
  const existing = await db.notes.get(id)
  if (!existing) throw new Error(`Note not found: ${id}`)
  // Drop the old body first, so clearing it in the form removes it.
  const { body: _oldBody, ...rest } = existing
  await db.notes.put({ ...rest, ...clean(input), updatedAt: now })
}

/** Deletes a note and returns it unchanged, so the caller can offer undo. */
export async function deleteNote(db: AppDb, id: string): Promise<Note | undefined> {
  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.get(id)
    if (existing) await db.notes.delete(id)
    return existing
  })
}

/** Puts a deleted note back exactly as it was, same id and timestamps. */
export async function restoreNote(db: AppDb, note: Note): Promise<void> {
  await db.notes.put(note)
}

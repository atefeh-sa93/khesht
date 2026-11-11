import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDb, type AppDb } from '../../src/db/schema.ts'
import { TITLE_MAX, addNote, deleteNote, restoreNote, updateNote, validateNote } from '../../src/features/notes/noteStore.ts'

let db: AppDb
let counter = 0

beforeEach(() => {
  db = createDb(`store-${++counter}`)
})

afterEach(async () => {
  await db.delete()
})

const input = { title: '  خرید  ', body: '  نان و پنیر  ', date: '2026-11-11' }

describe('validateNote', () => {
  it('accepts a title and a real date', () => {
    expect(validateNote(input)).toEqual({})
  })

  it('needs a title that is not only spaces', () => {
    expect(validateNote({ ...input, title: '   ' })).toEqual({ title: 'titleMissing' })
  })

  it(`limits the trimmed title to ${TITLE_MAX} characters`, () => {
    expect(validateNote({ ...input, title: ` ${'ب'.repeat(TITLE_MAX)} ` })).toEqual({})
    expect(validateNote({ ...input, title: 'ب'.repeat(TITLE_MAX + 1) })).toEqual({ title: 'titleTooLong' })
  })

  it('rejects a date that does not exist', () => {
    expect(validateNote({ ...input, date: '2026-02-30' })).toEqual({ date: 'dateInvalid' })
  })
})

describe('addNote', () => {
  it('stores the note with an id, timestamps and trimmed text', async () => {
    const saved = await addNote(db, input, 1000)
    expect(saved).toMatchObject({ title: 'خرید', body: 'نان و پنیر', date: '2026-11-11', createdAt: 1000, updatedAt: 1000 })
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(await db.notes.get(saved.id)).toEqual(saved)
  })

  it('drops a blank body', async () => {
    const saved = await addNote(db, { ...input, body: '   ' })
    expect(saved).not.toHaveProperty('body')
  })

  it('refuses invalid input and writes nothing', async () => {
    await expect(addNote(db, { ...input, title: '' })).rejects.toThrow(/titleMissing/)
    expect(await db.notes.count()).toBe(0)
  })
})

describe('updateNote', () => {
  it('changes fields and updatedAt but keeps id and createdAt', async () => {
    const saved = await addNote(db, input, 1000)
    await updateNote(db, saved.id, { title: 'خرید هفته', date: '2026-11-12' }, 2000)
    expect(await db.notes.get(saved.id)).toEqual({ id: saved.id, title: 'خرید هفته', date: '2026-11-12', createdAt: 1000, updatedAt: 2000 })
  })

  it('throws for a note that does not exist', async () => {
    await expect(updateNote(db, 'missing', input)).rejects.toThrow(/not found/)
  })
})

describe('deleteNote and restoreNote', () => {
  it('returns the deleted note and puts it back exactly as it was', async () => {
    const saved = await addNote(db, input, 1000)
    const deleted = await deleteNote(db, saved.id)
    expect(deleted).toEqual(saved)
    expect(await db.notes.count()).toBe(0)

    await restoreNote(db, deleted!)
    expect(await db.notes.get(saved.id)).toEqual(saved)
  })

  it('returns undefined when there is nothing to delete', async () => {
    expect(await deleteNote(db, 'missing')).toBeUndefined()
  })
})

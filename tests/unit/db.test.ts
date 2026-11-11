import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'
import { createDb, defineVersions, type AppDb, type Note } from '../../src/db/schema.ts'

let db: AppDb
let counter = 0

function openFresh() {
  db = createDb(`test-${++counter}`)
  return db
}

afterEach(async () => {
  await db.delete()
})

function note(overrides: Partial<Note>): Note {
  return {
    id: crypto.randomUUID(),
    title: 'خرید',
    date: '2026-11-11',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

describe('notes', () => {
  it('stores and reads back a note unchanged', async () => {
    openFresh()
    const n = note({ body: 'نان و پنیر' })
    await db.notes.add(n)
    expect(await db.notes.get(n.id)).toEqual(n)
  })

  it('finds a month of notes with a date string range', async () => {
    openFresh()
    await db.notes.bulkAdd([
      note({ date: '2026-10-22' }),
      note({ date: '2026-10-23' }),
      note({ date: '2026-11-21' }),
      note({ date: '2026-11-22' }),
    ])
    // Aban 1405 runs 2026-10-23 to 2026-11-21.
    const aban = await db.notes.where('date').between('2026-10-23', '2026-11-21', true, true).toArray()
    expect(aban.map((n) => n.date).sort()).toEqual(['2026-10-23', '2026-11-21'])
  })

  it('lists the most recently edited first', async () => {
    openFresh()
    await db.notes.bulkAdd([note({ title: 'a', updatedAt: 1 }), note({ title: 'c', updatedAt: 3 }), note({ title: 'b', updatedAt: 2 })])
    const titles = (await db.notes.orderBy('updatedAt').reverse().toArray()).map((n) => n.title)
    expect(titles).toEqual(['c', 'b', 'a'])
  })

  it('keeps data when the database is closed and reopened', async () => {
    const name = `test-${++counter}`
    const first = createDb(name)
    const n = note({})
    await first.notes.add(n)
    first.close()

    db = createDb(name)
    expect(await db.notes.get(n.id)).toEqual(n)
  })
})

describe('migrations', () => {
  // The example from the comment on defineVersions(), run for real: a
  // browser that has version 1 opens the app after version 2 shipped.
  it('upgrades notes saved under version 1 when version 2 adds a field', async () => {
    const name = `test-${++counter}`
    const v1 = createDb(name)
    await v1.notes.bulkAdd([note({ title: 'old 1' }), note({ title: 'old 2' })])
    v1.close()

    const v2 = new Dexie(name) as AppDb
    defineVersions(v2)
    v2.version(2)
      .stores({ notes: 'id, date, updatedAt, pinned' })
      .upgrade((tx) =>
        tx
          .table('notes')
          .toCollection()
          .modify((n: Note & { pinned?: number }) => {
            n.pinned = 0
          }),
      )
    db = v2

    const notes = (await v2.notes.toArray()) as (Note & { pinned: number })[]
    expect(notes.map((n) => [n.title, n.pinned]).sort()).toEqual([
      ['old 1', 0],
      ['old 2', 0],
    ])
    expect(v2.verno).toBe(2)
    // The new index works on the converted records.
    expect(await v2.notes.where('pinned').equals(0).count()).toBe(2)
  })

  it('opens a fresh database at the latest version', async () => {
    openFresh()
    await db.open()
    expect(db.verno).toBe(1)
  })
})

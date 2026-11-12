import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { APP_ID } from '../../app.config.ts'
import { createDb, type AppDb, type Note } from '../../src/db/schema.ts'
import { backupFileName } from '../../src/features/backup/backupFormat.ts'
import { exportJson } from '../../src/features/backup/exportJson.ts'
import { ImportError, importJson, parseBackup } from '../../src/features/backup/importJson.ts'

let db: AppDb
let counter = 0

beforeEach(() => {
  db = createDb(`backup-${++counter}`)
})

afterEach(async () => {
  await db.delete()
})

const note = (id: string, overrides: Partial<Note> = {}): Note => ({
  id,
  title: 'خرید',
  date: '2026-11-03',
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
})

const backupText = (notes: unknown[], extra: Record<string, unknown> = {}) =>
  JSON.stringify({ app: APP_ID, version: 1, exportedAt: '2026-11-04T00:00:00.000Z', notes, ...extra })

const snapshot = () => db.notes.orderBy('id').toArray()

describe('exportJson', () => {
  it('writes every note with the app id and format version, oldest date first', async () => {
    await db.notes.bulkAdd([note('b', { date: '2026-11-04' }), note('a', { body: 'نان و پنیر' })])
    const backup = JSON.parse(await exportJson(db, new Date('2026-11-04T10:00:00Z')))
    expect(backup).toMatchObject({ app: APP_ID, version: 1, exportedAt: '2026-11-04T10:00:00.000Z' })
    expect(backup.notes.map((n: Note) => n.id)).toEqual(['a', 'b'])
  })

  it('round-trips into an empty database', async () => {
    await db.notes.bulkAdd([note('a', { body: 'نان و پنیر' }), note('b', { title: 'Call Sara 12:30' })])
    const text = await exportJson(db)
    const other = createDb(`backup-copy-${counter}`)
    try {
      expect(await importJson(other, text)).toEqual({ added: 2, updated: 0, unchanged: 0 })
      expect(await other.notes.orderBy('id').toArray()).toEqual(await snapshot())
    } finally {
      await other.delete()
    }
  })
})

describe('parseBackup', () => {
  const rejects = (text: string, code: string) => {
    expect(() => parseBackup(text)).toThrow(ImportError)
    try {
      parseBackup(text)
    } catch (error) {
      expect((error as ImportError).code).toBe(code)
    }
  }

  it('rejects text that is not JSON', () => rejects('{"app": "khesht", ', 'notJson'))
  it('rejects JSON that is not a backup of this app', () => {
    rejects('[]', 'notBackup')
    rejects(JSON.stringify({ app: 'other', version: 1, notes: [] }), 'notBackup')
    rejects(JSON.stringify({ app: APP_ID, version: 1, notes: {} }), 'notBackup')
  })
  it('rejects an unknown format version, older or newer', () => {
    rejects(backupText([], { version: 0 }), 'unsupportedVersion')
    rejects(backupText([], { version: 2 }), 'unsupportedVersion')
    rejects(backupText([], { version: '1' }), 'unsupportedVersion')
  })
  it.each([
    ['an empty title', { title: '   ' }],
    ['a title that is too long', { title: 'ب'.repeat(121) }],
    ['a title that is not text', { title: 42 }],
    ['an impossible date', { date: '2026-02-30' }],
    ['a Jalali date', { date: '1405/08/12' }],
    ['a missing id', { id: '' }],
    ['a body that is not text', { body: 42 }],
    ['a timestamp as text', { updatedAt: '1000' }],
  ])('rejects a note with %s', (_, overrides) => {
    rejects(backupText([note('ok'), { ...note('bad'), ...overrides }]), 'invalidRecord')
  })
  it('drops an empty body and unknown fields instead of storing them', () => {
    const [parsed] = parseBackup(backupText([{ ...note('a', { body: '' }), extra: 'x' }])).notes
    expect(parsed).toEqual(note('a'))
  })
})

describe('importJson', () => {
  beforeEach(async () => {
    await db.notes.bulkAdd([note('kept'), note('edited-here', { title: 'edited here', updatedAt: 5000 })])
  })

  it.each([
    ['a corrupt file', '{"app":"khesht","no'],
    ['an empty file', ''],
    ['another app’s JSON', '{"name":"something else"}'],
    ['an older format version', backupText([note('new')], { version: 0 })],
    ['a newer format version', backupText([note('new')], { version: 2 })],
    ['one bad record among good ones', backupText([note('new'), note('broken', { title: '' })])],
  ])('leaves existing data untouched for %s', async (_, text) => {
    const before = await snapshot()
    await expect(importJson(db, text)).rejects.toBeInstanceOf(ImportError)
    expect(await snapshot()).toEqual(before)
  })

  it('adds new notes and never deletes ones missing from the file', async () => {
    expect(await importJson(db, backupText([note('new')]))).toEqual({ added: 1, updated: 0, unchanged: 0 })
    expect((await db.notes.toCollection().primaryKeys()).sort()).toEqual(['edited-here', 'kept', 'new'])
  })

  it('keeps whichever copy of a note was edited last', async () => {
    const result = await importJson(
      db,
      backupText([
        note('kept', { title: 'from file', updatedAt: 2000 }), // newer in the file: replaces
        note('edited-here', { title: 'older in file', updatedAt: 3000 }), // older in the file: ignored
      ]),
    )
    expect(result).toEqual({ added: 0, updated: 1, unchanged: 1 })
    expect((await db.notes.get('kept'))?.title).toBe('from file')
    expect((await db.notes.get('edited-here'))?.title).toBe('edited here')
  })

  it('importing the same file twice changes nothing the second time', async () => {
    const text = backupText([note('new'), note('another', { date: '2026-10-01' })])
    await importJson(db, text)
    const before = await snapshot()
    expect(await importJson(db, text)).toEqual({ added: 0, updated: 0, unchanged: 2 })
    expect(await snapshot()).toEqual(before)
  })
})

describe('backupFileName', () => {
  it('dates the file in the chosen calendar, with Latin digits', () => {
    expect(backupFileName('2026-11-04', 'jalali')).toBe(`${APP_ID}-backup-1405-08-13.json`)
    expect(backupFileName('2026-11-04', 'gregorian')).toBe(`${APP_ID}-backup-2026-11-04.json`)
    expect(backupFileName('2026-03-21', 'jalali')).toBe(`${APP_ID}-backup-1405-01-01.json`)
  })
})

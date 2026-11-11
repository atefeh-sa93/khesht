import { describe, expect, it } from 'vitest'
import type { Note } from '../../src/db/schema.ts'
import { groupByDay } from '../../src/features/notes/groupByDay.ts'

const note = (id: string, date: string, createdAt: number): Note => ({ id, title: id, date, createdAt, updatedAt: createdAt })

describe('groupByDay', () => {
  it('puts the newest day first and the newest note first within a day', () => {
    const groups = groupByDay([note('a', '2026-11-10', 1), note('b', '2026-11-11', 2), note('c', '2026-11-10', 3), note('d', '2026-11-11', 4)])
    expect(groups.map((g) => [g.date, g.notes.map((n) => n.id)])).toEqual([
      ['2026-11-11', ['d', 'b']],
      ['2026-11-10', ['c', 'a']],
    ])
  })

  it('returns no groups for no notes', () => {
    expect(groupByDay([])).toEqual([])
  })

  it('does not change the array it was given', () => {
    const notes = [note('a', '2026-11-10', 1), note('b', '2026-11-11', 2)]
    groupByDay(notes)
    expect(notes.map((n) => n.id)).toEqual(['a', 'b'])
  })
})

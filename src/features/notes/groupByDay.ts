import type { Note } from '../../db/schema.ts'

export interface DayGroup {
  date: string
  notes: Note[]
}

/** Groups notes by date, newest day first and newest note first within a day. */
export function groupByDay(notes: readonly Note[]): DayGroup[] {
  const byDate = new Map<string, Note[]>()
  for (const note of notes) {
    const day = byDate.get(note.date)
    if (day) day.push(note)
    else byDate.set(note.date, [note])
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, items]) => ({ date, notes: items.sort((a, b) => b.createdAt - a.createdAt) }))
}

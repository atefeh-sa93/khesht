import { useCallback, useState } from 'react'
import { Router, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { db, type Note } from '../db/schema.ts'
import { restoreNote } from '../features/notes/noteStore.ts'
import { UndoToast } from '../features/notes/UndoToast.tsx'
import { UpdatePrompt } from '../pwa/UpdatePrompt.tsx'
import { BottomNav } from './BottomNav.tsx'
import { paths } from './navigation.ts'
import { Routes } from './routes.tsx'
import { TABS } from './tabs.ts'

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Shell />
    </Router>
  )
}

function Shell() {
  const [location] = useLocation()
  // Tabs show the bottom navigation; other screens (forms, not found) are focused tasks without it.
  const onTab = TABS.some((tab) => tab.path === location)
  // The last deleted note, kept only while its undo toast is showing.
  const [deleted, setDeleted] = useState<Note | null>(null)
  const closeToast = useCallback(() => setDeleted(null), [])

  async function undo() {
    if (!deleted) return
    setDeleted(null)
    await restoreNote(db, deleted)
  }

  return (
    <>
      <main className={`mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4 ${onTab ? 'pb-24' : ''}`}>
        {/* Mounted on every screen to keep the worker registered; shown only on the tabs, never over a form. */}
        <UpdatePrompt visible={onTab} />
        <Routes onDeleted={setDeleted} />
      </main>
      {onTab && <BottomNav />}
      {/* Always mounted, so screen readers announce the toast when it appears. */}
      <div role="status">
        {deleted && location === paths.home && <UndoToast key={deleted.id} onUndo={undo} onClose={closeToast} />}
      </div>
    </>
  )
}

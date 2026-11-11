import { Router, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { BottomNav } from './BottomNav.tsx'
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

  return (
    <>
      <main className={`mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4 ${onTab ? 'pb-24' : ''}`}>
        <Routes />
      </main>
      {onTab && <BottomNav />}
    </>
  )
}

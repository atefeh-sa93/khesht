import type { ComponentType } from 'react'
import type { StringKey } from '../lib/i18n.ts'
import { IconHome, IconSettings } from '../ui/icons.tsx'
import { paths } from './navigation.ts'

type TabIcon = ComponentType<{ size?: number; strokeWidth?: number }>

/** The bottom navigation's tabs. Screens not listed here are shown without it. */
export const TABS: { path: string; label: StringKey; icon: TabIcon }[] = [
  { path: paths.home, label: 'navHome', icon: IconHome },
  { path: paths.settings, label: 'navSettings', icon: IconSettings },
]

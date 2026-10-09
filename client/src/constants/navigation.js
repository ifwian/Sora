import {
  Home,
  CheckSquare,
  StickyNote,
  Calendar,
  Target,
  Flame,
  GraduationCap,
  Wallet,
  Gamepad2,
  BookOpen,
  Film,
  Image,
  MapPin,
  Settings,
  BarChart3,
} from 'lucide-react'

/**
 * Single source of truth for app navigation.
 * Sidebar, mobile drawer, and bottom nav all read from this.
 */
export const NAV_SECTIONS = [
  {
    label: null,
    items: [{ to: '/', label: 'Home', icon: Home, end: true }],
  },
  {
    label: 'Plan',
    items: [
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/notes', label: 'Notes', icon: StickyNote },
      { to: '/calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/goals', label: 'Goals', icon: Target },
      { to: '/habits', label: 'Habits', icon: Flame },
      { to: '/study', label: 'Study', icon: GraduationCap },
      { to: '/finance', label: 'Finance', icon: Wallet },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/games', label: 'Games', icon: Gamepad2 },
      { to: '/reading', label: 'Reading', icon: BookOpen },
      { to: '/movies', label: 'Movies', icon: Film },
      { to: '/memories', label: 'Memories', icon: Image },
      { to: '/places', label: 'Places', icon: MapPin },
    ],
  },
]

export const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: Settings }

/** Most important sections for the mobile bottom nav (kept to 4 + a "More" toggle). */
export const MOBILE_PRIMARY_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/notes', label: 'Notes', icon: StickyNote },
]

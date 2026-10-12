import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { MobileNav } from '../components/layout/MobileNav'
import { LoadingState } from '../components/common/LoadingState'
import { NAV_SECTIONS, SETTINGS_ITEM } from '../constants/navigation'

const TITLES = Object.fromEntries(
  [...NAV_SECTIONS.flatMap((section) => section.items), SETTINGS_ITEM].map((item) => [item.to, item.label])
)

/**
 * AppLayout — the persistent shell (sidebar + header + mobile nav) around
 * every routed page. It also handles what a single-page app has to do by
 * hand for keyboard and screen-reader users: a skip link, an updated
 * document title, and moving focus to the new page after navigating.
 */
export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    document.title = `${TITLES[pathname] ?? 'Personal OS'} · Personal OS`
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-sm focus:bg-accent focus:text-accent-foreground focus:text-sm"
      >
        Skip to content
      </a>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenMobileNav={() => setDrawerOpen(true)} />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8 outline-none"
        >
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <MobileNav
        drawerOpen={drawerOpen}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCloseDrawer={() => setDrawerOpen(false)}
      />
    </div>
  )
}

import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const navLinks = [
  { to: '/', label: 'Proveedores' },
  { to: '/history', label: 'Historial' },
]

const pageTitles: Record<string, string> = {
  '/': 'Proveedores',
  '/history': 'Historial',
}

export default function Layout() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const title = pageTitles[pathname]
      || (pathname.includes('/message') ? 'Mensaje' : 'Proveedor')
    document.title = `${title} — Proveedores`
  }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-fade-in text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-muted text-sm font-medium tracking-wide">Conectando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface-raised/80 backdrop-blur-xl border-b border-border">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg tracking-tight text-ink">
              proveedores<span className="text-accent">.</span>
            </span>
            <div className="flex items-center gap-1">
              {navLinks.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-[--duration-fast] ${
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'text-ink-muted hover:text-ink hover:bg-surface-overlay'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://docs.google.com/spreadsheets/d/${import.meta.env.VITE_SPREADSHEET_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-accent transition-colors"
              title="Abrir Google Sheet"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="hidden sm:inline">Sheet</span>
            </a>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-ink-faint hover:text-accent hover:bg-surface-overlay transition-all cursor-pointer"
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
            {user && (
              <div className="flex items-center gap-2.5">
                <img
                  src={user.picture}
                  alt=""
                  className="w-7 h-7 rounded-full ring-2 ring-border"
                />
                <span className="text-sm text-ink-muted font-medium hidden sm:block">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-6 py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

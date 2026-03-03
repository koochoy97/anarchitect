import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

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

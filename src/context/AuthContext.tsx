import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { initTokenClient, requestAccessToken, revokeToken, fetchUserInfo } from '../lib/google-auth'
import type { UserInfo } from '../types/google'

const TOKEN_KEY = 'gsheet_token'
const USER_KEY = 'gsheet_user'

function loadStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

interface AuthState {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
  loading: boolean
  login: () => void
  logout: () => void
  refreshToken: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => loadStored<string>(TOKEN_KEY))
  const [user, setUser] = useState<UserInfo | null>(() => loadStored<UserInfo>(USER_KEY))
  const [loading, setLoading] = useState(!loadStored<string>(TOKEN_KEY))
  const [gisReady, setGisReady] = useState(false)

  const handleToken = useCallback(async (accessToken: string) => {
    setToken(accessToken)
    localStorage.setItem(TOKEN_KEY, JSON.stringify(accessToken))
    try {
      const info = await fetchUserInfo(accessToken)
      setUser(info)
      localStorage.setItem(USER_KEY, JSON.stringify(info))
    } catch {
      setUser(null)
      localStorage.removeItem(USER_KEY)
    }
    setLoading(false)
  }, [])

  // Initialize GIS
  useEffect(() => {
    const checkGIS = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(checkGIS)
        initTokenClient(
          handleToken,
          (error) => {
            console.error('Auth error:', error)
            // If silent renewal failed, clear stored token and show popup
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            setToken(null)
            setUser(null)
            setLoading(false)
          },
        )
        setGisReady(true)
      }
    }, 100)
    return () => clearInterval(checkGIS)
  }, [handleToken])

  // Auto-login: silent renewal if user logged in before, else show popup
  useEffect(() => {
    if (!gisReady) return
    if (token) {
      // Token exists in storage — try silent renewal to refresh it
      requestAccessToken('')
    } else if (loadStored<UserInfo>(USER_KEY)) {
      // Had a previous session — try silent renewal
      requestAccessToken('')
    } else {
      // First time — show consent popup
      requestAccessToken()
    }
  }, [gisReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(() => {
    setLoading(true)
    requestAccessToken()
  }, [])

  const refreshToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    requestAccessToken('')
  }, [])

  const logout = useCallback(() => {
    if (token) revokeToken(token)
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

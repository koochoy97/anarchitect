import { useState, useEffect, useCallback } from 'react'
import { getRows, appendRow, AuthExpiredError } from '../lib/sheets-api'
import { useAuth } from '../context/AuthContext'

const TAB = 'Historial'

export interface HistoryEntry {
  fecha: string
  proveedor: string
  mensaje: string
}

export function useHistory() {
  const { token, refreshToken } = useAuth()
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const rows = await getRows(token, `${TAB}!A1:C`)
      if (rows.length <= 1) {
        setEntries([])
        return
      }
      const data = rows.slice(1).map(row => ({
        fecha: row[0] ?? '',
        proveedor: row[1] ?? '',
        mensaje: row[2] ?? '',
      }))
      setEntries(data.reverse())
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        refreshToken()
      } else {
        setError((err as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }, [token, refreshToken])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addEntry = useCallback(async (entry: HistoryEntry) => {
    if (!token) return
    await appendRow(token, `${TAB}!A:C`, [entry.fecha, entry.proveedor, entry.mensaje])
  }, [token])

  return { entries, loading, error, refresh: fetchAll, addEntry }
}

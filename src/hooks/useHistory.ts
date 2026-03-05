import { useState, useEffect, useCallback } from 'react'
import { getRows, appendRow, updateRow, deleteRow, getSheetMetadata, AuthExpiredError } from '../lib/sheets-api'
import { useAuth } from '../context/AuthContext'

const TAB = 'Historial'

export interface HistoryEntry {
  _rowIndex: number
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
      const data = rows.slice(1).map((row, i) => ({
        _rowIndex: i + 2, // 1-based, skip header
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

  const addEntry = useCallback(async (entry: Omit<HistoryEntry, '_rowIndex'>) => {
    if (!token) return
    await appendRow(token, `${TAB}!A:C`, [entry.fecha, entry.proveedor, entry.mensaje])
  }, [token])

  const updateEntry = useCallback(async (rowIndex: number, mensaje: string) => {
    if (!token) return
    await updateRow(token, `${TAB}!C${rowIndex}`, [mensaje])
    await fetchAll()
  }, [token, fetchAll])

  const deleteEntry = useCallback(async (rowIndex: number) => {
    if (!token) return
    const meta = await getSheetMetadata(token)
    const sheet = meta.find(s => s.title === TAB)
    if (!sheet) throw new Error(`Tab "${TAB}" not found`)
    await deleteRow(token, sheet.sheetId, rowIndex - 1)
    await fetchAll()
  }, [token, fetchAll])

  return { entries, loading, error, refresh: fetchAll, addEntry, updateEntry, deleteEntry }
}

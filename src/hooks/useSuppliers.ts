import { useState, useEffect, useCallback } from 'react'
import { getRows, appendRow, updateRow, deleteRow, getSheetMetadata, AuthExpiredError } from '../lib/sheets-api'
import { useAuth } from '../context/AuthContext'

const TAB = 'Proveedores'

export interface Supplier {
  _rowIndex: number
  [key: string]: string | number
}

export function useSuppliers() {
  const { token, refreshToken } = useAuth()
  const [headers, setHeaders] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const rows = await getRows(token, `${TAB}!A1:Z`)
      if (rows.length === 0) {
        setHeaders([])
        setSuppliers([])
        return
      }
      const hdrs = rows[0]
      setHeaders(hdrs)
      const data = rows.slice(1).map((row, i) => {
        const obj: Supplier = { _rowIndex: i + 2 }
        hdrs.forEach((h, j) => { obj[h] = row[j] ?? '' })
        return obj
      })
      setSuppliers(data)
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

  const addSupplier = useCallback(async (data: Record<string, string>) => {
    if (!token) return
    const values = headers.map(h => data[h] ?? '')
    await appendRow(token, `${TAB}!A:Z`, values)
    await fetchAll()
  }, [token, headers, fetchAll])

  const updateSupplier = useCallback(async (rowIndex: number, data: Record<string, string>) => {
    if (!token) return
    const values = headers.map(h => data[h] ?? '')
    await updateRow(token, `${TAB}!A${rowIndex}:Z${rowIndex}`, values)
    await fetchAll()
  }, [token, headers, fetchAll])

  const deleteSupplier = useCallback(async (rowIndex: number) => {
    if (!token) return
    const meta = await getSheetMetadata(token)
    const sheet = meta.find(s => s.title === TAB)
    if (!sheet) throw new Error(`Tab "${TAB}" not found`)
    await deleteRow(token, sheet.sheetId, rowIndex - 1) // API uses 0-based
    await fetchAll()
  }, [token, fetchAll])

  return { headers, suppliers, loading, error, refresh: fetchAll, addSupplier, updateSupplier, deleteSupplier }
}

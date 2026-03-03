import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Supplier } from '../hooks/useSuppliers'
import TemplateModal from './TemplateModal'

interface Props {
  headers: string[]
  suppliers: Supplier[]
  onDelete: (rowIndex: number) => Promise<void>
}

function DropdownMenu({ onEdit, onDelete, deleting }: {
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right - 160 })
    }
    setOpen(v => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-md text-ink-faint hover:text-ink hover:bg-surface-overlay transition-all duration-[--duration-fast] cursor-pointer"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed w-40 bg-surface-raised border border-border rounded-lg shadow-lg z-[9999] py-1 animate-fade-in"
          style={{ top: pos.top, left: pos.left }}
        >
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-surface-overlay transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Editar
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            disabled={deleting}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-40"
          >
            {deleting ? (
              <div className="w-4 h-4 border-2 border-danger border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            )}
            Eliminar
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

export default function SupplierList({ headers, suppliers, onDelete }: Props) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [templateSupplier, setTemplateSupplier] = useState<Supplier | null>(null)

  const handleDelete = async (rowIndex: number) => {
    if (!confirm('Eliminar este proveedor?')) return
    setDeleting(rowIndex)
    try {
      await onDelete(rowIndex)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = search
    ? suppliers.filter(s =>
        headers.some(h => String(s[h] ?? '').toLowerCase().includes(search.toLowerCase()))
      )
    : suppliers

  if (suppliers.length === 0) {
    return (
      <div className="animate-fade-in text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-overlay mb-4">
          <svg className="w-6 h-6 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-ink-muted font-medium">Sin proveedores</p>
        <p className="text-ink-faint text-sm mt-1">Agrega tu primer proveedor para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface-raised rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {headers.map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
              <th className="w-px px-5 py-3" />
            </tr>
          </thead>
          <tbody className="stagger-children">
            {filtered.map(s => (
              <tr
                key={s._rowIndex}
                className="border-b border-border last:border-0 hover:bg-surface-overlay/50 transition-colors duration-[--duration-fast]"
              >
                {headers.map((h, i) => (
                  <td key={h} className={`px-5 py-3.5 text-sm ${i === 0 ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
                    {String(s[h] ?? '')}
                  </td>
                ))}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setTemplateSupplier(s)}
                      className="px-3.5 py-1.5 rounded-lg bg-accent text-ink-invert text-xs font-semibold hover:bg-accent-hover transition-all duration-[--duration-fast] cursor-pointer"
                    >
                      Generar Template
                    </button>
                    <DropdownMenu
                      onEdit={() => navigate(`/suppliers/${s._rowIndex}`)}
                      onDelete={() => handleDelete(s._rowIndex)}
                      deleting={deleting === s._rowIndex}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-5 py-8 text-center text-sm text-ink-faint">
                  Sin resultados para "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Template Modal */}
      {templateSupplier && (
        <TemplateModal
          supplier={templateSupplier}
          headers={headers}
          onClose={() => setTemplateSupplier(null)}
        />
      )}
    </div>
  )
}

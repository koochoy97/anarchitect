import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useHistory, type HistoryEntry } from '../hooks/useHistory'
import { copyToClipboard } from '../lib/whatsapp'
import Toast from '../components/Toast'

function MessageModal({ entry, onClose, onSave, onDelete }: { entry: HistoryEntry; onClose: () => void; onSave: (rowIndex: number, mensaje: string) => Promise<void>; onDelete: (rowIndex: number) => Promise<void> }) {
  const [text, setText] = useState(entry.mensaje)
  const [toastMsg, setToastMsg] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const hasChanges = text !== entry.mensaje

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleCopy = async () => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setToastMsg('Mensaje copiado')
      setShowToast(true)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(entry._rowIndex, text)
      setToastMsg('Cambios guardados')
      setShowToast(true)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(entry._rowIndex)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  const handleToastDone = useCallback(() => {
    setShowToast(false)
  }, [])

  return (<>
    {createPortal(
      <>
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 32, paddingBottom: 32, pointerEvents: 'none' }}>
          <div
            className="bg-surface-raised rounded-2xl shadow-lg border border-border animate-slide-up"
            style={{ width: '100%', maxWidth: 768, margin: '0 16px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 4rem)', overflow: 'hidden' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-lg font-bold text-ink">{entry.proveedor}</h2>
                <p className="text-xs text-ink-faint font-mono">{entry.fecha}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-surface-overlay transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-0 p-6 overflow-y-auto">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ width: '100%', minHeight: 320 }}
                className="px-4 py-3 bg-surface border border-border rounded-xl text-sm text-ink font-sans leading-relaxed focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-y"
                rows={Math.max(12, text.split('\n').length + 2)}
              />
            </div>

            <div className="px-6 py-4 border-t border-border shrink-0 flex items-center gap-3">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer bg-accent text-ink-invert hover:bg-accent-hover shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  Guardar cambios
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all ${
                  hasChanges
                    ? 'bg-surface-overlay text-ink-muted hover:bg-border'
                    : 'flex-1 bg-accent text-ink-invert hover:bg-accent-hover shadow-sm hover:shadow-md'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copiar
              </button>
              <div className="flex-1" />
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-danger font-medium">¿Eliminar?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-danger text-white hover:bg-danger/80 transition-all disabled:opacity-50"
                  >
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-ink-muted bg-surface-overlay hover:bg-border transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2.5 rounded-xl text-ink-faint hover:text-danger hover:bg-danger-soft transition-all cursor-pointer"
                  title="Eliminar entrada"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-sm font-medium text-ink-muted bg-surface-overlay hover:bg-border transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body
    )}
    <Toast message={toastMsg} visible={showToast} onDone={handleToastDone} />
  </>)
}

export default function HistoryPage() {
  const { entries, loading, error, updateEntry, deleteEntry } = useHistory()
  const [selected, setSelected] = useState<HistoryEntry | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleQuickCopy = async (mensaje: string, idx: number) => {
    const ok = await copyToClipboard(mensaje)
    if (ok) {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1500)
    }
  }

  const handleSave = async (rowIndex: number, mensaje: string) => {
    await updateEntry(rowIndex, mensaje)
    setSelected(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-muted text-sm">Cargando historial...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in bg-danger-soft border border-danger/20 rounded-xl p-6 text-center">
        <p className="text-danger font-medium text-sm">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Historial</h1>
        <p className="text-ink-muted text-sm mt-0.5">
          {entries.length} {entries.length === 1 ? 'mensaje generado' : 'mensajes generados'}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="animate-fade-in text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-overlay mb-4">
            <svg className="w-6 h-6 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-ink-muted font-medium">Sin historial</p>
          <p className="text-ink-faint text-sm mt-1">Los mensajes generados apareceran aqui</p>
        </div>
      ) : (
        <div className="bg-surface-raised border border-border rounded-xl overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-overlay/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Fecha</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Proveedor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Mensaje</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={e._rowIndex}
                  className="border-b border-border last:border-b-0 hover:bg-surface-overlay/40 transition-colors cursor-pointer"
                  onClick={() => setSelected(e)}
                >
                  <td className="px-5 py-3.5 text-ink-faint font-mono text-xs whitespace-nowrap align-top">
                    {e.fecha}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                        <span className="text-accent font-bold text-[11px]">{e.proveedor.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-ink">{e.proveedor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-top max-w-xs">
                    <p className="text-ink-muted truncate">{e.mensaje.replace(/\n/g, ' ')}</p>
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    <button
                      title="Copiar mensaje"
                      onClick={(ev) => { ev.stopPropagation(); handleQuickCopy(e.mensaje, i) }}
                      className="p-1.5 rounded-lg text-ink-faint hover:text-accent hover:bg-accent-soft transition-all cursor-pointer"
                    >
                      {copiedIdx === i ? (
                        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <MessageModal entry={selected} onClose={() => setSelected(null)} onSave={handleSave} onDelete={async (rowIndex) => { await deleteEntry(rowIndex); setSelected(null) }} />}
    </div>
  )
}

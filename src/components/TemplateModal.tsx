import { useState, useMemo, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DEFAULT_TEMPLATE, TEMPLATE_FIELDS, renderTemplate, copyToClipboard } from '../lib/whatsapp'
import { useHistory } from '../hooks/useHistory'
import type { Supplier } from '../hooks/useSuppliers'
import Toast from './Toast'

interface Props {
  supplier: Supplier
  headers: string[]
  onClose: () => void
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}-${m}-${y}`
}

export default function TemplateModal({ supplier, headers, onClose }: Props) {
  const { addEntry } = useHistory()
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const highlightRef = useRef<HTMLSpanElement>(null)

  // Pre-fill from supplier data where possible
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const data: Record<string, string> = {}
    for (const field of TEMPLATE_FIELDS) {
      if (field.defaultFromHeader) {
        // Fuzzy match: normalize accents, case, trim
        const match = headers.find(h => normalize(h) === normalize(field.defaultFromHeader!))
          || headers.find(h => normalize(h).includes(normalize(field.defaultFromHeader!)))
          || headers.find(h => normalize(field.defaultFromHeader!).includes(normalize(h)))
        data[field.key] = match ? String(supplier[match] ?? '') : ''
      } else if (field.key === 'fecha') {
        data[field.key] = toDateInputValue(new Date())
      } else {
        data[field.key] = ''
      }
    }
    return data
  })

  // Render fecha as dd-mm-yyyy in the template
  const templateData = useMemo(() => ({
    ...formData,
    fecha: formatDateDisplay(formData.fecha),
  }), [formData])

  const preview = useMemo(() => renderTemplate(DEFAULT_TEMPLATE, templateData), [templateData])

  // Build preview with highlighted focused field
  const previewNodes = useMemo((): ReactNode => {
    if (!focusedField) return preview

    // Render template replacing placeholders one by one, marking the focused one
    const cci = formData.cci ?? ''
    const enriched: Record<string, string> = { ...templateData, cci_line: cci ? ` CCI:${cci}` : '' }
    const parts: ReactNode[] = []
    let remaining = DEFAULT_TEMPLATE
    const regex = /\{\{(\w+)\}\}/g
    let match: RegExpExecArray | null
    let lastIndex = 0

    while ((match = regex.exec(remaining)) !== null) {
      const key = match[1]
      const value = enriched[key] ?? match[0]
      const before = remaining.slice(lastIndex, match.index)

      if (before) parts.push(before)

      if (key === focusedField || (focusedField === 'cci' && key === 'cci_line')) {
        parts.push(
          <span key={match.index} ref={highlightRef} className="bg-accent/20 text-accent rounded px-0.5 transition-colors duration-200">
            {value || field(focusedField)?.placeholder || `{{${focusedField}}}`}
          </span>
        )
      } else {
        parts.push(value)
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < remaining.length) parts.push(remaining.slice(lastIndex))
    return parts
  }, [preview, focusedField, templateData])

  // Scroll highlight into view
  useEffect(() => {
    if (focusedField && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [focusedField])

  function field(key: string) {
    return TEMPLATE_FIELDS.find(f => f.key === key)
  }

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSaveAndCopy = async () => {
    const ok = await copyToClipboard(preview)
    if (ok) {
      const nombre = String(supplier[headers[0]] ?? 'Desconocido')
      await addEntry({
        fecha: new Date().toLocaleString('es-PE'),
        proveedor: nombre,
        mensaje: preview,
      })
      setShowToast(true)
    }
  }

  const handleToastDone = useCallback(() => {
    setShowToast(false)
    onClose()
  }, [onClose])

  return (<>
    {createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 pb-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[calc(100vh-4rem)] bg-surface-raised rounded-2xl shadow-lg border border-border flex flex-col animate-slide-up overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink">Generar Template</h2>
            <p className="text-sm text-ink-muted">{String(supplier[headers[0]] ?? '')}</p>
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

        {/* Body */}
        <div className="flex-1 min-h-0 flex">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border w-full min-h-0">
            {/* Form — scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto min-h-0">
              {/* Datos de la solicitud */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Datos de la solicitud</h3>
                {TEMPLATE_FIELDS.filter(f => f.section === 'solicitud').map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-ink-muted mb-1">{field.label}</label>
                    {field.key === 'fecha' ? (
                      <div className="relative">
                        <input
                          type="date"
                          value={formData[field.key] ?? ''}
                          onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          onFocus={() => setFocusedField(field.key)}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast] appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                    ) : field.key === 'descripcion' ? (
                      <textarea
                        value={formData[field.key] ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={field.placeholder}
                        rows={2}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast] resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[field.key] ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast]"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Datos del proveedor — prellenados */}
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer select-none">
                  <svg className="w-3.5 h-3.5 text-ink-faint transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <h3 className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Datos del proveedor</h3>
                  <span className="text-[10px] text-accent font-medium bg-accent-soft px-1.5 py-0.5 rounded">prellenado</span>
                </summary>
                <div className="space-y-3 mt-3 pl-5.5">
                  {TEMPLATE_FIELDS.filter(f => f.section === 'proveedor').map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-ink-muted mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={formData[field.key] ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast]"
                      />
                    </div>
                  ))}
                </div>
              </details>
            </div>

            {/* Preview — fixed */}
            <div className="p-6 space-y-4 bg-surface overflow-y-auto">
              <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Preview</h3>
              <div className="relative bg-surface-raised border border-accent-muted rounded-xl p-5 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-xl" />
                <pre className="whitespace-pre-wrap text-sm text-ink font-sans leading-relaxed pl-2">{previewNodes}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex items-center gap-3">
          <button
            onClick={handleSaveAndCopy}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-[--duration-normal] cursor-pointer bg-accent text-ink-invert hover:bg-accent-hover shadow-sm hover:shadow-md"
          >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Guardar y Copiar mensaje
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm font-medium text-ink-muted bg-surface-overlay hover:bg-border transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}
    <Toast message="Mensaje copiado y guardado" visible={showToast} onDone={handleToastDone} />
  </>)
}

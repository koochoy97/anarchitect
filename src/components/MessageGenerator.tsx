import { useState, useMemo } from 'react'
import { DEFAULT_TEMPLATE, renderTemplate, getTemplateVariables, copyToClipboard } from '../lib/whatsapp'
import { useHistory } from '../hooks/useHistory'
import type { Supplier } from '../hooks/useSuppliers'

interface Props {
  supplier: Supplier
  headers: string[]
}

export default function MessageGenerator({ supplier, headers }: Props) {
  const [template] = useState(DEFAULT_TEMPLATE)
  const { addEntry } = useHistory()
  const [copied, setCopied] = useState(false)

  const templateVars = useMemo(() => {
    const vars = getTemplateVariables(template)
    return vars.filter(v => !headers.includes(v))
  }, [template, headers])

  const [extraData, setExtraData] = useState<Record<string, string>>(
    () => Object.fromEntries(templateVars.map(v => [v, '']))
  )

  const allData = useMemo(() => {
    const d: Record<string, string> = {}
    headers.forEach(h => { d[h] = String(supplier[h] ?? '') })
    Object.assign(d, extraData)
    return d
  }, [supplier, headers, extraData])

  const preview = useMemo(() => renderTemplate(template, allData), [template, allData])

  const handleCopy = async () => {
    const ok = await copyToClipboard(preview)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      const nombre = String(supplier[headers[0]] ?? 'Desconocido')
      await addEntry({
        fecha: new Date().toLocaleString('es-MX'),
        proveedor: nombre,
        mensaje: preview,
      })
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Extra variables form */}
      {templateVars.length > 0 && (
        <div className="bg-surface-raised rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Variables del mensaje</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templateVars.map(v => (
              <div key={v}>
                <label className="block text-xs font-medium text-ink-muted mb-1">{v}</label>
                <input
                  type="text"
                  value={extraData[v] ?? ''}
                  onChange={e => setExtraData(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder={v}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="relative bg-accent-soft/50 border border-accent-muted rounded-xl p-5 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-xl" />
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">Preview</h3>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-ink font-sans leading-relaxed">{preview}</pre>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-[--duration-normal] cursor-pointer shadow-sm hover:shadow-lg ${
          copied
            ? 'bg-accent-muted text-accent'
            : 'bg-accent text-ink-invert hover:bg-accent-hover'
        }`}
      >
        {copied ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copiado al portapapeles
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copiar mensaje
          </>
        )}
      </button>
    </div>
  )
}

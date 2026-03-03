import { useState, type FormEvent } from 'react'

interface Props {
  headers: string[]
  initialData?: Record<string, string>
  onSubmit: (data: Record<string, string>) => Promise<void>
  onCancel: () => void
}

export default function SupplierForm({ headers, initialData, onSubmit, onCancel }: Props) {
  const [data, setData] = useState<Record<string, string>>(
    () => Object.fromEntries(headers.map(h => [h, initialData?.[h] ?? '']))
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-slide-up bg-surface-raised rounded-xl border border-border shadow-md p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {headers.map((h, i) => (
          <div key={h} className={i === 0 ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">{h}</label>
            <input
              type="text"
              value={data[h] ?? ''}
              onChange={e => setData(prev => ({ ...prev, [h]: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-[--duration-fast]"
              placeholder={h}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-accent text-ink-invert rounded-lg text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 transition-all duration-[--duration-fast] cursor-pointer shadow-sm hover:shadow-md"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando
            </span>
          ) : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-surface-overlay text-ink-muted rounded-lg text-sm font-medium hover:bg-border transition-all duration-[--duration-fast] cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { useSuppliers } from '../hooks/useSuppliers'
import MessageGenerator from '../components/MessageGenerator'

export default function MessagePage() {
  const { rowIndex } = useParams<{ rowIndex: string }>()
  const navigate = useNavigate()
  const { headers, suppliers, loading } = useSuppliers()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const supplier = suppliers.find(s => s._rowIndex === Number(rowIndex))
  if (!supplier) {
    return (
      <div className="animate-fade-in text-center py-16">
        <p className="text-ink-muted font-medium">Proveedor no encontrado</p>
        <button onClick={() => navigate('/')} className="text-accent text-sm mt-2 hover:underline cursor-pointer">
          Volver a la lista
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-overlay transition-all duration-[--duration-fast] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Generar mensaje</h1>
          <p className="text-ink-muted text-sm">{String(supplier[headers[0]] ?? '')}</p>
        </div>
      </div>

      {/* Supplier card */}
      <div className="bg-surface-raised rounded-xl border border-border p-5">
        <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Datos del proveedor</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          {headers.map(h => (
            <div key={h}>
              <dt className="text-xs text-ink-faint">{h}</dt>
              <dd className="text-sm font-medium text-ink mt-0.5">{String(supplier[h] ?? '-')}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Message generator */}
      <MessageGenerator supplier={supplier} headers={headers} />
    </div>
  )
}

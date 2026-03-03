import { useParams, useNavigate } from 'react-router-dom'
import { useSuppliers } from '../hooks/useSuppliers'
import SupplierForm from '../components/SupplierForm'

export default function SupplierDetailPage() {
  const { rowIndex } = useParams<{ rowIndex: string }>()
  const navigate = useNavigate()
  const { headers, suppliers, loading, updateSupplier } = useSuppliers()

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

  const initialData: Record<string, string> = {}
  headers.forEach(h => { initialData[h] = String(supplier[h] ?? '') })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-overlay transition-all duration-[--duration-fast] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Editar proveedor</h1>
      </div>
      <SupplierForm
        headers={headers}
        initialData={initialData}
        onSubmit={async (data) => {
          await updateSupplier(Number(rowIndex), data)
          navigate('/')
        }}
        onCancel={() => navigate('/')}
      />
    </div>
  )
}

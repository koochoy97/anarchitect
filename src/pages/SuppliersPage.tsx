import { useState } from 'react'
import { useSuppliers } from '../hooks/useSuppliers'
import SupplierList from '../components/SupplierList'
import SupplierForm from '../components/SupplierForm'

export default function SuppliersPage() {
  const { headers, suppliers, loading, error, addSupplier, deleteSupplier } = useSuppliers()
  const [showForm, setShowForm] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-muted text-sm">Cargando proveedores...</p>
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
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Proveedores</h1>
          <p className="text-ink-muted text-sm mt-0.5">
            {suppliers.length} {suppliers.length === 1 ? 'proveedor' : 'proveedores'} registrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-[--duration-fast] cursor-pointer shadow-sm hover:shadow-md ${
            showForm
              ? 'bg-surface-overlay text-ink-muted hover:bg-border'
              : 'bg-accent text-ink-invert hover:bg-accent-hover'
          }`}
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <SupplierForm
          headers={headers}
          onSubmit={async (data) => {
            await addSupplier(data)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* List */}
      <SupplierList headers={headers} suppliers={suppliers} onDelete={deleteSupplier} />
    </div>
  )
}

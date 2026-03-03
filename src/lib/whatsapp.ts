export const DEFAULT_TEMPLATE = `Solicitud #{{solicitud_numero}} / {{fecha}}
{{producto}}
Nombre y Apellido: {{nombre_apellido}}
RUC: {{ruc}}
PRESUPUESTO TOTAL: S/{{presupuesto}} nuevos soles
Descripcion: {{descripcion}}

Adelantos/ fechas: {{adelantos}}

SALDO PENDIENTE A FUTURO: {{saldo_pendiente}}
Número de Cuenta {{banco}}:{{numero_cuenta}}{{cci_line}}
Titular de la cta: {{titular_cuenta}}`

export interface TemplateField {
  key: string
  label: string
  section: 'solicitud' | 'proveedor'
  defaultFromHeader?: string
  placeholder?: string
}

export const TEMPLATE_FIELDS: TemplateField[] = [
  // Datos de la solicitud — se llenan manualmente
  { key: 'solicitud_numero', label: 'Numero de Solicitud', section: 'solicitud', placeholder: '03-437' },
  { key: 'fecha', label: 'Fecha', section: 'solicitud', placeholder: '28-02-2026' },
  { key: 'producto', label: 'Producto', section: 'solicitud', placeholder: 'Rollo de Papel craft' },
  { key: 'presupuesto', label: 'Presupuesto Total', section: 'solicitud', placeholder: '200.00' },
  { key: 'descripcion', label: 'Descripcion', section: 'solicitud', placeholder: 'Adelanto de planos...' },
  { key: 'adelantos', label: 'Adelantos / Fechas', section: 'solicitud', placeholder: '' },
  { key: 'saldo_pendiente', label: 'Saldo Pendiente a Futuro', section: 'solicitud', placeholder: 'Cancelado' },
  // Datos del proveedor — prellenados del sheet
  { key: 'nombre_apellido', label: 'Nombre y Apellido', section: 'proveedor', defaultFromHeader: 'Proveedor' },
  { key: 'ruc', label: 'RUC', section: 'proveedor', defaultFromHeader: 'Ruc' },
  { key: 'banco', label: 'Banco', section: 'proveedor', defaultFromHeader: 'Banco' },
  { key: 'numero_cuenta', label: 'Numero de Cuenta', section: 'proveedor', defaultFromHeader: 'numero de cuenta' },
  { key: 'cci', label: 'CCI', section: 'proveedor', defaultFromHeader: 'CCI' },
  { key: 'titular_cuenta', label: 'Titular de la Cuenta', section: 'proveedor', defaultFromHeader: 'titular de la cuenta' },
]

export function renderTemplate(template: string, data: Record<string, string>): string {
  const enriched: Record<string, string> = { ...data, cci_line: data.cci ? ` CCI:${data.cci}` : '' }
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => enriched[key] ?? match)
}

export function getTemplateVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g)
  return [...new Set([...matches].map(m => m[1]))]
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }
}

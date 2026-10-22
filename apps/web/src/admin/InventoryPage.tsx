import { useQueryClient } from '@tanstack/react-query'
import { useProducts } from '../api/catalog'
import { supabase } from '../lib/supabase'
import type { Product } from '../lib/types'

/** Disponibilidad manual: un toque marca un perfume como disponible o agotado. */
export function InventoryPage() {
  const { data, isPending } = useProducts()
  const qc = useQueryClient()

  async function toggle(p: Product, field: 'available' | 'featured') {
    const { error } = await supabase!.from('products').update({ [field]: !p[field] }).eq('id', p.id)
    if (error) alert(`No se pudo guardar: ${error.message}`)
    qc.invalidateQueries({ queryKey: ['products'] })
  }

  return (
    <section>
      <div className="admin__head"><h1>Inventario</h1></div>
      {isPending && <p className="muted">Cargando…</p>}
      <table className="admin-table">
        <thead><tr><th>Producto</th><th>Sección</th><th>Disponible</th><th>Destacado</th></tr></thead>
        <tbody>
          {data?.map((p) => (
            <tr key={p.id}>
              <td><b>{p.name}</b> <span className="muted">{p.volume_ml ? `${p.volume_ml} ml` : ''}</span></td>
              <td className="muted">{p.gender}</td>
              <td><input type="checkbox" className="switch" checked={p.available} onChange={() => toggle(p, 'available')} aria-label={`${p.name} disponible`} /></td>
              <td><input type="checkbox" className="switch" checked={p.featured} onChange={() => toggle(p, 'featured')} aria-label={`${p.name} destacado`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

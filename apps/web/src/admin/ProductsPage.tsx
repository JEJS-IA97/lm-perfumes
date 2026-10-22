import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useProducts } from '../api/catalog'
import { formatUsd } from '../lib/order'
import { imageUrl } from '../lib/supabase'

export function ProductsPage() {
  const { data, isPending, isError } = useProducts()

  return (
    <section>
      <div className="admin__head">
        <h1>Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary"><Plus size={18} /> Nuevo producto</Link>
      </div>
      {isPending && <p className="muted">Cargando…</p>}
      {isError && <p className="alert">No se pudo cargar la lista.</p>}
      {data?.length === 0 && <p className="muted">Todavía no hay productos. Crea el primero.</p>}
      <ul className="admin-list">
        {data?.map((p) => (
          <li key={p.id}>
            <Link to={`/admin/productos/${p.id}`} className="admin-list__row">
              <img src={imageUrl(p.images[0])} alt="" width="48" height="60" />
              <span><b>{p.name}</b><small className="muted">{p.brand} · {p.gender}</small></span>
              <span className="num">{formatUsd(p.price_usd)}</span>
              <span className={p.available ? 'pill pill--ok' : 'pill'}>{p.available ? 'Disponible' : 'Agotado'}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

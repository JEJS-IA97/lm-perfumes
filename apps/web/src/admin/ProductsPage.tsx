import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useProducts } from '../api/catalog'
import { Select } from '../components/ui/Select'
import { formatUsd } from '../lib/order'
import { imageUrl } from '../lib/supabase'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function ProductsPage() {
  const { data, isPending, isError } = useProducts()
  const [q, setQ] = useState('')
  const [gender, setGender] = useState('todos')
  const [status, setStatus] = useState('todos')

  const list = useMemo(() => {
    const term = norm(q.trim())
    return (data ?? []).filter((p) =>
      (gender === 'todos' || p.gender === gender) &&
      (status === 'todos' || (status === 'disponible') === p.available) &&
      (!term || norm(`${p.name} ${p.brand}`).includes(term)),
    )
  }, [data, q, gender, status])

  return (
    <section>
      <div className="admin__head">
        <h1>Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary"><Plus size={18} /> Nuevo producto</Link>
      </div>

      <div className="admin-filters">
        <label className="admin-search">
          <Search size={18} aria-hidden="true" />
          <input className="input" type="search" placeholder="Buscar por nombre o marca" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar productos" />
        </label>
        <Select value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Filtrar por sección">
          <option value="todos">Todas las secciones</option>
          <option value="damas">Damas</option>
          <option value="caballeros">Caballeros</option>
          <option value="unisex">Unisex</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por disponibilidad">
          <option value="todos">Disponibles y agotados</option>
          <option value="disponible">Solo disponibles</option>
          <option value="agotado">Solo agotados</option>
        </Select>
      </div>

      {isPending && <p className="muted">Cargando…</p>}
      {isError && <p className="alert">No se pudo cargar la lista.</p>}
      {data?.length === 0 && <p className="muted">Todavía no hay productos. Crea el primero.</p>}
      {data && data.length > 0 && (
        <p className="muted admin-count num">{list.length} de {data.length} productos</p>
      )}
      {data && data.length > 0 && list.length === 0 && <p className="muted">Ningún producto coincide con el filtro.</p>}

      <ul className="admin-list admin-list--scroll">
        {list.map((p) => (
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

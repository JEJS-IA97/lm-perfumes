import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../api/catalog'
import { ProductGrid } from '../components/product/ProductGrid'
import { Pagination } from '../components/ui/Pagination'
import { Select } from '../components/ui/Select'
import type { Gender, Product } from '../lib/types'
import './pages.css'

const PAGE_SIZE = 12 // cuadra con 2, 3 y 4 columnas

const copy = {
  damas: { title: 'Damas', lead: 'Florales, frutales, dulces y luminosas.' },
  caballeros: { title: 'Caballeros', lead: 'Amaderadas, frescas, especiadas e intensas.' },
  unisex: { title: 'Unisex', lead: 'Cítricas, limpias y versátiles, para cualquier persona.' },
} as const

const sorts: Record<string, (a: Product, b: Product) => number> = {
  destacados: (a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order,
  'precio-asc': (a, b) => a.price_usd - b.price_usd,
  'precio-desc': (a, b) => b.price_usd - a.price_usd,
}

export function Collection({ gender }: { gender: Gender }) {
  // Orden y página en la URL (?orden=…&pagina=2): sobreviven a "atrás" y se pueden compartir.
  const [params, setParams] = useSearchParams()
  const sort = sorts[params.get('orden') ?? ''] ? params.get('orden')! : 'destacados'
  const products = useProducts(gender)
  const total = Math.max(1, Math.ceil((products.data?.length ?? 0) / PAGE_SIZE))
  const page = Math.min(total, Math.max(1, Number(params.get('pagina')) || 1))
  const gridTop = useRef<HTMLDivElement>(null)

  const update = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) (v ? p.set(k, v) : p.delete(k))
    setParams(p)
  }
  const goTo = (p: number) => {
    update({ pagina: p > 1 ? String(p) : null })
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // shortcut: se traen todos los productos de la sección y se pagina en el navegador; con miles, paginar en Supabase (.range()).
  return (
    <div data-section={gender}>
      <section className={`collection-hero collection-hero--${gender}`}>
        <div className="container">
          <h1 className="display">{copy[gender].title}</h1>
          <p>{copy[gender].lead}</p>
        </div>
      </section>
      <section className="section container">
        <div className="toolbar" ref={gridTop}>
          <span className="muted num">{products.data ? `${products.data.length} ${products.data.length === 1 ? 'fragancia' : 'fragancias'}` : ''}</span>
          <label className="toolbar__sort">
            <span className="muted">Ordenar</span>
            <Select value={sort} onChange={(e) => update({ orden: e.target.value === 'destacados' ? null : e.target.value, pagina: null })}>
              <option value="destacados">Destacados</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </Select>
          </label>
        </div>
        <ProductGrid
          query={products}
          section={gender}
          select={(list) => [...list].sort(sorts[sort]).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        />
        <Pagination page={page} total={total} onChange={goTo} />
      </section>
    </div>
  )
}

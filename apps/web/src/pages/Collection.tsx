import { useState } from 'react'
import { useProducts } from '../api/catalog'
import { ProductGrid } from '../components/product/ProductGrid'
import type { Gender, Product } from '../lib/types'
import './pages.css'

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
  const [sort, setSort] = useState('destacados')
  const products = useProducts(gender)

  return (
    <div data-section={gender}>
      <section className={`collection-hero collection-hero--${gender}`}>
        <div className="container">
          <h1 className="display">{copy[gender].title}</h1>
          <p>{copy[gender].lead}</p>
        </div>
      </section>
      <section className="section container">
        <div className="toolbar">
          <span className="muted num">{products.data ? `${products.data.length} ${products.data.length === 1 ? 'fragancia' : 'fragancias'}` : ''}</span>
          <label className="toolbar__sort">
            <span className="muted">Ordenar</span>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="destacados">Destacados</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </select>
          </label>
        </div>
        <ProductGrid query={products} select={(list) => [...list].sort(sorts[sort])} />
      </section>
    </div>
  )
}

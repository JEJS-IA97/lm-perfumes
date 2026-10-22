import type { UseQueryResult } from '@tanstack/react-query'
import type { Product } from '../../lib/types'
import { ProductCard } from './ProductCard'
import './product.css'

/** Rejilla con sus estados: cargando, error y vacío. */
export function ProductGrid({
  query,
  select = (list) => list,
  empty = 'Pronto habrá fragancias aquí.',
}: {
  query: UseQueryResult<Product[]>
  select?: (list: Product[]) => Product[]
  empty?: string
}) {
  if (query.isPending)
    return (
      <div className="grid" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton card__media" />)}
      </div>
    )
  if (query.isError)
    return (
      <p className="alert" role="alert">
        No pudimos cargar el catálogo. <button className="link" onClick={() => query.refetch()}>Reintentar</button>
      </p>
    )
  const products = select(query.data)
  if (products.length === 0) return <p className="muted">{empty}</p>

  return (
    <div className="grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

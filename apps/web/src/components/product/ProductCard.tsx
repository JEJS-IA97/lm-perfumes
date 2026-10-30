import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { imageUrl } from '../../lib/supabase'
import type { Gender, Product } from '../../lib/types'
import { useCart } from '../../store/cart'
import { Price } from './Price'
import './product.css'

/** `section`: color de la colección donde se muestra (un unisex dentro de Damas se ve rosa). Sin él, usa el del producto. */
export function ProductCard({ product, section }: { product: Product; section?: Gender }) {
  const add = useCart((s) => s.add)
  const meta = [product.concentration, product.volume_ml && `${product.volume_ml} ml`].filter(Boolean).join(' · ')

  return (
    <article className="card" data-section={section ?? product.gender}>
      <Link to={`/producto/${product.slug}`} className="card__media">
        <img src={imageUrl(product.images[0])} alt={product.name} loading="lazy" width="600" height="750" />
        {!product.available && <span className="card__badge">Agotado</span>}
      </Link>
      <div className="card__body">
        <p className="card__brand truncate" title={product.brand}>{product.brand || ' '}</p>
        <h3 className="card__name truncate" title={product.name}><Link to={`/producto/${product.slug}`}>{product.name}</Link></h3>
        <p className="card__meta muted truncate" title={meta}>{meta || ' '}</p>
        <div className="card__foot">
          <Price usd={product.price_usd} compareAt={product.compare_at_usd} />
          <button
            className="card__add"
            onClick={() => add(product)}
            disabled={!product.available}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </article>
  )
}

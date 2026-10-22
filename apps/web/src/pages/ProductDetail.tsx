import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { useProduct } from '../api/catalog'
import { Price } from '../components/product/Price'
import { imageUrl } from '../lib/supabase'
import { useCart } from '../store/cart'
import { NotFound } from './NotFound'
import './pages.css'

export function ProductDetail() {
  const { slug = '' } = useParams()
  const { data: product, isPending, isError } = useProduct(slug)
  const add = useCart((s) => s.add)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)

  if (isPending) return <div className="container pdp"><div className="skeleton pdp__main" /></div>
  if (isError) return <div className="container section"><p className="alert" role="alert">No pudimos cargar este producto. Recarga la página.</p></div>
  if (!product) return <NotFound />

  const images = product.images.length ? product.images : [undefined]
  const back = `/${product.gender}`
  const backLabel = { damas: 'Damas', caballeros: 'Caballeros', unisex: 'Unisex' }[product.gender]
  const notes = [['Salida', product.notes_top], ['Corazón', product.notes_heart], ['Fondo', product.notes_base]].filter(([, v]) => v)

  return (
    <div className="container pdp" data-section={product.gender}>
      <Link to={back} className="pdp__back muted"><ChevronLeft size={18} /> {backLabel}</Link>
      <div className="pdp__grid">
        <div className="pdp__gallery">
          <img className="pdp__main" src={imageUrl(images[active])} alt={product.name} width="900" height="1125" />
          {images.length > 1 && (
            <div className="pdp__thumbs">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} aria-label={`Ver imagen ${i + 1}`} aria-current={i === active}>
                  <img src={imageUrl(src)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__info">
          {product.brand && <p className="card__brand">{product.brand}</p>}
          <h1 className="display">{product.name}</h1>
          <p className="muted">{[product.concentration, product.volume_ml && `${product.volume_ml} ml`].filter(Boolean).join(' · ')}</p>
          <Price usd={product.price_usd} compareAt={product.compare_at_usd} size="lg" />
          <p className={product.available ? 'stock stock--ok' : 'stock'}>{product.available ? 'Disponible' : 'Agotado por ahora'}</p>

          <div className="pdp__buy">
            <div className="stepper" role="group" aria-label="Cantidad">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Restar uno"><Minus size={16} /></button>
              <span className="num">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Sumar uno"><Plus size={16} /></button>
            </div>
            <button className="btn btn-primary" disabled={!product.available} onClick={() => add(product, qty)}>
              Agregar al carrito
            </button>
          </div>

          {notes.length > 0 && (
            <dl className="notes">
              {notes.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
            </dl>
          )}
          {product.description && <p className="pdp__desc">{product.description}</p>}
        </div>
      </div>
    </div>
  )
}

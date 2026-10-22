import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useSettings } from '../../api/catalog'
import { formatUsd, formatVes, toVes } from '../../lib/order'
import { imageUrl } from '../../lib/supabase'
import { cartTotal, useCart } from '../../store/cart'
import './cart.css'

// <dialog> nativo: trae foco atrapado, Escape y fondo inerte sin librerías.
export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart()
  const { data: settings } = useSettings()
  const ref = useRef<HTMLDialogElement>(null)
  const total = cartTotal(lines)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="cart-title"
      onClose={() => setOpen(false)}
      onClick={(e) => e.target === ref.current && setOpen(false)}
    >
      <div className="drawer__panel">
        <div className="drawer__head">
          <h2 id="cart-title" className="display">Tu carrito</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar carrito"><X size={22} /></button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <p className="muted">Aún no has agregado fragancias.</p>
            <Link to="/" className="btn btn-outline" onClick={() => setOpen(false)}>Ver catálogo</Link>
          </div>
        ) : (
          <>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <li key={l.id} className="line">
                  <img src={imageUrl(l.image)} alt="" width="72" height="90" />
                  <div className="line__info">
                    <Link to={`/producto/${l.slug}`} className="line__name" onClick={() => setOpen(false)}>{l.name}</Link>
                    <span className="muted line__meta">{[l.brand, l.volume_ml && `${l.volume_ml} ml`].filter(Boolean).join(' · ')}</span>
                    <div className="line__row">
                      <div className="stepper" role="group" aria-label={`Cantidad de ${l.name}`}>
                        <button onClick={() => setQty(l.id, l.qty - 1)} disabled={l.qty <= 1} aria-label="Restar uno"><Minus size={16} /></button>
                        <span className="num" aria-live="polite">{l.qty}</span>
                        <button onClick={() => setQty(l.id, l.qty + 1)} aria-label="Sumar uno"><Plus size={16} /></button>
                      </div>
                      <span className="num line__total">{formatUsd(l.qty * l.price_usd)}</span>
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => remove(l.id)} aria-label={`Quitar ${l.name}`}><Trash2 size={18} /></button>
                </li>
              ))}
            </ul>
            <div className="drawer__foot">
              <div className="drawer__total">
                <span>Total</span>
                <span className="num">
                  <b>{formatUsd(total)}</b>
                  {settings && <small className="muted">{formatVes(toVes(total, settings.exchange_rate))}</small>}
                </span>
              </div>
              <Link to="/pedido" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>Continuar con el pedido</Link>
              <p className="muted drawer__hint">Confirmas los datos y el pedido llega a nuestro WhatsApp.</p>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

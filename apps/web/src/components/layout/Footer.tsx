import { useSyncExternalStore, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useSettings } from '../../api/catalog'
import { formatVes } from '../../lib/order'
import './layout.css'

const DESKTOP = '(min-width: 768px)'
const subscribe = (cb: () => void) => {
  const m = matchMedia(DESKTOP)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const useDesktop = () => useSyncExternalStore(subscribe, () => matchMedia(DESKTOP).matches)

/** En móvil cada columna es un acordeón; en escritorio siempre está abierta (la `key` la remonta al cambiar). */
function Col({ title, desktop, children }: { title: string; desktop: boolean; children: ReactNode }) {
  return (
    <details key={String(desktop)} className="site-footer__col" open={desktop}>
      <summary>
        <h2>{title}</h2>
        <Plus className="site-footer__plus" size={18} aria-hidden="true" />
      </summary>
      <div className="site-footer__links">{children}</div>
    </details>
  )
}

export function Footer() {
  const { data: settings } = useSettings()
  const desktop = useDesktop()
  const wa = settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : null

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__about">
          <img src="/images/lm-logo.png" alt="LM Perfumes" width="56" height="56" />
          <div>
            <p className="display site-footer__brand">Tu fragancia, tu firma.</p>
          </div>
        </div>
        <Col title="Tienda" desktop={desktop}>
          <Link to="/damas">Damas</Link>
          <Link to="/caballeros">Caballeros</Link>
          <Link to="/unisex">Unisex</Link>
          <Link to="/pedido">Mi carrito</Link>
        </Col>
        <Col title="Pagos y entrega" desktop={desktop}>
          <span>Pago móvil · Binance</span>
          <span>Transferencia en Bs · Efectivo USD</span>
          <span>Retiro, delivery o envío nacional</span>
        </Col>
        <Col title="Contacto" desktop={desktop}>
          {wa ? <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a> : <span>WhatsApp</span>}
        </Col>
      </div>
      <div className="container site-footer__legal">
        <span>© {new Date().getFullYear()} LM Perfumes</span>
        {settings && (
          <span className="num">
            Tasa BCV {formatVes(settings.exchange_rate)}
            {settings.rate_date && ` · ${new Date(settings.rate_date).toLocaleDateString('es-VE')}`}
          </span>
        )}
      </div>
    </footer>
  )
}

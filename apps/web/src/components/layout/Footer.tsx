import { Link } from 'react-router-dom'
import { useSettings } from '../../api/catalog'
import './layout.css'

export function Footer() {
  const { data: settings } = useSettings()
  const wa = settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}` : null

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__about">
          <img src="/images/lm-logo.png" alt="LM Perfumes" width="56" height="56" />
          <p className="display site-footer__brand">Tu fragancia, tu firma.</p>
          <p>Pedidos por WhatsApp. Pagos en dólares o bolívares.</p>
        </div>
        <nav aria-label="Colecciones" className="site-footer__col">
          <h2>Tienda</h2>
          <Link to="/damas">Damas</Link>
          <Link to="/caballeros">Caballeros</Link>
          <Link to="/unisex">Unisex</Link>
          <Link to="/pedido">Mi carrito</Link>
        </nav>
        <div className="site-footer__col">
          <h2>Pagos y entrega</h2>
          <span>Pago móvil · Zelle</span>
          <span>Transferencia en Bs · Efectivo USD</span>
          <span>Retiro, delivery o envío nacional</span>
        </div>
        <div className="site-footer__col">
          <h2>Contacto</h2>
          {wa ? <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a> : <span>WhatsApp</span>}
        </div>
      </div>
      <div className="container site-footer__legal">
        <span>© {new Date().getFullYear()} LM Perfumes</span>
        <span>Precios en Bs según la tasa del día.</span>
      </div>
    </footer>
  )
}

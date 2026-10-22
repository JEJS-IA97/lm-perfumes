import { Link } from 'react-router-dom'
import { useSettings } from '../../api/catalog'
import './layout.css'

export function Footer() {
  const { data: settings } = useSettings()
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <p className="display site-footer__brand">LM Perfumes</p>
          <p className="muted">Pedidos por WhatsApp. Pagos en dólares o bolívares.</p>
        </div>
        <nav aria-label="Pie de página" className="site-footer__nav">
          <Link to="/damas">Damas</Link>
          <Link to="/caballeros">Caballeros</Link>
          {settings?.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">WhatsApp</a>
          )}
        </nav>
      </div>
      <div className="container site-footer__legal muted">© {new Date().getFullYear()} LM Perfumes</div>
    </footer>
  )
}

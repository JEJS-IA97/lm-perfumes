import { Link } from 'react-router-dom'
import { ArrowRight, Banknote, MessageCircle, Truck } from 'lucide-react'
import { useProducts } from '../api/catalog'
import { ProductGrid } from '../components/product/ProductGrid'
import { Hero } from '../components/home/Hero'
import { useTheme } from '../lib/useTheme'
import './pages.css'

// Fotos ilustrativas: reemplazar por fotos propias en /public/images.
const DAMAS_IMG = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=80'
const CABALLEROS_IMG = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80'

export function Home() {
  useTheme('light')
  const products = useProducts()

  return (
    <>
      <Hero />

      <section className="services container" aria-label="Cómo trabajamos">
        <div><Banknote aria-hidden="true" /><p><b>USD o bolívares</b><span className="muted">Pago móvil, Zelle, transferencia o efectivo.</span></p></div>
        <div><Truck aria-hidden="true" /><p><b>Retiro, delivery o envío</b><span className="muted">Envíos nacionales coordinados contigo.</span></p></div>
        <div><MessageCircle aria-hidden="true" /><p><b>Pedido por WhatsApp</b><span className="muted">Sin crear cuenta. Te respondemos directo.</span></p></div>
      </section>

      <section className="split container" aria-label="Colecciones">
        <Link to="/damas" className="split__tile">
          <img src={DAMAS_IMG} alt="" loading="lazy" />
          <span className="split__label"><span className="display">Damas</span> Florales, frutales y dulces <ArrowRight size={18} /></span>
        </Link>
        <Link to="/caballeros" className="split__tile" data-theme="dark">
          <img src={CABALLEROS_IMG} alt="" loading="lazy" />
          <span className="split__label"><span className="display">Caballeros</span> Amaderados, frescos e intensos <ArrowRight size={18} /></span>
        </Link>
      </section>

      <section className="section container">
        <div className="section__head">
          <h2 className="display">Los más pedidos</h2>
          <Link to="/damas" className="link">Ver todo</Link>
        </div>
        <ProductGrid query={products} select={(list) => list.filter((p) => p.featured).slice(0, 8)} empty="Marca productos como destacados en el panel para mostrarlos aquí." />
      </section>

      <section className="section container steps">
        <h2 className="display">Comprar toma tres pasos</h2>
        <ol>
          <li><b>Agrega al carrito</b><span className="muted">Los perfumes que quieras, sin registrarte.</span></li>
          <li><b>Completa tus datos</b><span className="muted">Nombre, teléfono, ciudad, entrega y forma de pago.</span></li>
          <li><b>Envía por WhatsApp</b><span className="muted">El pedido llega listo y te confirmamos disponibilidad y pago.</span></li>
        </ol>
      </section>
    </>
  )
}

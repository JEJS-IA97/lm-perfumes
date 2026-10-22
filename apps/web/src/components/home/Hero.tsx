import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Bottle } from './Bottle'
import './hero.css'

/** Dos mundos en un escenario: Damas (claro) a la izquierda, Caballeros (oscuro) a la derecha. */
export function Hero() {
  return (
    <section className="hero2 container" aria-labelledby="hero-title">
      <div className="hero2__stage">
        <div className="hero2__copy">
          <h1 id="hero-title" className="display">Fragancias que se quedan contigo.</h1>
          <p>Paga en dólares o bolívares. Tu pedido llega directo a nuestro WhatsApp.</p>
        </div>
        <p className="hero2__aside">Sin crear cuenta.<br />Retiro, delivery o envío nacional.</p>

        <p className="hero2__word display" aria-hidden="true">Esencia</p>
        <Bottle className="hero2__bottle" />

        <Link to="/damas" className="hero2__door hero2__door--damas">
          <span className="display">Damas</span>
          <small>Florales, frutales, dulces</small>
          <ArrowRight className="hero2__arrow" size={22} />
        </Link>
        <Link to="/caballeros" className="hero2__door hero2__door--caballeros">
          <span className="display">Caballeros</span>
          <small>Amaderadas, frescas, intensas</small>
          <ArrowRight className="hero2__arrow" size={22} />
        </Link>
      </div>
    </section>
  )
}

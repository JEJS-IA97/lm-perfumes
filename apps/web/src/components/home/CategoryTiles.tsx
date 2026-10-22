import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Product } from '../../lib/types'
import { Bottle } from './Bottle'
import './home.css'

const TILES = [
  { gender: 'damas', title: 'Damas', lead: 'Florales, frutales y dulces' },
  { gender: 'caballeros', title: 'Caballeros', lead: 'Amaderadas, frescas e intensas' },
  { gender: 'unisex', title: 'Unisex', lead: 'Cítricas, limpias y versátiles' },
] as const

const BOTTLE_TONE = { damas: 'damas', caballeros: 'caballeros', unisex: 'marca' } as const

/** Accesos a cada colección: mismo diseño para ambas, cambia solo la paleta y el color del frasco. */
export function CategoryTiles({ products = [] }: { products?: Product[] }) {
  return (
    <section className="tiles container" aria-label="Colecciones">
      {TILES.map((t) => {
        const count = products.filter((p) => p.gender === t.gender || (t.gender !== 'unisex' && p.gender === 'unisex')).length
        return (
          <Link key={t.gender} to={`/${t.gender}`} className={`tile tile--${t.gender}`} data-section={t.gender}>
            <span className="tile__copy">
              <span className="display tile__title">{t.title}</span>
              <span className="tile__lead">{t.lead}</span>
              <span className="tile__count num">{count} {count === 1 ? 'fragancia' : 'fragancias'}</span>
              <span className="tile__cta">Ver colección <ArrowRight size={16} /></span>
            </span>
            <span className="tile__media"><Bottle tone={BOTTLE_TONE[t.gender]} /></span>
          </Link>
        )
      })}
    </section>
  )
}

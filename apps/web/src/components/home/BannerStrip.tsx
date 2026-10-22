import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { imageUrl } from '../../lib/supabase'
import type { Banner, BannerTone } from '../../lib/types'
import './home.css'

// Fotos de Unsplash (licencia libre) elegidas porque no muestran marcas. Se usan si el banner no tiene imagen propia.
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=75`
const FALLBACK_IMG: Record<BannerTone, string> = {
  damas: unsplash('1615108395437-df128ad79e80'),
  caballeros: unsplash('1705899844877-81bb0a0665c1'),
  marca: unsplash('1705899844877-81bb0a0665c1'),
}

export const DEFAULT_BANNERS: Banner[] = [
  { id: 'default-1', title: 'Florales que se quedan en la piel', subtitle: 'Fragancias de azahar, rosa y jazmín para el día a día o para regalar.', cta_label: 'Ver damas', cta_url: '/damas', image: '', tone: 'damas', active: true, sort_order: 0 },
  { id: 'default-2', title: 'Amaderadas, frescas e intensas', subtitle: 'Notas de cedro, vetiver y especias para él.', cta_label: 'Ver caballeros', cta_url: '/caballeros', image: '', tone: 'caballeros', active: true, sort_order: 1 },
]

/** Banner horizontal a todo el ancho, entre secciones: foto de fondo y texto sobre un velo del color del tono. */
export function BannerStrip({ banner: b }: { banner: Banner }) {
  const cta = <>{b.cta_label} <ArrowRight size={18} /></>
  return (
    <section className="container strip-wrap" aria-label={b.title}>
      <div className={`strip strip--${b.tone}`}>
        <img className="strip__img" src={b.image ? imageUrl(b.image) : FALLBACK_IMG[b.tone]} alt="" loading="lazy" />
        <div className="strip__copy">
          <h2 className="display">{b.title}</h2>
          {b.subtitle && <p>{b.subtitle}</p>}
          {b.cta_url.startsWith('http')
            ? <a className="btn strip__cta" href={b.cta_url} target="_blank" rel="noreferrer">{cta}</a>
            : <Link className="btn strip__cta" to={b.cta_url}>{cta}</Link>}
        </div>
      </div>
    </section>
  )
}

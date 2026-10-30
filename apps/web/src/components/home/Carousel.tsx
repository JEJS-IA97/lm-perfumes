import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './home.css'

const AUTOPLAY_MS = 4500

/** Carrusel con scroll nativo (arrastre táctil y snap). Las flechas dan la vuelta al llegar a un extremo
 *  y avanza solo; se pausa con el ratón encima, al tocarlo o al enfocarlo con el teclado. */
export function Carousel({ title, link, children }: { title: string; link?: { to: string; label: string }; children: ReactNode[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  const move = (dir: 1 | -1) => {
    const t = track.current
    if (!t) return
    const end = t.scrollWidth - t.clientWidth - 4 // margen por redondeo de píxeles
    if (dir === 1 && t.scrollLeft >= end) t.scrollTo({ left: 0, behavior: 'smooth' })
    else if (dir === -1 && t.scrollLeft <= 4) t.scrollTo({ left: t.scrollWidth, behavior: 'smooth' })
    else {
      const item = t.firstElementChild as HTMLElement | null
      const step = item ? item.offsetWidth + parseFloat(getComputedStyle(t).columnGap || '0') : t.clientWidth * 0.8
      t.scrollBy({ left: dir * step, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => move(1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section
      className="carousel container"
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="carousel__head">
        <h2 className="display">{title}</h2>
        <div className="carousel__actions">
          {link && <Link to={link.to} className="link">{link.label}</Link>}
          <div className="carousel__nav">
            <button onClick={() => move(-1)} aria-label="Anteriores"><ChevronLeft size={20} /></button>
            <button onClick={() => move(1)} aria-label="Siguientes"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
      <div className="carousel__track" ref={track} tabIndex={0}>
        {children.map((child, i) => <div className="carousel__item" key={i}>{child}</div>)}
      </div>
    </section>
  )
}

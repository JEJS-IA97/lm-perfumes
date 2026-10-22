import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './home.css'

/** Carrusel con scroll nativo (arrastre táctil, snap y teclado gratis); las flechas solo desplazan. */
export function Carousel({ title, link, children }: { title: string; link?: { to: string; label: string }; children: ReactNode[] }) {
  const track = useRef<HTMLDivElement>(null)
  const move = (dir: 1 | -1) => {
    const t = track.current
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="carousel container" aria-label={title}>
      <div className="carousel__head">
        <h2 className="display">{title}</h2>
        {link && <Link to={link.to} className="link">{link.label}</Link>}
        <div className="carousel__nav">
          <button onClick={() => move(-1)} aria-label="Anteriores"><ChevronLeft size={20} /></button>
          <button onClick={() => move(1)} aria-label="Siguientes"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="carousel__track" ref={track} tabIndex={0}>
        {children.map((child, i) => <div className="carousel__item" key={i}>{child}</div>)}
      </div>
    </section>
  )
}

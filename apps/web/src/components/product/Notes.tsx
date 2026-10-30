import {
  Apple, Briefcase, Candy, Citrus, Coffee, Feather, Flame, Flower2, Gem, Leaf, Sparkles, TreePine, Waves, type LucideIcon,
} from 'lucide-react'
import { accords, familyOf, FAMILY_LABEL, splitNotes, type Family } from '../../lib/notes'
import './notes.css'

const ICON: Record<Family, LucideIcon> = {
  citrico: Citrus, frutal: Apple, floral: Flower2, aromatico: Leaf, especiado: Flame, dulce: Candy, cafe: Coffee,
  amaderado: TreePine, ambar: Gem, almizcle: Feather, marino: Waves, cuero: Briefcase, otra: Sparkles,
}

/** Pirámide olfativa con iconos automáticos (por familia) + barras de acordes calculadas de las mismas notas. */
export function Notes({ top, heart, base }: { top: string; heart: string; base: string }) {
  const rows = [['Notas de salida', top], ['Corazón', heart], ['Fondo', base]].filter(([, v]) => v.trim())
  const main = accords(top, heart, base)
  if (rows.length === 0) return null

  return (
    <div className="olfactory">
      {main.length > 0 && (
        <section aria-label="Acordes principales" className="accords">
          <h2 className="olfactory__title">Acordes principales</h2>
          {main.map((a) => (
            <div key={a.family} className={`accord fam--${a.family}`} style={{ width: `${Math.max(a.weight, 38)}%` }}>
              {FAMILY_LABEL[a.family]}
            </div>
          ))}
        </section>
      )}

      {rows.map(([label, text]) => (
        <section key={label} className="tier" aria-label={label}>
          <h2 className="olfactory__title">{label}</h2>
          <ul>
            {splitNotes(text).map((note) => {
              const fam = familyOf(note)
              const Icon = ICON[fam]
              return (
                <li key={note} className={`fam--${fam}`} title={FAMILY_LABEL[fam]}>
                  <span className="note__icon"><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></span>
                  {note.charAt(0).toUpperCase() + note.slice(1)}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

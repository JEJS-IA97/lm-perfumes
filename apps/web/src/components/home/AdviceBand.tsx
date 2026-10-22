import { MessageCircle } from 'lucide-react'
import { useSettings } from '../../api/catalog'
import { Bottle } from './Bottle'
import './home.css'

/** Asesoría por WhatsApp: el equivalente a un "buscador de fragancias" sin formularios. */
export function AdviceBand() {
  const { data: settings } = useSettings()
  const text = encodeURIComponent('Hola, quiero ayuda para elegir un perfume.')
  const href = settings?.whatsapp_number ? `https://wa.me/${settings.whatsapp_number}?text=${text}` : undefined

  return (
    <section className="advice container">
      <div className="advice__inner">
        <div className="advice__bottles" aria-hidden="true">
          <Bottle tone="damas" />
          <Bottle tone="marca" />
          <Bottle tone="caballeros" />
        </div>
        <div className="advice__copy">
          <h2 className="display">¿No sabes cuál elegir?</h2>
          <p>Cuéntanos qué aromas te gustan o para quién es el regalo, y te recomendamos 2 o 3 opciones por WhatsApp.</p>
          {href && (
            <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">
              <MessageCircle size={18} /> Pedir recomendación
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

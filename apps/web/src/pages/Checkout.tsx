import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { z } from 'zod'
import { useSettings } from '../api/catalog'
import { createOrder } from '../api/orders'
import { buildWhatsAppMessage, formatUsd, formatVes, toVes, whatsappUrl } from '../lib/order'
import type { Customer, OrderReceipt } from '../lib/types'
import { useTheme } from '../lib/useTheme'
import { cartTotal, useCart } from '../store/cart'
import './pages.css'

const DELIVERY = ['retiro', 'delivery', 'envío nacional'] as const
const PAYMENT = ['pago móvil', 'zelle', 'efectivo USD', 'transferencia Bs'] as const

// Misma validación que create_order() en la base de datos; aquí solo para avisar antes de enviar.
const schema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  phone: z.string().trim().regex(/^\+?[\d\s-]{7,16}$/, 'Teléfono no válido, ej. 0412 123 4567'),
  id_doc: z.string().trim().max(20),
  city: z.string().trim().min(2, 'Escribe tu ciudad').max(60),
  address: z.string().trim().max(300),
  delivery: z.enum(DELIVERY),
  payment: z.enum(PAYMENT),
  notes: z.string().trim().max(500),
})

type Errors = Partial<Record<keyof Customer, string>>

export function Checkout() {
  useTheme('light')
  const { lines, clear } = useCart()
  const { data: settings } = useSettings()
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<{ receipt: OrderReceipt; url: string } | null>(null)
  const total = cartTotal(lines)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)))
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])))
      return
    }
    setErrors({})
    setSubmitError('')
    setSending(true)
    try {
      const receipt = await createOrder(parsed.data, lines)
      setDone({ receipt, url: whatsappUrl(settings?.whatsapp_number ?? '', buildWhatsAppMessage(receipt, parsed.data)) })
      clear()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar el pedido.')
    } finally {
      setSending(false)
    }
  }

  if (done)
    return (
      <section className="container section confirm">
        <h1 className="display">Pedido #{done.receipt.number} registrado</h1>
        <p>Último paso: envíalo por WhatsApp para que lo confirmemos.</p>
        <a href={done.url} target="_blank" rel="noreferrer" className="btn btn-primary">
          <MessageCircle size={20} /> Enviar pedido por WhatsApp
        </a>
        <p className="muted num">Total {formatUsd(done.receipt.total_usd)} · {formatVes(done.receipt.total_ves)}</p>
      </section>
    )

  if (lines.length === 0)
    return (
      <section className="container section">
        <h1 className="display">Tu carrito está vacío</h1>
        <Link to="/" className="btn btn-primary">Ver catálogo</Link>
      </section>
    )

  const field = (name: keyof Customer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} aria-invalid={!!errors[name]} aria-describedby={`${name}-err`} {...props} />
      {errors[name] && <small id={`${name}-err`} className="field__error">{errors[name]}</small>}
    </label>
  )

  return (
    <div className="container section checkout">
      <form className="checkout__form" onSubmit={onSubmit} noValidate>
        <h1 className="display">Datos del pedido</h1>
        {field('name', 'Nombre y apellido', { autoComplete: 'name', required: true })}
        <div className="checkout__row">
          {field('phone', 'Teléfono (WhatsApp)', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', required: true })}
          {field('id_doc', 'Cédula (opcional)', { inputMode: 'numeric' })}
        </div>
        {field('city', 'Ciudad', { autoComplete: 'address-level2', required: true })}
        {field('address', 'Dirección o punto de referencia (opcional)', { autoComplete: 'street-address' })}

        <fieldset className="choices">
          <legend>Entrega</legend>
          {DELIVERY.map((d, i) => (
            <label key={d}><input type="radio" name="delivery" value={d} defaultChecked={i === 0} /> {d[0].toUpperCase() + d.slice(1)}</label>
          ))}
        </fieldset>
        <fieldset className="choices">
          <legend>Forma de pago</legend>
          {PAYMENT.map((p, i) => (
            <label key={p}><input type="radio" name="payment" value={p} defaultChecked={i === 0} /> {p[0].toUpperCase() + p.slice(1)}</label>
          ))}
        </fieldset>
        <label className="field">
          <span>Notas (opcional)</span>
          <textarea className="input" name="notes" maxLength={500} placeholder="Ej.: es para regalo, horario de entrega…" />
        </label>

        {submitError && <p className="alert" role="alert">{submitError}</p>}
        <button className="btn btn-primary btn-block" disabled={sending}>
          {sending ? 'Registrando pedido…' : 'Registrar y enviar por WhatsApp'}
        </button>
      </form>

      <aside className="checkout__summary" aria-label="Resumen">
        <h2 className="display">Resumen</h2>
        <ul>
          {lines.map((l) => (
            <li key={l.id}><span>{l.qty} × {l.name}</span><span className="num">{formatUsd(l.qty * l.price_usd)}</span></li>
          ))}
        </ul>
        <p className="checkout__total"><span>Total</span><span className="num">{formatUsd(total)}</span></p>
        {settings && <p className="muted num">{formatVes(toVes(total, settings.exchange_rate))} · tasa {settings.exchange_rate}</p>}
        <p className="muted checkout__note">Confirmamos precio final y disponibilidad al recibir tu mensaje.</p>
      </aside>
    </div>
  )
}

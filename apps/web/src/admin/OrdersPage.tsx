import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { formatUsd, formatVes } from '../lib/order'
import { supabase } from '../lib/supabase'
import type { Order, OrderStatus } from '../lib/types'

const STATUSES: OrderStatus[] = ['nuevo', 'confirmado', 'entregado', 'cancelado']

export function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('nuevo')
  const qc = useQueryClient()
  const { data, isPending, isError } = useQuery({
    queryKey: ['orders', filter],
    queryFn: async (): Promise<Order[]> => {
      // shortcut: últimos 100 pedidos sin paginar; añadir paginación cuando se acumulen más.
      let q = supabase!.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
      if (filter !== 'todos') q = q.eq('status', filter)
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })

  async function setStatus(o: Order, status: OrderStatus) {
    const { error } = await supabase!.from('orders').update({ status }).eq('id', o.id)
    if (error) alert(`No se pudo actualizar: ${error.message}`)
    qc.invalidateQueries({ queryKey: ['orders'] })
  }

  return (
    <section>
      <div className="admin__head">
        <h1>Pedidos</h1>
        <select className="input admin__filter" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filtrar por estado">
          <option value="todos">Todos</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      {isPending && <p className="muted">Cargando…</p>}
      {isError && <p className="alert">No se pudieron cargar los pedidos.</p>}
      {data?.length === 0 && <p className="muted">No hay pedidos en este estado.</p>}

      <div className="orders">
        {data?.map((o) => (
          <details key={o.id} className="admin-card order">
            <summary>
              <b className="num">#{o.number}</b>
              <span>{o.customer_name}</span>
              <span className="num">{formatUsd(o.total_usd)}</span>
              <span className={`pill pill--${o.status}`}>{o.status}</span>
              <time className="muted" dateTime={o.created_at}>{new Date(o.created_at).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}</time>
            </summary>
            <div className="order__body">
              <ul>
                {o.items.map((i) => (
                  <li key={i.product_id}>{i.qty} × {i.brand} {i.name}{i.volume_ml ? ` ${i.volume_ml} ml` : ''} — <span className="num">{formatUsd(i.line_usd)}</span></li>
                ))}
              </ul>
              <p className="num">Total {formatUsd(o.total_usd)} · {formatVes(o.total_ves)} (tasa {o.exchange_rate})</p>
              <dl className="order__data">
                <dt>Teléfono</dt><dd>{o.customer_phone}</dd>
                {o.customer_id_doc && <><dt>Cédula</dt><dd>{o.customer_id_doc}</dd></>}
                <dt>Ciudad</dt><dd>{o.city}</dd>
                {o.address && <><dt>Dirección</dt><dd>{o.address}</dd></>}
                <dt>Entrega</dt><dd>{o.delivery}</dd>
                <dt>Pago</dt><dd>{o.payment}</dd>
                {o.notes && <><dt>Notas</dt><dd>{o.notes}</dd></>}
              </dl>
              <div className="order__actions">
                <select className="input" value={o.status} onChange={(e) => setStatus(o, e.target.value as OrderStatus)} aria-label="Estado del pedido">
                  {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
                <a className="btn btn-outline" href={`https://wa.me/${o.customer_phone.replace(/\D/g, '').replace(/^0/, '58')}`} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} /> Escribir al cliente
                </a>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

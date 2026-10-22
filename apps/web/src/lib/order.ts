// Solo imports de tipos: así se prueba con `node --test` sin bundler.
import type { Customer, OrderReceipt } from './types.ts'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const ves = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatUsd = (n: number) => usd.format(n)
export const formatVes = (n: number) => `Bs. ${ves.format(n)}`
export const toVes = (amountUsd: number, rate: number) => Math.round(amountUsd * rate * 100) / 100

export function buildWhatsAppMessage(order: OrderReceipt, c: Customer): string {
  const optional = (label: string, value: string) => (value.trim() ? `${label}: ${value.trim()}` : null)
  return [
    `*Pedido #${order.number} · LM Perfumes*`,
    '',
    ...order.items.map(
      (i) => `• ${i.qty} × ${i.brand ? `${i.brand} ` : ''}${i.name}${i.volume_ml ? ` ${i.volume_ml} ml` : ''} — ${formatUsd(i.line_usd)}`,
    ),
    '',
    `*Total: ${formatUsd(order.total_usd)}*`,
    `Equivalente: ${formatVes(order.total_ves)} (tasa ${order.exchange_rate})`,
    '',
    '*Cliente*',
    `Nombre: ${c.name}`,
    `Teléfono: ${c.phone}`,
    optional('Cédula', c.id_doc),
    `Ciudad: ${c.city}`,
    optional('Dirección', c.address),
    `Entrega: ${c.delivery}`,
    `Pago: ${c.payment}`,
    optional('Notas', c.notes),
  ]
    .filter((l) => l !== null)
    .join('\n')
}

export const whatsappUrl = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

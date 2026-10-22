// Ejecutar: pnpm test  (node --test, sin dependencias)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWhatsAppMessage, toVes, whatsappUrl } from './order.ts'

const receipt = {
  number: 42,
  items: [{ product_id: 'a', name: 'Sauvage', brand: 'Dior', volume_ml: 100, qty: 2, unit_usd: 95, line_usd: 190 }],
  total_usd: 190,
  exchange_rate: 36.5,
  total_ves: 6935,
}
const customer = {
  name: 'Ana Pérez', phone: '04121234567', id_doc: '', city: 'Caracas', address: '',
  delivery: 'delivery' as const, payment: 'pago móvil' as const, notes: 'Para regalo',
}

test('mensaje de WhatsApp con datos del pedido y sin campos vacíos', () => {
  const msg = buildWhatsAppMessage(receipt, customer)
  assert.match(msg, /Pedido #42/)
  assert.match(msg, /2 × Dior Sauvage 100 ml — \$190\.00/)
  assert.match(msg, /Bs\. 6\.935,00/)
  assert.match(msg, /Notas: Para regalo/)
  assert.doesNotMatch(msg, /Cédula|Dirección/)
})

test('conversión a bolívares redondea a céntimos', () => {
  assert.equal(toVes(10.99, 36.5), 401.14)
})

test('enlace wa.me limpia el número y codifica el texto', () => {
  assert.equal(whatsappUrl('+58 412-123', 'a b'), 'https://wa.me/58412123?text=a%20b')
})

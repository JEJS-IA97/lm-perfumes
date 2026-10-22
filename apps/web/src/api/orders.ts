import { supabase } from '../lib/supabase'
import type { Customer, OrderReceipt } from '../lib/types'
import type { CartLine } from '../store/cart'

/** El navegador solo envía IDs y cantidades; precios y total los calcula create_order() en la base de datos. */
export async function createOrder(customer: Customer, lines: CartLine[]): Promise<OrderReceipt> {
  if (!supabase) throw new Error('La tienda aún no está conectada a Supabase (modo demostración).')
  const { data, error } = await supabase.rpc('create_order', {
    p_customer: customer,
    p_items: lines.map((l) => ({ product_id: l.id, qty: l.qty })),
  })
  if (error) throw new Error(error.message)
  return data as OrderReceipt
}

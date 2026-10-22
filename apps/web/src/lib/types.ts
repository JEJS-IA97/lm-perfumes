export type Gender = 'damas' | 'caballeros' | 'unisex'

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  gender: Gender
  concentration: string
  volume_ml: number | null
  description: string
  notes_top: string
  notes_heart: string
  notes_base: string
  price_usd: number
  compare_at_usd: number | null
  images: string[]
  available: boolean
  featured: boolean
  sort_order: number
}

export interface Settings {
  exchange_rate: number
  whatsapp_number: string
}

export interface Customer {
  name: string
  phone: string
  id_doc: string
  city: string
  address: string
  delivery: 'retiro' | 'delivery' | 'envío nacional'
  payment: 'pago móvil' | 'zelle' | 'efectivo USD' | 'transferencia Bs'
  notes: string
}

export interface OrderLine {
  product_id: string
  name: string
  brand: string
  volume_ml: number | null
  qty: number
  unit_usd: number
  line_usd: number
}

/** Lo que devuelve create_order(): precios calculados por la base de datos. */
export interface OrderReceipt {
  number: number
  items: OrderLine[]
  total_usd: number
  exchange_rate: number
  total_ves: number
}

export type OrderStatus = 'nuevo' | 'confirmado' | 'entregado' | 'cancelado'

export interface Order extends OrderReceipt {
  id: string
  customer_name: string
  customer_phone: string
  customer_id_doc: string
  city: string
  address: string
  delivery: string
  payment: string
  notes: string
  status: OrderStatus
  created_at: string
}

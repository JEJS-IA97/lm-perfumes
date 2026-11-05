import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../lib/types'

// Copia mínima para pintar el carrito; el precio real lo recalcula el servidor al crear el pedido.
export interface CartLine {
  id: string
  slug: string
  name: string
  brand: string
  volume_ml: number | null
  price_usd: number
  image: string | undefined
  qty: number
}

interface CartState {
  lines: CartLine[]
  open: boolean
  add: (p: Product, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  setOpen: (open: boolean) => void
  sync: (catalog: Product[]) => void
}

const MAX_QTY = 20

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (p, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.id === p.id)
          const lines = existing
            ? s.lines.map((l) => (l.id === p.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
            : [...s.lines, { id: p.id, slug: p.slug, name: p.name, brand: p.brand, volume_ml: p.volume_ml, price_usd: p.price_usd, image: p.images[0], qty }]
          return { lines, open: true }
        }),
      setQty: (id, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
      // El carrito guardado puede tener precios viejos: se copian los del catálogo actual y se quitan los productos borrados.
      sync: (catalog) =>
        set((s) => {
          const byId = new Map(catalog.map((p) => [p.id, p]))
          const lines = s.lines.flatMap((l) => {
            const p = byId.get(l.id)
            return p ? [{ ...l, slug: p.slug, name: p.name, brand: p.brand, volume_ml: p.volume_ml, price_usd: p.price_usd, image: p.images[0] }] : []
          })
          const same = lines.length === s.lines.length && lines.every((l, i) => l.price_usd === s.lines[i].price_usd && l.name === s.lines[i].name && l.image === s.lines[i].image && l.slug === s.lines[i].slug)
          return same ? s : { lines }
        }),
    }),
    { name: 'lm-cart', partialize: (s) => ({ lines: s.lines }) },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0)
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price_usd, 0)

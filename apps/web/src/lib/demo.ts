import type { Product, Settings } from './types'

// Catálogo de muestra para desarrollar sin Supabase. Fotos ilustrativas de Unsplash: reemplazar por las reales.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

const base = {
  concentration: 'Eau de Parfum', volume_ml: 100, compare_at_usd: null, available: true, featured: true, sort_order: 0,
  notes_top: 'Bergamota, pimienta rosa', notes_heart: 'Lavanda, geranio', notes_base: 'Ámbar, vetiver',
  description: 'Fragancia de muestra. Este texto se reemplaza desde el panel de administración.',
}

export const demoProducts: Product[] = [
  { ...base, id: 'd1', slug: 'noche-de-cedro', name: 'Noche de Cedro', brand: 'LM Selección', gender: 'caballeros', price_usd: 48, images: [img('photo-1594035910387-fea47794261f')] },
  { ...base, id: 'd2', slug: 'flor-de-azahar', name: 'Flor de Azahar', brand: 'LM Selección', gender: 'damas', price_usd: 52, compare_at_usd: 60, images: [img('photo-1541643600914-78b084683601')] },
  { ...base, id: 'd3', slug: 'brisa-marina', name: 'Brisa Marina', brand: 'LM Selección', gender: 'caballeros', concentration: 'Eau de Toilette', price_usd: 39, images: [img('photo-1592945403244-b3fbafd7f539')] },
  { ...base, id: 'd4', slug: 'rosa-imperial', name: 'Rosa Imperial', brand: 'LM Selección', gender: 'damas', price_usd: 55, images: [img('photo-1595425970377-c9703cf48b6d')] },
  { ...base, id: 'd5', slug: 'cuero-y-tabaco', name: 'Cuero y Tabaco', brand: 'LM Selección', gender: 'caballeros', price_usd: 58, available: false, images: [img('photo-1523293182086-7651a899d37f')] },
  { ...base, id: 'd6', slug: 'vainilla-blanca', name: 'Vainilla Blanca', brand: 'LM Selección', gender: 'damas', volume_ml: 50, price_usd: 34, images: [img('photo-1588405748880-12d1d2a59f75')] },
]

export const demoSettings: Settings = { exchange_rate: 36.5, whatsapp_number: '' }

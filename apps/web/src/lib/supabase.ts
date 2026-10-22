import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** null mientras no haya proyecto Supabase: la tienda muestra el catálogo de demostración. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export function imageUrl(path: string | undefined): string {
  if (!path) return '/images/lm-logo.png'
  if (path.startsWith('http') || path.startsWith('/')) return path
  return supabase ? supabase.storage.from('products').getPublicUrl(path).data.publicUrl : path
}

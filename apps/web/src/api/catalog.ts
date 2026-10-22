import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { demoProducts, demoSettings } from '../lib/demo'
import type { Gender, Product, Settings } from '../lib/types'

async function fetchProducts(gender?: Gender): Promise<Product[]> {
  if (!supabase) return demoProducts.filter((p) => !gender || p.gender === gender || p.gender === 'unisex')
  let q = supabase.from('products').select('*').order('sort_order').order('created_at', { ascending: false })
  if (gender) q = q.in('gender', [gender, 'unisex'])
  const { data, error } = await q
  if (error) throw error
  return data
}

export const useProducts = (gender?: Gender) =>
  useQuery({ queryKey: ['products', gender ?? 'all'], queryFn: () => fetchProducts(gender) })

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<Product | null> => {
      if (!supabase) return demoProducts.find((p) => p.slug === slug) ?? null
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (error) throw error
      return data
    },
  })

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<Settings> => {
      if (!supabase) return demoSettings
      const { data, error } = await supabase.from('settings').select('exchange_rate, whatsapp_number').eq('id', 1).single()
      if (error) throw error
      return data
    },
    staleTime: 5 * 60_000,
  })

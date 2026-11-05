// Prueba create_order() en un Postgres real (PGlite, en memoria) con las migraciones del repo.
// Los valores esperados salen de las reglas del negocio, no del código SQL.
import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
const migration = (name: string) =>
  readFileSync(new URL(`../../../../supabase/migrations/${name}`, import.meta.url), 'utf8').replace(/^create extension.*$/gm, '')

// Lo mínimo de Supabase que usan las migraciones: auth, storage y los roles.
const SUPABASE_STUB = `
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text);
  alter table storage.objects enable row level security;
`
const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'
const AGOTADO = '00000000-0000-0000-0000-00000000000c'

before(async () => {
  await db.exec(SUPABASE_STUB)
  for (const m of ['0001_initial_schema.sql', '0002_banners.sql', '0004_binance_whatsapp.sql', '0005_direccion_png.sql']) await db.exec(migration(m))
  await db.exec(`
    update settings set exchange_rate = 36.5 where id = 1;
    insert into products (id, slug, name, gender, price_usd, available) values
      ('${A}', 'khamrah', 'Khamrah', 'unisex', 30, true),
      ('${B}', 'layton', 'Layton', 'unisex', 45.5, true),
      ('${AGOTADO}', 'agotado', 'Agotado', 'damas', 20, false);
  `)
})

let phone = 4120000000
const customer = (extra: Record<string, string> = {}) => ({
  name: 'Ana Pérez', phone: `0${phone++}`, city: 'Caracas', address: 'Av. Principal, casa 3', delivery: 'delivery', payment: 'pago móvil', ...extra,
})
type Receipt = { number: number; total_usd: number; total_ves: number; exchange_rate: number; items: { product_id: string; qty: number; unit_usd: number; line_usd: number }[] }
const order = async (c: object, items: object[]) =>
  (await db.query<{ r: Receipt }>('select create_order($1::jsonb, $2::jsonb) as r', [JSON.stringify(c), JSON.stringify(items)])).rows[0].r
const rejects = (c: object, items: object[], msg: RegExp) => assert.rejects(order(c, items), msg)

test('el total sale de los precios de la base y la tasa guardada', async () => {
  const r = await order(customer(), [{ product_id: A, qty: 2 }, { product_id: B, qty: 1 }])
  assert.equal(Number(r.total_usd), 105.5) // 2 × 30 + 45,50
  assert.equal(Number(r.total_ves), 3850.75) // 105,50 × 36,5
  assert.equal(Number(r.exchange_rate), 36.5)
  assert.equal(r.items.length, 2)
})

test('el mismo perfume repetido se suma en una línea', async () => {
  const r = await order(customer(), [{ product_id: A, qty: 1 }, { product_id: A, qty: 2 }])
  assert.equal(r.items.length, 1)
  assert.equal(r.items[0].qty, 3)
  assert.equal(Number(r.total_usd), 90)
})

test('delivery y envío exigen dirección; retiro no', async () => {
  await rejects(customer({ address: '' }), [{ product_id: A, qty: 1 }], /dirección/)
  await rejects(customer({ address: '  ', delivery: 'envío nacional' }), [{ product_id: A, qty: 1 }], /dirección/)
  const r = await order(customer({ address: '', delivery: 'retiro' }), [{ product_id: A, qty: 1 }])
  assert.equal(Number(r.total_usd), 30)
})

test('rechaza agotados, más de 20 unidades y formas de pago desconocidas', async () => {
  await rejects(customer(), [{ product_id: AGOTADO, qty: 1 }], /no está disponible/)
  await rejects(customer(), [{ product_id: A, qty: 21 }], /no está disponible/)
  await rejects(customer({ payment: 'tarjeta' }), [{ product_id: A, qty: 1 }], /Pago inválido/)
})

test('máximo 3 pedidos seguidos por teléfono', async () => {
  const c = customer()
  for (let i = 0; i < 3; i++) await order(c, [{ product_id: A, qty: 1 }])
  await rejects(c, [{ product_id: A, qty: 1 }], /Demasiados pedidos/)
})

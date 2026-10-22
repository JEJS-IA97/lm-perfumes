-- LM Perfumes: esquema completo. Ejecutar una vez en Supabase > SQL Editor.
-- Supabase hace de backend: la tienda lee con la clave anon (RLS) y crea pedidos solo vía create_order().

create extension if not exists pgcrypto;

-- ── Administrador único ─────────────────────────────────────────────
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

-- ── Productos ───────────────────────────────────────────────────────
create type public.gender as enum ('damas', 'caballeros', 'unisex');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(name) between 2 and 120),
  brand text not null default '' check (length(brand) <= 80),
  gender public.gender not null,
  concentration text not null default '' check (length(concentration) <= 40), -- EDP, EDT, Parfum…
  volume_ml integer check (volume_ml > 0),
  description text not null default '' check (length(description) <= 4000),
  notes_top text not null default '',
  notes_heart text not null default '',
  notes_base text not null default '',
  price_usd numeric(10,2) not null check (price_usd > 0),
  compare_at_usd numeric(10,2) check (compare_at_usd > 0),
  images text[] not null default '{}', -- rutas en Storage (bucket products); la primera es la portada
  available boolean not null default true, -- disponibilidad manual
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_gender_idx on public.products(gender, sort_order);
create index products_featured_idx on public.products(featured) where featured;

alter table public.products enable row level security;
create policy "catálogo público" on public.products for select using (true);
create policy "admin escribe productos" on public.products for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- ── Ajustes de tienda (fila única) ──────────────────────────────────
create table public.settings (
  id integer primary key default 1 check (id = 1),
  exchange_rate numeric(14,4) not null default 1 check (exchange_rate > 0), -- Bs por 1 USD, se actualiza a mano
  whatsapp_number text not null default '' check (whatsapp_number ~ '^[0-9]*$'), -- formato internacional sin +: 58412...
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);
alter table public.settings enable row level security;
create policy "ajustes públicos" on public.settings for select using (true);
create policy "admin edita ajustes" on public.settings for update using (public.is_admin()) with check (public.is_admin());

-- ── Pedidos ─────────────────────────────────────────────────────────
create type public.order_status as enum ('nuevo', 'confirmado', 'entregado', 'cancelado');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity unique,
  customer_name text not null,
  customer_phone text not null,
  customer_id_doc text not null default '', -- cédula
  city text not null,
  address text not null default '',
  delivery text not null,  -- retiro, delivery, envío nacional
  payment text not null,   -- pago móvil, zelle, efectivo…
  notes text not null default '',
  items jsonb not null,    -- snapshot: [{product_id, name, brand, volume_ml, qty, unit_usd, line_usd}]
  total_usd numeric(10,2) not null,
  exchange_rate numeric(14,4) not null,
  total_ves numeric(16,2) not null,
  status public.order_status not null default 'nuevo',
  created_at timestamptz not null default now()
);
create index orders_created_idx on public.orders(created_at desc);
create index orders_phone_idx on public.orders(customer_phone, created_at desc);

alter table public.orders enable row level security;
-- Sin políticas para anon: los clientes no leen ni escriben pedidos directamente.
create policy "admin lee pedidos" on public.orders for select using (public.is_admin());
create policy "admin actualiza pedidos" on public.orders for update using (public.is_admin()) with check (public.is_admin());

-- Crea el pedido con precios de la base de datos (nunca los del navegador).
-- p_customer: {name, phone, id_doc, city, address, delivery, payment, notes}
-- p_items:    [{product_id, qty}]
create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_name text := trim(coalesce(p_customer->>'name', ''));
  v_phone text := regexp_replace(coalesce(p_customer->>'phone', ''), '[^0-9+]', '', 'g');
  v_rate numeric;
  v_items jsonb;
  v_total numeric;
  v_order public.orders;
begin
  if length(v_name) not between 2 and 80 then raise exception 'Nombre inválido'; end if;
  if length(v_phone) not between 7 and 16 then raise exception 'Teléfono inválido'; end if;
  if length(coalesce(p_customer->>'city', '')) not between 2 and 60 then raise exception 'Ciudad inválida'; end if;
  if length(coalesce(p_customer->>'address', '')) > 300 or length(coalesce(p_customer->>'notes', '')) > 500 then
    raise exception 'Texto demasiado largo';
  end if;
  if coalesce(p_customer->>'delivery', '') not in ('retiro', 'delivery', 'envío nacional') then raise exception 'Entrega inválida'; end if;
  if coalesce(p_customer->>'payment', '') not in ('pago móvil', 'zelle', 'efectivo USD', 'transferencia Bs') then raise exception 'Pago inválido'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Carrito inválido'; end if;

  -- shortcut: límite simple por teléfono (3 pedidos / 10 min); si hay abuso real, añadir captcha (Turnstile es gratis).
  if (select count(*) from orders where customer_phone = v_phone and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Demasiados pedidos seguidos, intenta en unos minutos';
  end if;

  select exchange_rate into v_rate from settings where id = 1;

  select jsonb_agg(jsonb_build_object(
           'product_id', p.id, 'name', p.name, 'brand', p.brand, 'volume_ml', p.volume_ml,
           'qty', i.qty, 'unit_usd', p.price_usd, 'line_usd', p.price_usd * i.qty)),
         sum(p.price_usd * i.qty)
    into v_items, v_total
    from (select (e->>'product_id')::uuid as product_id, sum((e->>'qty')::int) as qty
            from jsonb_array_elements(p_items) e group by 1) i
    join products p on p.id = i.product_id and p.available
   where i.qty between 1 and 20;

  if v_items is null or jsonb_array_length(v_items) <> (select count(distinct e->>'product_id') from jsonb_array_elements(p_items) e) then
    raise exception 'Algún producto ya no está disponible';
  end if;

  insert into orders (customer_name, customer_phone, customer_id_doc, city, address, delivery, payment, notes,
                      items, total_usd, exchange_rate, total_ves)
  values (v_name, v_phone, left(coalesce(p_customer->>'id_doc', ''), 20), p_customer->>'city',
          coalesce(p_customer->>'address', ''), p_customer->>'delivery', p_customer->>'payment',
          coalesce(p_customer->>'notes', ''), v_items, v_total, v_rate, round(v_total * v_rate, 2))
  returning * into v_order;

  return jsonb_build_object('number', v_order.number, 'items', v_order.items, 'total_usd', v_order.total_usd,
                            'exchange_rate', v_order.exchange_rate, 'total_ves', v_order.total_ves);
end $$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;

-- ── Imágenes (Storage) ──────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']);

create policy "admin sube imágenes" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());
create policy "admin edita imágenes" on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_admin());
create policy "admin borra imágenes" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- ── Después de ejecutar ─────────────────────────────────────────────
-- 1. Authentication > Sign In / Providers: desactivar "Allow new users to sign up".
-- 2. Authentication > Users > Add user: crear tu correo + contraseña.
-- 3. insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO';
-- 4. update public.settings set whatsapp_number = '58412XXXXXXX', exchange_rate = 36.5;

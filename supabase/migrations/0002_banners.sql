-- Banners del inicio, editables desde /admin/banners. Ejecutar una vez en Supabase > SQL Editor.

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 2 and 90),
  subtitle text not null default '' check (length(subtitle) <= 200),
  cta_label text not null default 'Ver más' check (length(cta_label) <= 30),
  cta_url text not null default '/' check (cta_url ~ '^(/|https://)'),
  image text not null default '',            -- ruta en Storage (bucket products, carpeta banners/)
  tone text not null default 'marca' check (tone in ('damas', 'caballeros', 'marca')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;
create policy "banners públicos" on public.banners for select using (true);
create policy "admin escribe banners" on public.banners for all using (public.is_admin()) with check (public.is_admin());

insert into public.banners (title, subtitle, cta_label, cta_url, tone, sort_order) values
  ('Nuevas fragancias de temporada', 'Pide hoy por WhatsApp y coordinamos la entrega.', 'Ver damas', '/damas', 'damas', 0),
  ('Para él: intensas y con carácter', 'Amaderadas y especiadas para el día y la noche.', 'Ver caballeros', '/caballeros', 'caballeros', 1);

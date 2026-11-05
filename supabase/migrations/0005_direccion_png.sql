-- Dirección obligatoria para delivery y envío + imágenes de producto en PNG. Ejecutar una vez en Supabase > SQL Editor.

-- 1. create_order(): si la entrega no es "retiro", la dirección es obligatoria (mínimo 5 letras).
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
  if p_customer->>'delivery' <> 'retiro' and length(trim(coalesce(p_customer->>'address', ''))) < 5 then
    raise exception 'Escribe la dirección de entrega';
  end if;
  if coalesce(p_customer->>'payment', '') not in ('pago móvil', 'efectivo USD', 'binance', 'zelle') then raise exception 'Pago inválido'; end if;
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

-- 2. Fotos de producto en PNG sin fondo: pesan más que WebP, el límite sube de 2 MB a 5 MB.
update storage.buckets set file_size_limit = 5242880 where id = 'products';

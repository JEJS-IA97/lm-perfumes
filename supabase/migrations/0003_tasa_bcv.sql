-- Tasa BCV automática. Ejecutar una vez en Supabase > SQL Editor.
-- Misma fuente que yukita-fit: DolarAPI (BCV), campo "promedio".
-- Supabase la consulta cada hora con pg_cron + http; no hace falta servidor.

create extension if not exists http with schema extensions;
create extension if not exists pg_cron;

alter table public.settings
  add column if not exists rate_auto boolean not null default true,     -- false = el admin fija la tasa a mano
  add column if not exists rate_date timestamptz;                       -- fecha de la tasa según el BCV

create or replace function public.refresh_bcv_rate()
returns numeric language plpgsql security definer set search_path = public, extensions as $$
declare
  v_body jsonb;
  v_rate numeric;
begin
  -- Desde la web solo el admin; pg_cron llama sin usuario (auth.uid() nulo).
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select content::jsonb into v_body
    from extensions.http_get('https://ve.dolarapi.com/v1/dolares/oficial');
  v_rate := nullif(v_body->>'promedio', '')::numeric;

  if v_rate is null or v_rate <= 0 then
    raise exception 'La API del BCV no devolvió una tasa válida';
  end if;

  update settings
     set exchange_rate = round(v_rate, 4),
         rate_date = (v_body->>'fechaActualizacion')::timestamptz,
         updated_at = now()
   where id = 1 and (rate_auto or auth.uid() is not null);  -- el botón del panel actualiza aunque esté en manual

  return v_rate;
end $$;

revoke all on function public.refresh_bcv_rate() from public, anon;
grant execute on function public.refresh_bcv_rate() to authenticated;

-- Cada hora en el minuto 5. Si ya existía, se reemplaza.
select cron.unschedule('tasa-bcv') where exists (select 1 from cron.job where jobname = 'tasa-bcv');
select cron.schedule('tasa-bcv', '5 * * * *', 'select public.refresh_bcv_rate()');

-- Primera carga ahora mismo.
select public.refresh_bcv_rate();

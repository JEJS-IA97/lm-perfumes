-- Da permisos de administrador a una cuenta YA creada en Authentication > Users.
-- Ejecutar después de crear el usuario. Si devuelve "INSERT 0 0", el correo no existe todavía en Authentication.
insert into public.admins (user_id)
select id from auth.users where lower(email) = 'alvaradoluis2097@gmail.com'
on conflict (user_id) do nothing;

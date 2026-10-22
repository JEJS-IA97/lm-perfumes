# LM Perfumes

Tienda de perfumes con catálogo (Damas / Caballeros), carrito sin cuenta, pedidos que llegan por WhatsApp y panel de administración para un único usuario. Todo en planes gratis: Cloudflare Pages + Supabase.

Plan completo y pasos para publicar: [docs/PLAN.md](docs/PLAN.md). Diseño: [docs/DESIGN.md](docs/DESIGN.md).

## Desarrollo

Requisitos: Node 22+ y pnpm 9 (`npx pnpm@9.15.0` sirve si no está instalado).

```bash
pnpm install
pnpm dev        # tienda en http://localhost:5173, panel en /admin
pnpm test       # prueba del mensaje de WhatsApp y conversión a Bs
pnpm build
```

Sin `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en `.env`, la tienda usa 6 productos de demostración y el panel pide configurarlas.

## Seguridad

- Solo se usa la clave `anon` en el navegador; la `service_role` no va en ningún sitio.
- Las políticas RLS dejan leer catálogo y ajustes, y escribir solo al usuario de la tabla `admins`.
- Los pedidos se crean únicamente con `create_order()`, que recalcula precios en la base de datos.
- El registro público de Supabase Auth debe estar desactivado.

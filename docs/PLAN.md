# Plan técnico definitivo — LM Perfumes

Fecha: 2026-10-22. Coste mensual: 0 $.

## 1. Decisión de arquitectura

```
Cliente (móvil / tablet / PC)
        │
        ▼
Cloudflare Pages ── React + Vite (tienda + panel /admin)
        │  supabase-js (clave anon, pública)
        ▼
Supabase (gratis)
  ├─ PostgreSQL: products · settings · orders · admins
  ├─ Auth: 1 solo usuario (registro público desactivado)
  ├─ Storage: bucket "products" (imágenes WebP)
  └─ Función create_order(): valida y calcula precios en el servidor
        │
        ▼
WhatsApp (wa.me con el pedido ya redactado)
```

**No hay backend aparte.** Se evaluaron tres opciones:

| Opción | Arranque en frío | Servicios a mantener | Veredicto |
|---|---|---|---|
| Render gratis (Node/Express) | ~50 s tras 15 min sin visitas | 3 (front, API, BD) | Descartada: el primer cliente del día espera casi un minuto |
| Cloudflare Workers + Hono | 0 s | 3 | Rápida, pero código extra que no hace falta |
| **Supabase directo (RLS + función SQL)** | **0 s** | **2** | **Elegida**: la seguridad la hace la base de datos |

La lógica que normalmente iría en un backend (validar el pedido, recalcular precios con los de la base de datos, limitar abusos) vive en la función `create_order()` de PostgreSQL. El navegador solo envía IDs y cantidades.

**Frontend en Cloudflare Pages, no Vercel:** el plan gratis de Vercel (Hobby) es solo para uso no comercial; una tienda es uso comercial. Cloudflare Pages permite uso comercial, ancho de banda ilimitado y da subdominio gratis `lm-perfumes.pages.dev`. El código no cambia si algún día se pasa a Vercel Pro.

## 2. Límites del plan gratis (verificar al crear las cuentas)

| Servicio | Límite | Para esta tienda |
|---|---|---|
| Supabase BD | 500 MB | Decenas de miles de pedidos |
| Supabase Storage | 1 GB | ~6.000 fotos WebP de ~150 KB |
| Supabase transferencia | 5 GB/mes | ~30.000 visitas/mes con fotos optimizadas |
| Supabase inactividad | **Se pausa tras 7 días sin peticiones** | Ver mitigación abajo |
| Cloudflare Pages | Ilimitado, 500 despliegues/mes | Sobra |

**Pausa por inactividad:** cualquier visita a la tienda cuenta como actividad. Si hay semanas muertas, crear un monitor gratis en cron-job.org o UptimeRobot que abra `https://lm-perfumes.pages.dev` una vez al día (la página consulta Supabase al cargar).

## 3. Modelo de datos

| Tabla | Para qué | Acceso público |
|---|---|---|
| `products` | Catálogo: nombre, marca, sección (damas/caballeros/unisex), concentración, ml, notas, precio USD, precio anterior, imágenes, disponible, destacado, orden | Lectura |
| `settings` | Tasa Bs/USD y número de WhatsApp (fila única) | Lectura |
| `orders` | Pedidos con copia de productos, precios, tasa y total en Bs del momento | Ninguno |
| `admins` | El único usuario con permisos de escritura | Ninguno |

Detalles: `supabase/migrations/0001_initial_schema.sql`.

- **Moneda:** precios guardados en USD. Bs = USD × tasa del panel, mostrado en toda la tienda. Cada pedido congela la tasa usada.
- **Inventario:** disponibilidad manual (casilla Disponible/Agotado). No se descuenta stock al pedir, porque el pago se confirma por WhatsApp.
- **Pedidos:** estados nuevo → confirmado → entregado / cancelado.

## 4. Flujo de compra

1. Cliente agrega perfumes al carrito (guardado en el navegador, sin cuenta).
2. En `/pedido` escribe nombre, teléfono, cédula (opcional), ciudad, dirección, entrega (retiro / delivery / envío nacional) y pago (pago móvil / Zelle / efectivo USD / transferencia Bs).
3. `create_order()` valida, recalcula precios, guarda el pedido y devuelve número y totales.
4. La tienda arma el mensaje y muestra el botón **Enviar pedido por WhatsApp** (`wa.me/<número>?text=…`). Ejemplo:

```
*Pedido #42 · LM Perfumes*

• 2 × Dior Sauvage 100 ml — $190.00

*Total: $190.00*
Equivalente: Bs. 6.935,00 (tasa 36.5)

*Cliente*
Nombre: Ana Pérez
Teléfono: 04121234567
Ciudad: Caracas
Entrega: delivery
Pago: pago móvil
Notas: Para regalo
```

Se usa un botón y no una redirección automática porque los navegadores bloquean ventanas abiertas después de esperar al servidor.

## 5. Panel `/admin`

| Sección | Qué hace |
|---|---|
| Pedidos | Lista (últimos 100), filtro por estado, detalle, cambiar estado, botón para escribir al cliente |
| Productos | Crear, editar, eliminar; subir varias fotos (se convierten a WebP de 1400 px en el navegador), elegir portada |
| Inventario | Casillas rápidas Disponible / Destacado |
| Ajustes | Tasa del día y número de WhatsApp |

Login con correo y contraseña de Supabase Auth. El código del panel se descarga aparte: los clientes no lo bajan.

## 6. Diseño

- Inicio claro con titular gigante "Esencia" detrás de la foto (patrón de las referencias), franja de servicios, accesos Damas/Caballeros, destacados y pasos de compra.
- **Damas:** fondo blanco con degradado azul muy suave, títulos en cursiva gris del logo.
- **Caballeros:** tema oscuro completo (`#0f1012`), acentos azul del logo. Header, carrito y pie cambian con la sección.
- Tipografías: Bodoni Moda (titulares, estilo perfumería) + Manrope (interfaz).
- Mobile-first: 2 columnas en móvil, 3 en tablet, 4 en escritorio; botones de 44 px mínimo; carrito como panel lateral nativo (`<dialog>`).

## 7. Estructura del proyecto

```
lm-perfumes/
├─ apps/web/                      React + Vite + TypeScript
│  ├─ public/images/lm-logo.png
│  └─ src/
│     ├─ app/App.tsx              rutas
│     ├─ api/catalog.ts           consultas de productos y ajustes
│     ├─ api/orders.ts            create_order()
│     ├─ store/cart.ts            carrito (Zustand, persistente)
│     ├─ lib/                     supabase, tipos, formato USD/Bs, mensaje WhatsApp (+ test), demo
│     ├─ components/layout/       Header, Footer, StoreLayout
│     ├─ components/product/      ProductCard, ProductGrid, Price
│     ├─ components/cart/         CartDrawer
│     ├─ pages/                   Home, Collection, ProductDetail, Checkout, NotFound
│     ├─ admin/                   AdminLayout, Login, OrdersPage, ProductsPage, ProductForm, InventoryPage, SettingsPage
│     └─ styles/base.css          tokens de marca y tema oscuro
├─ supabase/migrations/0001_initial_schema.sql
└─ docs/                          PLAN.md (este), DESIGN.md
```

Sin Supabase configurado, la tienda funciona con 6 productos de demostración para poder diseñar.

## 8. Pasos para publicar (en orden)

1. **Supabase:** crear proyecto gratis (región `us-east-1`, la más cercana a Venezuela). SQL Editor → pegar y ejecutar `0001_initial_schema.sql`.
2. **Admin:** Authentication → desactivar "Allow new users to sign up" → Add user con tu correo. Luego en SQL: `insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO';`
3. **Variables:** en `.env` (raíz) poner `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Settings → API). La clave `service_role` no se usa en ningún sitio.
4. **Probar en local:** `pnpm dev` → `/admin` → Ajustes (tasa y WhatsApp) → crear 2–3 productos con fotos.
5. **GitHub:** subir el repositorio.
6. **Cloudflare Pages:** Create project → conectar el repo → build command `pnpm --filter @lm/web build`, output `apps/web/dist`, variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=22`.
7. **Supabase → Authentication → URL Configuration:** poner `https://lm-perfumes.pages.dev` como Site URL.
8. Monitor diario gratis (paso 2 de la sección de límites).

## 9. Fuera de esta versión (a propósito)

Búsqueda, filtros por notas/marca, cupones, reseñas, stock numérico, varios tamaños por producto (hoy: un producto por tamaño), dominio propio, captcha (añadir Cloudflare Turnstile gratis si llegan pedidos basura), paginación de pedidos (>100).

## 10. Antes de abrir al público

- Reemplazar las fotos de demostración (Unsplash, muestran marcas reales) por fotos propias.
- Revisar textos del inicio y el número de WhatsApp.
- Hacer un pedido real de punta a punta desde un móvil.

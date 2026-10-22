# Dirección visual — LM Perfumes

- Logotipo: `apps/web/public/images/lm-logo.png`, sin redibujar. Sobre fondo oscuro va en una placa blanca.
- Colores (`apps/web/src/styles/base.css`):
  - Azul logo `#159BD3`: decoración, acentos y textos grandes.
  - Azul fuerte `#0B6E9C`: botones y texto pequeño sobre blanco (contraste AA).
  - Gris logo `#3D3D3F`: titulares grandes en claro.
  - Claro: fondo `#FFFFFF`, superficie `#F4F6F8`, texto `#17181B`.
  - Oscuro (Caballeros, `[data-theme='dark']`): fondo `#0F1012`, superficie `#18191C`, texto `#EEF0F2`.
- Tipografía: Bodoni Moda para titulares (perfumería clásica), Manrope para interfaz.
- Inicio: escenario partido claro/oscuro (Damas | Caballeros); la palabra ESENCIA cruza ambos con mix-blend difference y un frasco SVG con la etiqueta del logo queda en la costura.
- Damas: luminoso, cursivas, degradado azul muy suave. Caballeros: tema oscuro completo con punto azul tras el título.
- Sin etiquetas pequeñas sobre los títulos, sin números de sección decorativos, sin degradados en texto.
- Mobile-first: objetivos táctiles ≥ 44 px, sin scroll horizontal, `prefers-reduced-motion` respetado.
- Las fotos actuales son de demostración (Unsplash) y muestran marcas reales: reemplazarlas por fotos propias antes de publicar.

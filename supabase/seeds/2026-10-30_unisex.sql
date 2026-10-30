-- 9 perfumes unisex (n.º 17 al 25). Ejecutar una vez en Supabase > SQL Editor.
-- Las fotos se suben luego desde /admin/productos (editar cada uno → Agregar imágenes).
-- "on conflict do nothing": si un slug ya existe, esa fila se salta sin romper las demás.

insert into public.products
  (slug, name, brand, gender, concentration, volume_ml, price_usd, compare_at_usd,
   notes_top, notes_heart, notes_base, description, available, featured, sort_order)
values
  ('badee-al-oud-sublime-lattafa', 'Bade''e Al Oud Sublime', 'Lattafa', 'unisex', 'Aceite de perfume', 100, 30, 45,
   'Manzana, lichi y rosa.', 'Ciruela y jazmín.', 'Vainilla, musgo y pachulí.',
   'Deliciosa mezcla frutal-amaderada donde destacan notas jugosas de lichi y ciruela dulce sobre fondo ambarado.', true, false, 17),

  ('khamrah-lattafa', 'Khamrah', 'Lattafa', 'unisex', 'Aceite de perfume', 100, 30, 48,
   'Canela, nuez moscada y bergamota.', 'Dátiles, praliné, nardos y Mahonial.', 'Vainilla, haba tonka, benjuí, mirra, Amberwood y Akigalawood.',
   'Cautivante elixir oriental acaramelado con especias dulces, dátiles jugosos y madera ambarada.', true, true, 18),

  ('khamrah-qahwa-lattafa', 'Khamrah Qahwa', 'Lattafa', 'unisex', 'Aceite de perfume', 100, 30, 48,
   'Canela, cardamomo y jengibre.', 'Café, praliné, frutas confitadas y flores blancas.', 'Café arábica, haba tonka, benjuí, vainilla y maderas.',
   'Evolución del Khamrah clásico enriquecida con una nota intensa de café tostado e increíble calidez especiada.', true, true, 19),

  ('amber-oud-gold-edition-al-haramain', 'Amber Oud Gold Edition', 'Al Haramain', 'unisex', 'Aceite de perfume', 100, 30, 50,
   'Bergamota y notas verdes.', 'Melón, piña, notas dulces y ámbar.', 'Almizcle, vainilla y notas amaderadas.',
   'Explosión frutal ultra proyectiva con notas dominantes de melón jugoso, piña y un fondo magnético de ámbar y almizcle.', true, true, 20),

  ('layton-parfums-de-marly', 'Layton', 'Parfums de Marly', 'unisex', 'Aceite de perfume', 100, 30, 55,
   'Manzana, lavanda, bergamota y mandarina.', 'Geranio, violeta y jazmín.', 'Vainilla, cardamomo, sándalo, pimienta, pachulí y madera de guayaco.',
   'Perfume elegante de nicho que combina frescura aromática con una firma distintiva de manzana, vainilla y especias finas.', true, true, 21),

  ('erba-pura-xerjoff', 'Erba Pura', 'Xerjoff', 'unisex', 'Aceite de perfume', 100, 30, 55,
   'Naranja de Sicilia, bergamota de Calabria y limón de Sicilia.', 'Frutas mediterráneas.', 'Almizcle blanco, vainilla de Madagascar y ámbar.',
   'Cesta de frutas mediterráneas sobre una potente y sensual cama de almizcle blanco y vainilla de alta fijación.', true, true, 22),

  ('club-de-nuit-milestone-armaf', 'Club de Nuit Milestone', 'Armaf', 'unisex', 'Aceite de perfume', 100, 30, 42,
   'Notas marinas, sal marina y frutas.', 'Limón de Sicilia, bergamota, iris y mandarina.', 'Almizcle y notas amaderadas.',
   'Aroma fresco, salino y sofisticado con acentos cítricos que evocan brisas marinas de lujo.', true, false, 23),

  ('club-de-nuit-sillage-armaf', 'Club de Nuit Sillage', 'Armaf', 'unisex', 'Aceite de perfume', 100, 30, 42,
   'Bergamota, grosellas negras, limón, lima, violeta y jengibre.', 'Iris, jazmín y rosa.', 'Ambrosano, almizcle, cedro y sándalo.',
   'Composición moderna, helada, metálica y cítrica con destellos de grosella y un fondo amaderado limpio.', true, false, 24),

  ('santal-33-le-labo', 'Santal 33', 'Le Labo', 'unisex', 'Aceite de perfume', 100, 30, 55,
   'Cardamomo, iris y violeta.', 'Ambrosano, papiro de Egipto y cuero.', 'Sándalo y madera de cedro.',
   'De carácter icónico e inconfundible, destaca por su perfil amaderado de sándalo ahumado, cuero suave y notas de papiro.', true, true, 25)
on conflict (slug) do nothing;

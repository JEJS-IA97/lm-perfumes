// Clasifica notas olfativas escritas a mano ("Manzana, lichi y rosa.") en familias con icono y color.
// Sin imports: se prueba con `node --test`.

export type Family =
  | 'citrico' | 'frutal' | 'floral' | 'aromatico' | 'especiado' | 'dulce' | 'cafe'
  | 'amaderado' | 'ambar' | 'almizcle' | 'marino' | 'cuero' | 'otra'

export const FAMILY_LABEL: Record<Family, string> = {
  citrico: 'cítrico', frutal: 'frutal', floral: 'floral', aromatico: 'aromático', especiado: 'especiado',
  dulce: 'dulce', cafe: 'café', amaderado: 'amaderado', ambar: 'ambarado', almizcle: 'almizclado',
  marino: 'marino', cuero: 'cuero', otra: 'otras',
}

// Orden importa: la primera familia que coincide gana ("flor de azahar" → floral antes que cítrico).
const KEYWORDS: [Family, string[]][] = [
  ['cafe', ['cafe', 'coffee', 'espresso']],
  ['floral', ['rosa', 'jazmin', 'peonia', 'magnolia', 'violeta', 'iris', 'nardo', 'geranio', 'flor', 'azahar', 'orquidea', 'lirio', 'gardenia', 'tuberosa', 'neroli', 'heliotropo', 'mahonial', 'ylang', 'freesia', 'fresia', ' lila', 'mimosa']],
  ['citrico', ['bergamota', 'limon', ' lima ', 'naranja', 'mandarina', 'pomelo', 'toronja', 'citric', 'yuzu', 'cidra']],
  ['marino', ['marin', ' sal ', 'acuatic', 'ozon', 'oceano', ' mar ']],
  ['especiado', ['canela', 'nuez moscada', 'cardamomo', 'jengibre', 'pimienta', 'clavo', 'azafran', 'especia', 'comino', 'anis']],
  ['dulce', ['vainilla', 'praline', 'caramelo', 'tonka', 'chocolate', 'cacao', 'miel', 'azucar', 'dulce', 'crema', 'coco', 'almendra', 'malvavisco', 'algodon de azucar', 'leche']],
  ['frutal', ['manzana', 'pera', 'lichi', 'ciruela', 'melon', ' pina', 'grosella', 'fruta', 'frambuesa', 'fresa', 'melocoton', 'durazno', 'datil', 'cereza', 'mango', 'maracuya', 'higo', 'casis', ' mora', 'arandano', 'sandia', ' uva ']],
  ['aromatico', ['lavanda', 'verde', 'menta', 'salvia', 'romero', 'albahaca', 'hierba', ' te ', 'papiro', 'eucalipto', 'tomillo', 'artemisa', 'hoja']],
  ['cuero', ['cuero', 'gamuza', ' ante ']],
  ['ambar', ['ambar', 'amberwood', 'benjui', 'benzoin', 'mirra', 'incienso', 'labdano', 'resina', 'oliban']],
  ['almizcle', ['almizcle', 'musk', 'ambrosano', 'ambroxan', 'cashmeran']],
  ['amaderado', ['sandalo', 'cedro', 'madera', 'pachuli', 'vetiver', 'guayaco', 'oud', 'akigalawood', 'musgo', 'abedul', 'pino', 'ciprés', 'cipres', 'ebano']],
]

// Espacios alrededor para que las claves cortas (' sal ', ' te ') solo coincidan como palabra completa.
const normalize = (s: string) =>
  ` ${s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `

export function familyOf(note: string): Family {
  const n = normalize(note)
  for (const [family, words] of KEYWORDS) if (words.some((w) => n.includes(w))) return family
  return 'otra'
}

/** "Manzana, lichi y rosa." → ["Manzana", "lichi", "rosa"] */
export function splitNotes(text: string): string[] {
  return text
    .replace(/\.\s*$/, '')
    .split(/,|\sy\s|\se\s|;|\//)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Peso por familia: las notas de fondo pesan más porque son las que duran en la piel. */
export function accords(top: string, heart: string, base: string, max = 5): { family: Family; weight: number }[] {
  const score = new Map<Family, number>()
  const add = (text: string, w: number) =>
    splitNotes(text).forEach((n) => {
      const f = familyOf(n)
      if (f !== 'otra') score.set(f, (score.get(f) ?? 0) + w)
    })
  add(top, 1)
  add(heart, 1.5)
  add(base, 2)
  const list = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, max)
  const top1 = list[0]?.[1] ?? 1
  return list.map(([family, w]) => ({ family, weight: Math.round((w / top1) * 100) }))
}

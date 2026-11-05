import { supabase } from '../lib/supabase'

const PRODUCT_SIDE = 1200
const BANNER_SIDE = 1400
const MAX_BYTES = 5 * 1024 * 1024 // mismo límite que el bucket (migración 0005)

async function draw(file: File, maxSide: number) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return { canvas, ctx }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), type, quality),
  )

/** Sin fondo = el borde de la imagen es transparente. Se revisa el contorno, no toda la foto. */
function hasTransparentEdge(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const edges = [ctx.getImageData(0, 0, w, 1), ctx.getImageData(0, h - 1, w, 1), ctx.getImageData(0, 0, 1, h), ctx.getImageData(w - 1, 0, 1, h)]
  let clear = 0, total = 0
  for (const { data } of edges) for (let i = 3; i < data.length; i += 4) { total++; if (data[i] < 20) clear++ }
  return clear / total > 0.5
}

async function upload(blob: Blob, folder: string, ext: string) {
  if (blob.size > MAX_BYTES) throw new Error('La imagen pesa más de 5 MB incluso reducida. Usa una más liviana.')
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase!.storage.from('products').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  return path
}

/** Productos: siempre PNG sin fondo, reducido a 1200 px (la transparencia se conserva). */
export async function uploadProductImage(file: File, slug: string): Promise<string> {
  if (file.type !== 'image/png') throw new Error('Sube la foto en PNG sin fondo.')
  const { canvas, ctx } = await draw(file, PRODUCT_SIDE)
  if (!hasTransparentEdge(ctx, canvas.width, canvas.height)) throw new Error('Esa foto tiene fondo. Quítale el fondo y súbela de nuevo en PNG.')
  return upload(await toBlob(canvas, 'image/png'), slug, 'png')
}

/** Banners: foto con fondo. WebP; Safari no lo genera y devuelve PNG, entonces se usa JPEG. */
export async function uploadBannerImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen')
  const { canvas } = await draw(file, BANNER_SIDE)
  let blob = await toBlob(canvas, 'image/webp', 0.82)
  if (blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', 0.85)
  return upload(blob, 'banners', blob.type === 'image/webp' ? 'webp' : 'jpg')
}

export async function deleteProductImage(path: string) {
  if (path.startsWith('http')) return
  await supabase!.storage.from('products').remove([path])
}

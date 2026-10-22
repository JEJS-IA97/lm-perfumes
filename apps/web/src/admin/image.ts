import { supabase } from '../lib/supabase'

const MAX_SIDE = 1400

/** Reduce a 1400 px y convierte a WebP en el navegador: ahorra el 1 GB gratis de Storage y acelera la tienda. */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), 'image/webp', 0.82),
  )
}

export async function uploadProductImage(file: File, slug: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo no es una imagen')
  const blob = await toWebp(file)
  const path = `${slug}/${crypto.randomUUID()}.webp`
  const { error } = await supabase!.storage.from('products').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  return path
}

export async function deleteProductImage(path: string) {
  if (path.startsWith('http')) return
  await supabase!.storage.from('products').remove([path])
}

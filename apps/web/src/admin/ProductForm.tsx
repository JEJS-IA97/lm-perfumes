import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Star, X } from 'lucide-react'
import { imageUrl, supabase } from '../lib/supabase'
import type { Product } from '../lib/types'
import { deleteProductImage, uploadProductImage } from './image'

const empty: Omit<Product, 'id' | 'created_at'> = {
  slug: '', name: '', brand: '', gender: 'damas', concentration: 'Eau de Parfum', volume_ml: 100,
  description: '', notes_top: '', notes_heart: '', notes_base: '',
  price_usd: 0, compare_at_usd: null, images: [], available: true, featured: false, sort_order: 0,
}

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function ProductForm() {
  const { id } = useParams()
  const isNew = id === 'nuevo'
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [p, setP] = useState(empty)
  const [loading, setLoading] = useState(!isNew)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    supabase!.from('products').select('*').eq('id', id!).single().then(({ data, error }) => {
      if (error) setError('No se encontró el producto.')
      else setP(data)
      setLoading(false)
    })
  }, [id, isNew])

  const set = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) => setP((prev) => ({ ...prev, [k]: v }))
  const done = () => qc.invalidateQueries({ queryKey: ['products'] }).then(() => qc.invalidateQueries({ queryKey: ['product'] }))

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (p.price_usd <= 0) return setError('El precio debe ser mayor que 0.')
    const row = { ...p, slug: p.slug || slugify(p.name) }
    setBusy('Guardando…')
    const { error } = isNew
      ? await supabase!.from('products').insert(row)
      : await supabase!.from('products').update(row).eq('id', id!)
    setBusy('')
    if (error) return setError(error.code === '23505' ? 'Ya existe un producto con esa URL (slug).' : error.message)
    await done()
    navigate('/admin/productos')
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return
    setBusy('Subiendo imágenes…')
    setError('')
    try {
      const slug = p.slug || slugify(p.name) || 'producto'
      const paths = await Promise.all([...files].map((f) => uploadProductImage(f, slug)))
      set('images', [...p.images, ...paths])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    }
    setBusy('')
  }

  async function onDelete() {
    if (!confirm(`¿Eliminar "${p.name}"? Los pedidos anteriores conservan su copia.`)) return
    setBusy('Eliminando…')
    const { error } = await supabase!.from('products').delete().eq('id', id!)
    if (error) { setBusy(''); return setError(error.message) }
    await Promise.all(p.images.map(deleteProductImage))
    await done()
    navigate('/admin/productos')
  }

  if (loading) return <p className="muted">Cargando…</p>

  return (
    <form className="admin-form" onSubmit={onSave}>
      <div className="admin__head">
        <h1>{isNew ? 'Nuevo producto' : p.name}</h1>
        <Link to="/admin/productos" className="link">Volver</Link>
      </div>

      <fieldset className="admin-card">
        <legend>Datos</legend>
        <label className="field"><span>Nombre</span><input className="input" required maxLength={120} value={p.name} onChange={(e) => set('name', e.target.value)} /></label>
        <div className="admin-form__row">
          <label className="field"><span>Marca</span><input className="input" maxLength={80} value={p.brand} onChange={(e) => set('brand', e.target.value)} /></label>
          <label className="field"><span>Sección</span>
            <select className="input" value={p.gender} onChange={(e) => set('gender', e.target.value as Product['gender'])}>
              <option value="damas">Damas</option><option value="caballeros">Caballeros</option><option value="unisex">Unisex (ambas)</option>
            </select>
          </label>
        </div>
        <div className="admin-form__row">
          <label className="field"><span>Concentración</span><input className="input" list="concentrations" value={p.concentration} onChange={(e) => set('concentration', e.target.value)} /></label>
          <datalist id="concentrations"><option value="Eau de Parfum" /><option value="Eau de Toilette" /><option value="Parfum" /><option value="Eau de Cologne" /></datalist>
          <label className="field"><span>Mililitros</span><input className="input" type="number" min={1} value={p.volume_ml ?? ''} onChange={(e) => set('volume_ml', e.target.value ? Number(e.target.value) : null)} /></label>
        </div>
        <div className="admin-form__row">
          <label className="field"><span>Precio USD</span><input className="input" type="number" min={0.01} step="0.01" required value={p.price_usd || ''} onChange={(e) => set('price_usd', Number(e.target.value))} /></label>
          <label className="field"><span>Precio anterior USD</span><input className="input" type="number" min={0} step="0.01" value={p.compare_at_usd ?? ''} onChange={(e) => set('compare_at_usd', e.target.value ? Number(e.target.value) : null)} /><small>Opcional, se muestra tachado.</small></label>
        </div>
        <label className="field"><span>URL (slug)</span><input className="input" pattern="[a-z0-9-]+" placeholder={slugify(p.name)} value={p.slug} onChange={(e) => set('slug', slugify(e.target.value))} /><small>Se genera del nombre si lo dejas vacío.</small></label>
      </fieldset>

      <fieldset className="admin-card">
        <legend>Notas y descripción</legend>
        <label className="field"><span>Notas de salida</span><input className="input" value={p.notes_top} onChange={(e) => set('notes_top', e.target.value)} /></label>
        <label className="field"><span>Notas de corazón</span><input className="input" value={p.notes_heart} onChange={(e) => set('notes_heart', e.target.value)} /></label>
        <label className="field"><span>Notas de fondo</span><input className="input" value={p.notes_base} onChange={(e) => set('notes_base', e.target.value)} /></label>
        <label className="field"><span>Descripción</span><textarea className="input" maxLength={4000} value={p.description} onChange={(e) => set('description', e.target.value)} /></label>
      </fieldset>

      <fieldset className="admin-card">
        <legend>Imágenes</legend>
        <div className="admin-images">
          {p.images.map((src, i) => (
            <figure key={src}>
              <img src={imageUrl(src)} alt="" />
              {i === 0 ? <figcaption>Portada</figcaption> : (
                <button type="button" className="icon-btn" aria-label="Usar como portada" onClick={() => set('images', [src, ...p.images.filter((x) => x !== src)])}><Star size={16} /></button>
              )}
              {/* shortcut: quitar no borra el archivo de Storage (podría no guardarse el cambio); limpiar huérfanos si se acerca a 1 GB */}
              <button type="button" className="icon-btn admin-images__remove" aria-label="Quitar imagen" onClick={() => set('images', p.images.filter((x) => x !== src))}><X size={16} /></button>
            </figure>
          ))}
          <label className="admin-images__add">
            <ImagePlus size={22} /><span>Agregar</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onUpload(e.target.files)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-card admin-form__checks">
        <legend>Visibilidad</legend>
        <label><input type="checkbox" checked={p.available} onChange={(e) => set('available', e.target.checked)} /> Disponible</label>
        <label><input type="checkbox" checked={p.featured} onChange={(e) => set('featured', e.target.checked)} /> Destacado en inicio</label>
        <label className="field"><span>Orden</span><input className="input" type="number" value={p.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} /><small>Menor número aparece primero.</small></label>
      </fieldset>

      {error && <p className="alert" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <button className="btn btn-primary" disabled={!!busy}>{busy || 'Guardar'}</button>
        {!isNew && <button type="button" className="btn btn-outline admin-danger" onClick={onDelete} disabled={!!busy}>Eliminar</button>}
      </div>
    </form>
  )
}

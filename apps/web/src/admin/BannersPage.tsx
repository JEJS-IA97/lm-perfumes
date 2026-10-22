import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Plus } from 'lucide-react'
import { imageUrl, supabase } from '../lib/supabase'
import type { Banner, BannerTone } from '../lib/types'
import { uploadProductImage } from './image'

const blank: Omit<Banner, 'id'> = { title: '', subtitle: '', cta_label: 'Ver más', cta_url: '/', image: '', tone: 'marca', active: true, sort_order: 0 }

export function BannersPage() {
  const qc = useQueryClient()
  const [edit, setEdit] = useState<Partial<Banner> | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { data, isPending, isError } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async (): Promise<Banner[]> => {
      const { data, error } = await supabase!.from('banners').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })

  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['admin-banners'] }), qc.invalidateQueries({ queryKey: ['banners'] })])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!edit) return
    setBusy(true)
    setError('')
    const { id, ...row } = edit
    const { error } = id
      ? await supabase!.from('banners').update(row).eq('id', id)
      : await supabase!.from('banners').insert(row)
    setBusy(false)
    if (error) return setError(error.message)
    setEdit(null)
    refresh()
  }

  async function onDelete(b: Banner) {
    if (!confirm(`¿Eliminar el banner "${b.title}"?`)) return
    const { error } = await supabase!.from('banners').delete().eq('id', b.id)
    if (error) alert(error.message)
    refresh()
  }

  async function onImage(file: File | undefined) {
    if (!file || !edit) return
    setBusy(true)
    try { setEdit({ ...edit, image: await uploadProductImage(file, 'banners') }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al subir') }
    setBusy(false)
  }

  if (isError) return <p className="alert">No se encontró la tabla de banners. Ejecuta <code>supabase/migrations/0002_banners.sql</code> en el SQL Editor de Supabase.</p>

  return (
    <section>
      <div className="admin__head">
        <h1>Banners del inicio</h1>
        {!edit && <button className="btn btn-primary" onClick={() => setEdit(blank)}><Plus size={18} /> Nuevo banner</button>}
      </div>

      {edit && (
        <form className="admin-form admin-card" onSubmit={onSave}>
          <label className="field"><span>Título</span><input className="input" required maxLength={90} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
          <label className="field"><span>Texto</span><input className="input" maxLength={200} value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} /></label>
          <div className="admin-form__row">
            <label className="field"><span>Texto del botón</span><input className="input" maxLength={30} value={edit.cta_label} onChange={(e) => setEdit({ ...edit, cta_label: e.target.value })} /></label>
            <label className="field"><span>Enlace del botón</span><input className="input" pattern="(/|https://).*" value={edit.cta_url} onChange={(e) => setEdit({ ...edit, cta_url: e.target.value })} /><small>Ej.: /damas, /caballeros, /producto/nombre o https://…</small></label>
          </div>
          <div className="admin-form__row">
            <label className="field"><span>Color</span>
              <select className="input" value={edit.tone} onChange={(e) => setEdit({ ...edit, tone: e.target.value as BannerTone })}>
                <option value="damas">Damas (rosa)</option><option value="caballeros">Caballeros (azul pizarra)</option><option value="marca">Marca (grafito y azul)</option>
              </select>
            </label>
            <label className="field"><span>Orden</span><input className="input" type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></label>
          </div>
          <div className="admin-images">
            {edit.image && <figure><img src={imageUrl(edit.image)} alt="" /></figure>}
            <label className="admin-images__add">
              <ImagePlus size={22} /><span>{edit.image ? 'Cambiar imagen' : 'Imagen (opcional)'}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onImage(e.target.files?.[0])} />
            </label>
          </div>
          <small className="muted">Foto horizontal, ideal 1800 × 700 px, con el producto hacia la derecha: el texto va a la izquierda. Sin imagen se usa una foto de ejemplo. En el inicio se muestran los 2 primeros banners visibles según el orden.</small>
          <label className="admin-form__checks"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Visible en la tienda</label>
          {error && <p className="alert" role="alert">{error}</p>}
          <div className="admin-form__actions">
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {isPending && <p className="muted">Cargando…</p>}
      <ul className="admin-list">
        {data?.map((b) => (
          <li key={b.id} className="admin-list__row admin-list__row--banner">
            <span><b>{b.title}</b><small className="muted">{b.tone} · orden {b.sort_order}</small></span>
            <span className={b.active ? 'pill pill--ok' : 'pill'}>{b.active ? 'Visible' : 'Oculto'}</span>
            <button className="btn btn-outline" onClick={() => setEdit(b)}>Editar</button>
            <button className="btn btn-outline admin-danger" onClick={() => onDelete(b)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

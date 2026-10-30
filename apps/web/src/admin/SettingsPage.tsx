import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useSettings } from '../api/catalog'
import { formatVes } from '../lib/order'
import { supabase } from '../lib/supabase'

export function SettingsPage() {
  const { data } = useSettings()
  const qc = useQueryClient()
  const [msg, setMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [auto, setAuto] = useState<boolean | null>(null)
  const rateAuto = auto ?? data?.rate_auto ?? false
  const hasBcv = data?.rate_auto !== undefined // la migración 0003 añade la columna

  const refresh = () => qc.invalidateQueries({ queryKey: ['settings'] })

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const row: Record<string, unknown> = { whatsapp_number: String(f.get('wa')).replace(/\D/g, ''), updated_at: new Date().toISOString() }
    if (hasBcv) row.rate_auto = rateAuto
    if (!rateAuto) row.exchange_rate = Number(f.get('rate'))
    const { error } = await supabase!.from('settings').update(row).eq('id', 1)
    setMsg(error ? `Error: ${error.message}` : 'Guardado.')
    refresh()
  }

  async function syncBcv() {
    setSyncing(true)
    setMsg('')
    const { data: rate, error } = await supabase!.rpc('refresh_bcv_rate')
    setSyncing(false)
    setMsg(error ? `No se pudo consultar el BCV: ${error.message}` : `Tasa BCV actualizada: ${formatVes(Number(rate))}`)
    refresh()
  }

  if (!data) return <p className="muted">Cargando…</p>

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin__head"><h1>Ajustes</h1></div>
      <fieldset className="admin-card">
        <legend>Tasa del dólar</legend>
        {hasBcv ? (
          <>
            <label className="admin-form__checks">
              <input type="checkbox" checked={rateAuto} onChange={(e) => setAuto(e.target.checked)} /> Usar la tasa oficial del BCV automáticamente (se actualiza cada hora)
            </label>
            <p className="admin-rate num">
              <b>{formatVes(data.exchange_rate)}</b> por 1 USD
              {data.rate_date && <span className="muted"> · BCV del {new Date(data.rate_date).toLocaleDateString('es-VE')}</span>}
            </p>
            <button type="button" className="btn btn-outline" onClick={syncBcv} disabled={syncing}>
              <RefreshCw size={16} className={syncing ? 'spin' : undefined} /> {syncing ? 'Consultando BCV…' : 'Actualizar con el BCV ahora'}
            </button>
          </>
        ) : (
          <p className="alert">Para la tasa automática del BCV ejecuta <code>supabase/migrations/0003_tasa_bcv.sql</code> en Supabase.</p>
        )}
        {!rateAuto && (
          <label className="field">
            <span>Tasa manual (Bs por 1 USD)</span>
            <input className="input" name="rate" type="number" step="0.0001" min="0.0001" required defaultValue={data.exchange_rate} />
            <small>Cada pedido guarda la tasa que tenía al momento de hacerse.</small>
          </label>
        )}
      </fieldset>
      <fieldset className="admin-card">
        <legend>WhatsApp</legend>
        <label className="field">
          <span>WhatsApp de la tienda</span>
          <input className="input" name="wa" inputMode="tel" required placeholder="58412XXXXXXX" defaultValue={data.whatsapp_number} />
          <small>Formato internacional sin + ni espacios: 58 + número sin el 0.</small>
        </label>
      </fieldset>
      <div className="admin-form__actions">
        <button className="btn btn-primary">Guardar</button>
        {msg && <span role="status">{msg}</span>}
      </div>
    </form>
  )
}

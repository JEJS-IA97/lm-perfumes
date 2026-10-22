import { useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettings } from '../api/catalog'
import { supabase } from '../lib/supabase'

export function SettingsPage() {
  const { data } = useSettings()
  const qc = useQueryClient()
  const [msg, setMsg] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const { error } = await supabase!
      .from('settings')
      .update({ exchange_rate: Number(f.get('rate')), whatsapp_number: String(f.get('wa')).replace(/\D/g, ''), updated_at: new Date().toISOString() })
      .eq('id', 1)
    setMsg(error ? `Error: ${error.message}` : 'Guardado.')
    qc.invalidateQueries({ queryKey: ['settings'] })
  }

  if (!data) return <p className="muted">Cargando…</p>

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin__head"><h1>Ajustes</h1></div>
      <fieldset className="admin-card">
        <label className="field">
          <span>Tasa del día (Bs por 1 USD)</span>
          <input className="input" name="rate" type="number" step="0.0001" min="0.0001" required defaultValue={data.exchange_rate} />
          <small>Los precios en bolívares de la tienda se calculan con esta tasa. Cada pedido guarda la tasa que tenía.</small>
        </label>
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

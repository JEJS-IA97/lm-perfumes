import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    setError('')
    const { error } = await supabase!.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    setLoading(false)
    if (error) setError('Correo o contraseña incorrectos.')
  }

  return (
    <div className="admin-center">
      <form className="admin-card login" onSubmit={onSubmit}>
        <img src="/images/lm-logo.png" alt="LM Perfumes" width="56" height="56" />
        <h1>Panel de administración</h1>
        <label className="field"><span>Correo</span><input className="input" name="email" type="email" autoComplete="username" required /></label>
        <label className="field"><span>Contraseña</span><input className="input" name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className="alert" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  )
}

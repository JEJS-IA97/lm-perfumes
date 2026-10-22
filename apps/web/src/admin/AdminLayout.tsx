import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/useTheme'
import { Login } from './Login'
import './admin.css'

export function AdminLayout() {
  useTheme('light')
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase)
    return (
      <div className="admin-center">
        <p>Configura <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en <code>.env</code> para usar el panel.</p>
      </div>
    )
  if (session === undefined) return <div className="admin-center muted">Cargando…</div>
  if (!session) return <Login />

  return (
    <div className="admin">
      <header className="admin__bar">
        <strong>LM · Panel</strong>
        <nav aria-label="Panel">
          <NavLink to="/admin" end>Pedidos</NavLink>
          <NavLink to="/admin/productos">Productos</NavLink>
          <NavLink to="/admin/inventario">Inventario</NavLink>
          <NavLink to="/admin/ajustes">Ajustes</NavLink>
        </nav>
        <button className="icon-btn" onClick={() => supabase!.auth.signOut()} aria-label="Cerrar sesión"><LogOut size={18} /></button>
      </header>
      <div className="admin__body"><Outlet /></div>
    </div>
  )
}

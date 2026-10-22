import { NavLink, Link } from 'react-router-dom'
import { Moon, ShoppingBag, Sun } from 'lucide-react'
import { useThemeMode } from '../../lib/theme'
import { cartCount, useCart } from '../../store/cart'
import './layout.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/damas', label: 'Damas' },
  { to: '/caballeros', label: 'Caballeros' },
  { to: '/unisex', label: 'Unisex' },
]

export function Header() {
  const count = useCart((s) => cartCount(s.lines))
  const setOpen = useCart((s) => s.setOpen)
  const { theme, toggle } = useThemeMode()

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link to="/" className="brand" aria-label="LM Perfumes, inicio">
          <img src="/images/lm-logo.png" alt="" width="40" height="40" />
          <span><small>Perfumes</small></span>
        </Link>
        <nav className="site-nav" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
          ))}
        </nav>
        <button className="cart-button" onClick={toggle} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {theme === 'dark' ? <Sun size={20} strokeWidth={1.6} /> : <Moon size={20} strokeWidth={1.6} />}
        </button>
        <button className="cart-button" onClick={() => setOpen(true)} aria-label={`Abrir carrito, ${count} productos`}>
          <ShoppingBag size={22} strokeWidth={1.6} />
          {count > 0 && <span className="cart-button__count num">{count}</span>}
        </button>
      </div>
    </header>
  )
}

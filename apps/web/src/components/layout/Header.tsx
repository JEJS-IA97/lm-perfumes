import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ChevronRight, Menu, MessageCircle, Moon, ShoppingBag, Sun, X } from 'lucide-react'
import { useSettings } from '../../api/catalog'
import { useThemeMode } from '../../lib/theme'
import { cartCount, useCart } from '../../store/cart'
import './layout.css'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/damas', label: 'Damas', section: 'damas' },
  { to: '/caballeros', label: 'Caballeros', section: 'caballeros' },
  { to: '/unisex', label: 'Unisex', section: 'unisex' },
]

export function Header() {
  const count = useCart((s) => cartCount(s.lines))
  const setCartOpen = useCart((s) => s.setOpen)
  const { theme, toggle } = useThemeMode()
  const { data: settings } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const menu = useRef<HTMLDialogElement>(null)
  const { pathname } = useLocation()
  const themeLabel = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  // <dialog> nativo para el menú móvil: foco atrapado, Escape y fondo inerte sin librerías.
  useEffect(() => {
    const d = menu.current
    if (!d) return
    if (menuOpen && !d.open) d.showModal()
    if (!menuOpen && d.open) d.close()
  }, [menuOpen])
  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <button className="cart-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen}>
          <Menu size={22} strokeWidth={1.6} />
        </button>
        <Link to="/" className="brand" aria-label="LM Perfumes, inicio">
          <img src="/images/lm-logo.png" alt="" width="40" height="40" />
          <span><small>Perfumes</small></span>
        </Link>
        <nav className="site-nav" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
          ))}
        </nav>
        <button className="cart-button theme-button" onClick={toggle} aria-label={themeLabel}>
          <ThemeIcon size={20} strokeWidth={1.6} />
        </button>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${count} productos`}>
          <ShoppingBag size={22} strokeWidth={1.6} />
          {count > 0 && <span className="cart-button__count num">{count}</span>}
        </button>
      </div>

      <dialog
        ref={menu}
        className="mobile-menu"
        aria-label="Menú"
        onClose={() => setMenuOpen(false)}
        onClick={(e) => e.target === menu.current && setMenuOpen(false)}
      >
        <div className="mobile-menu__panel">
          <div className="mobile-menu__head">
            <img src="/images/lm-logo.png" alt="LM Perfumes" width="40" height="40" />
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X size={22} /></button>
          </div>
          <nav className="mobile-menu__nav" aria-label="Principal">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} data-section={l.section}>
                <span className="mobile-menu__dot" aria-hidden="true" />
                <span className="display">{l.label}</span>
                <ChevronRight size={20} aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
          <div className="mobile-menu__foot">
            <button className="mobile-menu__row" onClick={toggle}>
              <ThemeIcon size={20} strokeWidth={1.6} /> {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </button>
            {settings?.whatsapp_number && (
              <a className="mobile-menu__row" href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">
                <MessageCircle size={20} strokeWidth={1.6} /> Escríbenos por WhatsApp
              </a>
            )}
          </div>
        </div>
      </dialog>
    </header>
  )
}

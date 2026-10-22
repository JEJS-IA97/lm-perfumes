import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'lm-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121113' : '#fcfbf9')
}

/** Tema global: sigue al dispositivo hasta que la persona elige con el botón; esa elección se recuerda. */
export function useThemeMode() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme as Theme) || 'light')

  useEffect(() => {
    const m = media()
    const onChange = () => {
      let stored: string | null = null
      try { stored = localStorage.getItem(KEY) } catch { /* modo privado */ }
      if (!stored) { const t = m.matches ? 'dark' : 'light'; apply(t); setTheme(t) }
    }
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    apply(next)
    setTheme(next)
    try { localStorage.setItem(KEY, next) } catch { /* modo privado */ }
  }

  return { theme, toggle }
}

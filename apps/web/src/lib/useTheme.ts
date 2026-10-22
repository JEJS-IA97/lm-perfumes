import { useEffect } from 'react'

/** Caballeros = oscuro; el resto = claro. Lo aplica a <html> para que header, carrito y footer acompañen. */
export function useTheme(theme: 'light' | 'dark') {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1012' : '#ffffff')
  }, [theme])
}

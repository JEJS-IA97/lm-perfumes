import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="container section">
      <h1 className="display">No encontramos esta página</h1>
      <p className="muted">Puede que el producto ya no esté en el catálogo.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </section>
  )
}

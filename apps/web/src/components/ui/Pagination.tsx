import { ChevronLeft, ChevronRight } from 'lucide-react'
import './pagination.css'

/** Páginas visibles: 1 … 4 5 6 … 12 (siempre primera, última y vecinas de la actual). */
export function pageList(current: number, total: number): (number | '…')[] {
  const out: (number | '…')[] = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) out.push(p)
    else if (out[out.length - 1] !== '…') out.push('…')
  }
  return out
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <nav className="pagination" aria-label="Páginas">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft size={18} /></button>
      {pageList(page, total).map((p, i) =>
        p === '…'
          ? <span key={`gap${i}`} className="pagination__gap">…</span>
          : <button key={p} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined} className="num">{p}</button>,
      )}
      <button onClick={() => onChange(page + 1)} disabled={page >= total} aria-label="Página siguiente"><ChevronRight size={18} /></button>
    </nav>
  )
}

import { useSettings } from '../../api/catalog'
import { formatUsd, formatVes, toVes } from '../../lib/order'

/** Precio en USD con su equivalente en bolívares según la tasa del panel. */
export function Price({ usd, compareAt, size = 'md' }: { usd: number; compareAt?: number | null; size?: 'md' | 'lg' }) {
  const { data: settings } = useSettings()
  return (
    <div className={`price price--${size}`}>
      <span className="price__usd num">{formatUsd(usd)}</span>
      {compareAt && compareAt > usd && <s className="price__before num">{formatUsd(compareAt)}</s>}
      {settings && <span className="price__ves num">{formatVes(toVes(usd, settings.exchange_rate))}</span>}
    </div>
  )
}

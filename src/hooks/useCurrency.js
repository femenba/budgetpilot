import { useAuth } from '../contexts/AuthContext'

export function useCurrency() {
  const { profile } = useAuth()
  const currency = profile?.currency ?? 'USD'

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency })
  const fmtCompact = new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    notation: 'compact', maximumFractionDigits: 1,
  })
  const fmtShort = new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  })

  const symbol = fmt.formatToParts(0).find(p => p.type === 'currency')?.value ?? currency

  return { currency, fmt, fmtCompact, fmtShort, symbol }
}

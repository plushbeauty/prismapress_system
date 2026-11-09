const toDate = (value: string | null | undefined): Date | null => {
  if (!value) return null
  // Datas ISO sem horário são tratadas como data civil local, sem deslocamento UTC.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

const localISO = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const brl = (value: number | null | undefined) =>
  (Number.isFinite(value) ? value! : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

export const num = (value: number | null | undefined, digits = 0) => {
  const safeDigits = Math.max(0, Math.min(20, Math.trunc(digits) || 0))
  const safeValue = Number.isFinite(value) ? value! : 0
  return safeValue.toLocaleString('pt-BR', {
    minimumFractionDigits: safeDigits,
    maximumFractionDigits: safeDigits,
  })
}

export const pct = (value: number | null | undefined, digits = 1) =>
  `${num(value, digits)}%`

export const dateBR = (iso: string | null | undefined) => {
  const date = toDate(iso)
  return date ? date.toLocaleDateString('pt-BR') : '—'
}

export const dateTimeBR = (iso: string | null | undefined) => {
  const date = toDate(iso)
  return date
    ? date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : '—'
}

/** Data civil local no formato YYYY-MM-DD. */
export const todayISO = () => localISO(new Date())

/** Soma dias corridos à data civil local, sem conversão UTC. */
export const addDaysISO = (days: number) => {
  const safeDays = Number.isFinite(days) ? Math.trunc(days) : 0
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + safeDays)
  return localISO(date)
}

/** Prazo em dias corridos entre hoje e uma data ISO. Negativo = atrasado. */
export const daysUntil = (iso: string | null | undefined) => {
  if (!iso) return null
  const datePart = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null
  const [year, month, day] = datePart.split('-').map(Number)
  const target = Date.UTC(year, month - 1, day)
  const now = new Date()
  const base = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target - base) / 86_400_000)
}

export const digits = (value: string) => value.replace(/\D+/g, '')

export const formatCnpj = (value: string) => {
  const d = digits(value).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export const formatPhone = (value: string) => {
  const d = digits(value).slice(0, 11)
  if (!d) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return d.replace(/^(\d{2})(\d+)/, '($1) $2')
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, (_match, area, first, last) =>
      `(${area}) ${first}${last ? `-${last}` : ''}`,
    )
  }
  return d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, (_match, area, first, last) =>
    `(${area}) ${first}${last ? `-${last}` : ''}`,
  )
}

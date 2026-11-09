import type { ReactNode } from 'react'
import { AlertTriangle, Database, Inbox } from 'lucide-react'

export function Badge({ tone = 'neutral', children }: { tone?: 'ok' | 'warn' | 'bad' | 'info' | 'neutral'; children: ReactNode }) {
  return <span className={`pr-badge pr-badge-${tone}`}>{children}</span>
}

const statusMap: Record<string, { tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral'; label: string }> = {
  rascunho: { tone: 'neutral', label: 'Rascunho' },
  enviado: { tone: 'info', label: 'Enviado' },
  aprovado: { tone: 'ok', label: 'Aprovado' },
  recusado: { tone: 'bad', label: 'Recusado' },
  expirado: { tone: 'warn', label: 'Expirado' },
  aberto: { tone: 'info', label: 'Aberto' },
  em_producao: { tone: 'warn', label: 'Em produção' },
  concluido: { tone: 'ok', label: 'Concluído' },
  cancelado: { tone: 'bad', label: 'Cancelado' },
  pendente: { tone: 'warn', label: 'Pendente' },
  pago: { tone: 'ok', label: 'Pago' },
  vencido: { tone: 'bad', label: 'Vencido' },
  aguardando_prova: { tone: 'warn', label: 'Aguardando prova' },
  prova_aprovada: { tone: 'ok', label: 'Prova aprovada' },
}

export function StatusBadge({ status }: { status: string }) {
  const key = (status || '').toLowerCase().trim().replace(/[\\s-]+/g, '_')
  const s = statusMap[key] ?? { tone: 'neutral' as const, label: status?.trim() || '—' }
  return <Badge tone={s.tone}>{s.label}</Badge>
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-cyan">{eyebrow}</p>}
        <h1 className="pr-h1 truncate">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-mutedink">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-3',
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={`pr-card ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
          <div className="min-w-0">
            {title && <h2 className="pr-h3 truncate">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[10px] text-mutedink">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function Kpi({
  label,
  value,
  hint,
  tone = 'navy',
  icon,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'navy' | 'cyan' | 'magenta' | 'sun' | 'ok'
  icon?: ReactNode
}) {
  const bar = {
    navy: 'bg-navy',
    cyan: 'bg-cyan',
    magenta: 'bg-magenta',
    sun: 'bg-sun',
    ok: 'bg-[#12805c]',
  }[tone]
  return (
    <div className="pr-kpi relative overflow-hidden">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${bar}`} />
      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="min-w-0">
          <p className="pr-label">{label}</p>
          <p className="mt-1 truncate text-[19px] font-black leading-none tracking-[-0.02em] text-ink tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-[10px] font-semibold text-mutedink">{hint}</p>}
        </div>
        {icon && <span className="text-[#9db2c3]">{icon}</span>}
      </div>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eef3f7] text-[#7e97aa]">
        <Inbox size={18} />
      </span>
      <p className="text-[12px] font-extrabold text-ink">{title}</p>
      {description && <p className="max-w-md text-[11px] leading-relaxed text-mutedink">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="mb-3 flex items-start gap-2 rounded-[2px] border border-[#e0b4b4] bg-[#fdeaea] px-3 py-2 text-[11px] font-semibold text-[#a82929]">
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span className="min-w-0 break-words">{message}</span>
    </div>
  )
}

export function DbPending({ what = 'este módulo' }: { what?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-[2px] border border-[#d9c48a] bg-[#fdf6e3] px-3 py-2 text-[11px] leading-relaxed text-[#7a5b11]">
      <Database size={14} className="mt-0.5 shrink-0" />
      <span>
        O banco do PRISMAPRES ainda não foi aplicado neste projeto Supabase. {what} fica vazio até rodar a migration
        <code className="mx-1 rounded bg-[#f3e6c4] px-1 py-0.5 font-mono text-[10px]">supabase/migrations/0001_prismapres_core.sql</code>
        e cadastrar a empresa em <code className="mx-1 rounded bg-[#f3e6c4] px-1 py-0.5 font-mono text-[10px]">supabase/00_bootstrap.sql</code>.
      </span>
    </div>
  )
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className = '',
}: {
  items: { value: T; label: string; badge?: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={`flex flex-wrap gap-1 ${className}`}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={`pr-tab ${value === it.value ? 'pr-tab-on' : 'pr-tab-off'}`}
        >
          {it.label}
          {it.badge && <span className="rounded-[2px] bg-black/10 px-1 text-[8px] font-black">{it.badge}</span>}
        </button>
      ))}
    </div>
  )
}

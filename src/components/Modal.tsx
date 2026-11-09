import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  width?: 'md' | 'lg' | 'xl'
}

const widths = {
  md: 'max-w-[560px]',
  lg: 'max-w-[820px]',
  xl: 'max-w-[1080px]',
} as const

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-[2px] sm:p-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pr-modal-title"
        aria-describedby={subtitle ? 'pr-modal-subtitle' : undefined}
        className={`animate-fade-up w-full ${widths[width]} rounded-[6px] border border-line bg-white shadow-lift`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line bg-[#f7fafc] px-4 py-3">
          <div className="min-w-0">
            <h2 id="pr-modal-title" className="pr-h2 truncate">
              {title}
            </h2>
            {subtitle && (
              <p id="pr-modal-subtitle" className="mt-1 text-[11px] text-mutedink">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pr-btn-ghost h-7 w-7 shrink-0 px-0"
            aria-label="Fechar"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </header>

        <div className="px-4 py-3">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line bg-[#f7fafc] px-4 py-3">
            {footer}
          </footer>
        )}
      </section>
    </div>
  )
}

import type { ReactNode } from 'react'
import { ArrowRight, Command, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { href: '/#inicio', label: 'Início' },
  { href: '/#planos', label: 'Planos' },
  { href: '/#recursos', label: 'Recursos' },
  { href: '/#vantagens', label: 'Vantagens' },
  { href: '/#depoimentos', label: 'Depoimentos' },
  { href: '/#faq', label: 'FAQ' },
]

type PublicShellProps = {
  children: ReactNode
  onLogin: () => void
}

export default function PublicShell({ children, onLogin }: PublicShellProps) {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <div className="public-shell">
      <header className="public-shell-header">
        <a className="brand public-shell-brand" href="/#inicio" aria-label="PRISMAPRES — página inicial">
          <Command /> PRISMA<span>PRES</span>
        </a>

        <nav className="public-shell-nav" aria-label="Navegação pública">
          {links.map(link => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="public-shell-actions">
          <button type="button" className="public-shell-enter" onClick={onLogin}>Entrar</button>
          <button type="button" className="public-shell-trial" onClick={onLogin}>
            15 dias grátis <ArrowRight size={14} />
          </button>
        </div>

        <button
          type="button"
          className="public-shell-menu"
          onClick={() => setOpen(value => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="public-shell-mobile-nav"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>

        {open && (
          <div className="public-shell-mobile" id="public-shell-mobile-nav">
            <nav aria-label="Navegação móvel">
              {links.map(link => (
                <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
              ))}
            </nav>
            <div>
              <button type="button" className="public-shell-enter" onClick={() => { closeMenu(); onLogin() }}>Entrar</button>
              <button type="button" className="public-shell-trial" onClick={() => { closeMenu(); onLogin() }}>15 dias grátis</button>
            </div>
          </div>
        )}
      </header>

      {children}

      <footer className="public-shell-footer" id="contato">
        <div className="public-shell-footer-main">
          <div>
            <a className="brand public-shell-brand public-shell-brand-light" href="/#inicio">
              <Command /> PRISMA<span>PRES</span>
            </a>
            <p>Sistema de gestão para gráficas. Orçamento com custo comprovado, produção controlada e entrega acompanhada — em uma base só.</p>
          </div>
          <div>
            <b>Sistema</b>
            <a href="/#recursos">Módulos</a>
            <a href="/#planos">Central de Custos</a>
            <a href="/#planos">Planos</a>
            <button type="button" onClick={onLogin}>Entrar</button>
          </div>
          <div>
            <b>Operação</b>
            <a href="/#modulos">Comercial</a>
            <a href="/#modulos">Produção</a>
            <a href="/#modulos">Acabamento</a>
            <a href="/#modulos">Montagem</a>
          </div>
          <div>
            <b>Contato</b>
            <a href="mailto:comercial@prismapres.com.br">Falar com vendas</a>
            <a href="mailto:suporte@prismapres.com.br">Suporte</a>
            <a href="/#privacidade">Política de privacidade</a>
          </div>
        </div>
        <div className="public-shell-footer-bottom">
          <span>© {new Date().getFullYear()} PRISMAPRES. Todos os direitos reservados.</span>
          <span><i /> Plataforma em evolução contínua</span>
        </div>
      </footer>
    </div>
  )
}

export function PublicLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return <a href={to} className={className}>{children}</a>
}

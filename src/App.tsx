import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import PlanosPage from './features/comercial/PlanosPage'
import DashboardPage from './features/comercial/DashboardPage'
import BlogPage from './features/comercial/BlogPage'
import WorkspaceModule from './features/workspace/WorkspaceModule'
import './features/comercial/PlanosPage.css'
import PublicShell from './features/public/PublicShell'
import { ArrowUpRight, Bell, BookOpen, Boxes, CheckCircle2, ChevronDown, ClipboardList, Command, Factory, FileText, LayoutDashboard, Palette, Plus, Printer, Search, Settings2, ShoppingCart, Truck, Users, Wallet, Sparkles } from 'lucide-react'

const groups = [
  { name: 'WORKSPACE', items: [['Visão geral', LayoutDashboard]] },
  { name: 'COMERCIAL', items: [['Orçamentos', ClipboardList], ['Pedidos', ShoppingCart], ['Clientes', Users]] },
  { name: 'ARTE & PRÉ-IMPRESSÃO', items: [['Pré-impressão', FileText], ['Engenharia gráfica', Palette]] },
  { name: 'PRODUÇÃO', items: [['Chão de gráfica', Factory]] },
  { name: 'SUPRIMENTOS', items: [['Materiais', Boxes], ['Estoque', Boxes], ['Compras', ShoppingCart]] },
  { name: 'FISCAL & FINANCEIRO', items: [['Fiscal', FileText], ['Financeiro', Wallet]] },
  { name: 'LOGÍSTICA', items: [['Entregas', Truck]] },
  { name: 'GESTÃO', items: [['Relatórios', ClipboardList]] },
  { name: 'SISTEMA', items: [['Configurações', Settings2], ['Blog', BookOpen]] },
] as const

function PublicHome({ onLogin }: { onLogin: () => void }) {
  return (
    <PublicShell onLogin={onLogin}>
    <main className="public-home">
      <section className="public-hero" id="inicio">
        <div className="public-hero-copy">
          <span className="public-eyebrow"><Sparkles size={14}/> GESTÃO INTELIGENTE PARA O UNIVERSO DA IMPRESSÃO</span>
          <h1>Sua gráfica merece<br/><em>uma nova dimensão.</em></h1>
          <p>Orçamentos, pedidos, produção e gestão conectados em uma plataforma criada para simplificar o dia a dia de gráficas e empresas de impressão.</p>
          <div className="public-actions"><a href="#planos" className="public-cta">Conhecer planos <ArrowUpRight size={17}/></a><button onClick={onLogin} className="public-secondary">Já tenho acesso</button></div>
          <small>Uma operação mais organizada. Do primeiro orçamento à entrega.</small>
        </div>
        <div className="public-visual" aria-label="Painel visual do PRISMAPRES">
          <div className="visual-sheet sheet-back"></div><div className="visual-sheet sheet-front"><div className="sheet-top">PRISMAPRES <span>PRINT MANAGEMENT</span></div><div className="sheet-art"><i/><i/><i/></div><b>IDEIAS QUE<br/>GANHAM FORMA.</b><small>IMPRESSÃO · CRIATIVIDADE · GESTÃO</small></div>
          <div className="visual-chip"><CheckCircle2 size={16}/> Tudo conectado em um só lugar</div>
        </div>
      </section>
      <section className="public-benefits" id="modulos">
        <div><small>UMA PLATAFORMA COMPLETA</small><h2>Mais controle para criar.<br/>Mais tempo para crescer.</h2></div>
        <div className="benefit-grid"><article><ClipboardList/><b>Comercial</b><p>Orçamentos, clientes e pedidos em um fluxo organizado.</p></article><article><Printer/><b>Produção gráfica</b><p>Fichas técnicas, etapas, máquinas e acompanhamento.</p></article><article><Palette/><b>Engenharia gráfica</b><p>Materiais, formatos, cores e especificações de impressão.</p></article><article><Wallet/><b>Gestão</b><p>Estoque e visão financeira para decidir com segurança.</p></article></div>
      </section>
      <section className="public-plans" id="planos"><PlanosPage /></section>
      <section className="public-about" id="fluxo"><div><small>PRISMAPRES</small><h2>Gestão inteligente para o universo da impressão.</h2><p>Uma experiência simples e integrada para acompanhar cada etapa do trabalho gráfico.</p></div><button className="public-cta" onClick={onLogin}>Acessar minha conta <ArrowUpRight size={17}/></button></section>
    </main>
    </PublicShell>
  )
}

function AppContent() {
  const [mode, setMode] = useState<'home' | 'login' | 'app'>('home')
  const [page, setPage] = useState('Visão geral')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (mode === 'home') return <PublicHome onLogin={() => setMode('login')} />

  if (mode === 'login') return <main className="login">
    <section className="visual"><div className="brand"><Command/> PRISMA<span>PRES</span></div><div><small>GESTÃO INTELIGENTE PARA GRÁFICAS</small><h1>Sua gráfica.<br/><em>Em outra</em> dimensão.</h1><p>Da primeira ideia à entrega final: clareza, controle e criatividade em cada etapa da impressão.</p></div><div className="paper-art"><i/><i/><i/></div><footer>COMERCIAL · PRODUÇÃO · FINANCEIRO</footer></section>
    <section className="access"><small>PRISMAPRES / PORTAL</small><form onSubmit={e => { e.preventDefault(); setMode('app') }}><label>BEM-VINDO DE VOLTA</label><h2>Acesse seu espaço.</h2><p>Entre para acompanhar sua operação gráfica.</p><span>E-mail de acesso</span><input type="email" placeholder="voce@suaempresa.com.br" value={email} onChange={e => setEmail(e.target.value)} required/><span>Senha</span><input type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required/><button className="primary">Entrar no PRISMAPRES <ArrowUpRight size={17}/></button><button type="button" className="secondary" onClick={() => setMode('home')}>Voltar ao site</button><small className="disclaimer">Ambiente demonstrativo. A autenticação real será conectada ao Supabase exclusivo do PRISMAPRES.</small></form><footer>© 2026 PRISMAPRES</footer></section>
  </main>

  return (
    <div className="shell">
      <aside className="app-sidebar" aria-label="Navegação principal">
        <div className="brand dark" aria-label="PRISMAPRES"><Command/> PRISMA<span>PRES</span></div>
        <div className="company">P <span><b>Plush Print Studio</b><small>Ambiente demonstrativo</small></span><ChevronDown size={15}/></div>
        <nav aria-label="Módulos do PRISMAPRES">
          {groups.map(group => <section className="navgroup" key={group.name}>
            <small>{group.name}</small>
            {group.items.map(([label, Icon]) => <button className={page === label ? 'selected' : ''} onClick={() => setPage(label)} key={label}><Icon size={17}/>{label}</button>)}
          </section>)}
        </nav>
        <button className="back-public" onClick={() => setMode('home')}>← Site público</button>
        <div className="user">FS <span><b>Administrador</b><small>Gestor da gráfica</small></span></div>
      </aside>
      <main>
        <header>
          <span>Workspace　/　<b>{page}</b></span>
          <div><Search size={16}/><input placeholder="Buscar pedidos, clientes..."/><Bell size={18}/><b>FS</b></div>
        </header>
        <article className="content">
          <div className="heading">
            <div><small>WORKSPACE GRÁFICO · PRISMAPRES</small><h1>{page === 'Visão geral' ? 'Sua gráfica em foco' : page}</h1><p>Do orçamento à entrega, todas as etapas conectadas.</p></div>
            {page !== 'Blog' && <button className="primary" onClick={() => setPage('Orçamentos')}><Plus size={16}/> Novo orçamento</button>}
          </div>
          {page === 'Blog' ? <BlogPage/> : page === 'Visão geral' ? <DashboardPage onNavigate={setPage}/> : <WorkspaceModule page={page} onNavigate={setPage}/>}
        </article>
      </main>
    </div>
  )
}


class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[PRISMAPRES] Falha inesperada na interface:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <div className="app-error-card">
            <div className="brand"><Command /> PRISMA<span>PRES</span></div>
            <small>RECUPERAÇÃO DO SISTEMA</small>
            <h1>Não foi possível carregar esta tela.</h1>
            <p>Ocorreu uma falha inesperada na interface. Tente recarregar a aplicação.</p>
            <button className="primary" onClick={() => window.location.reload()}>Recarregar PRISMAPRES</button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return <AppErrorBoundary><AppContent /></AppErrorBoundary>
}

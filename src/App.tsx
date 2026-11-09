import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
import DashboardPage from './features/comercial/DashboardPage'
import BlogPage from './features/comercial/BlogPage'
import WorkspaceModule from './features/workspace/WorkspaceModule'
import PublicShell from './features/public/PublicShell'
import { ArrowUpRight, Bell, BookOpen, Boxes, Check, CheckCircle2, ChevronDown, ClipboardList, Command, Factory, FileText, LayoutDashboard, Palette, Plus, Printer, Search, Settings2, ShoppingCart, Truck, Users, Wallet, Calculator, PackageCheck, Receipt, ShieldCheck, Cog, Headset, RefreshCw, LockKeyhole, Quote, Star } from 'lucide-react'

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
  const benefits = [
    { Icon: Calculator, title: 'Controle de Custos', copy: 'Saiba quanto custa produzir cada trabalho.' },
    { Icon: Factory, title: 'Gestão da Produção', copy: 'Acompanhe ordens, etapas e prazos.' },
    { Icon: ClipboardList, title: 'Orçamentos Inteligentes', copy: 'Organize propostas e transforme em pedidos.' },
    { Icon: PackageCheck, title: 'Estoque Integrado', copy: 'Controle materiais e insumos da gráfica.' },
    { Icon: Wallet, title: 'Financeiro Completo', copy: 'Tenha visão clara de entradas e saídas.' },
    { Icon: Receipt, title: 'Notas Fiscais', copy: 'Prepare sua operação para uma rotina fiscal integrada.' },
    { Icon: ShieldCheck, title: 'Segurança Avançada', copy: 'Acesso organizado e proteção das informações.' },
  ]
  const plans = [
    { name: 'Básico', price: '99,90', features: ['Gestão de orçamentos', 'Controle de estoque', 'Financeiro básico', 'Suporte por e-mail'] },
    { name: 'Profissional', price: '149,90', popular: true, features: ['Tudo do Plano Básico', 'Central de Custos Avançada', 'Produção e PCP Integrado', 'Suporte Prioritário'] },
    { name: 'Enterprise', price: '249,90', features: ['Tudo do Plano Profissional', 'Relatórios Personalizados', 'Integrações Especiais', 'Suporte Dedicado'] },
  ]
  const advantages = [
    { Icon: Cog, title: 'Tecnologia de Ponta', copy: 'Uma plataforma moderna para conectar a operação.' },
    { Icon: Headset, title: 'Suporte Especializado', copy: 'Apoio próximo para a rotina da sua gráfica.' },
    { Icon: RefreshCw, title: 'Atualizações Constantes', copy: 'Evolução contínua da plataforma.' },
    { Icon: LockKeyhole, title: 'Segurança Garantida', copy: 'Estrutura pensada para proteger seus dados.' },
  ]
  return (
    <PublicShell onLogin={onLogin}>
      <main className="public-home">
        <section className="pp-hero" id="inicio">
          <div className="pp-hero-copy">
            <span className="pp-eyebrow"><span/> SISTEMA DE GESTÃO PARA GRÁFICAS</span>
            <h1>Sua gráfica mais <em>produtiva</em> e lucrativa.</h1>
            <p>Tenha o controle de toda a sua operação em um só lugar. Do orçamento à produção, do estoque ao financeiro: gestão simples para sua gráfica crescer.</p>
            <div className="pp-hero-actions"><a className="pp-button pp-button-primary" href="#planos">Conheça os Planos <ArrowUpRight size={17}/></a><a className="pp-button pp-button-outline" href="#recursos">Ver Demonstração <ArrowUpRight size={17}/></a></div>
            <div className="pp-trust"><CheckCircle2 size={16}/> Mais organização, produtividade e controle no dia a dia.</div>
          </div>
          <div className="pp-hero-art" role="img" aria-label="Composição gráfica com impressora industrial e cores de impressão">
            <div className="pp-cmyk pp-cyan"/><div className="pp-cmyk pp-magenta"/><div className="pp-cmyk pp-yellow"/>
            <div className="pp-print-photo"><div className="pp-machine-top"><span/><span/><span/></div><div className="pp-machine-body"><div className="pp-machine-screen"><i/><i/><i/></div><div className="pp-paper-feed"><b/><b/><b/><b/></div><div className="pp-machine-label">INDUSTRIAL PRINT SYSTEM</div></div><div className="pp-paper-output"/></div>
            <div className="pp-art-caption"><Printer size={15}/> IMPRESSÃO COM CONTROLE TOTAL</div>
          </div>
        </section>
        <section className="pp-benefit-strip" id="recursos">
          {benefits.map(({Icon,title,copy}) => <article key={title}><span><Icon size={20}/></span><div><b>{title}</b><small>{copy}</small></div></article>)}
        </section>
        <section className="pp-plans" id="planos">
          <div className="pp-section-heading"><span className="pp-eyebrow">NOSSOS PLANOS</span><h2>Escolha o plano ideal<br/>para sua gráfica.</h2><p>Comece com o essencial e evolua conforme sua operação cresce.</p><a href="mailto:comercial@prismapres.com.br" className="pp-specialist">Fale com um especialista <ArrowUpRight size={16}/></a></div>
          <div className="pp-plan-grid">{plans.map(plan => <article className={plan.popular ? 'pp-plan pp-plan-popular' : 'pp-plan'} key={plan.name}>
            {plan.popular && <span className="pp-popular">MAIS POPULAR</span>}
            <h3>{plan.name}</h3><p className="pp-plan-intro">{plan.name === 'Básico' ? 'Para organizar o essencial.' : plan.name === 'Profissional' ? 'Para acelerar sua produção.' : 'Para operações que precisam ir além.'}</p>
            <div className="pp-price"><small>R$</small><strong>{plan.price}</strong><small>/mês</small></div>
            <a href="mailto:comercial@prismapres.com.br" className={plan.popular ? 'pp-button pp-button-primary' : 'pp-button pp-button-outline'}>Tenho interesse <ArrowUpRight size={15}/></a>
            <div className="pp-plan-divider"/>
            <b className="pp-includes">O que está incluído</b>
            <ul>{plan.features.map(feature => <li key={feature}><Check size={15}/>{feature}</li>)}</ul>
          </article>)}</div>
          <p className="pp-price-note">Planos apresentados como referência comercial. Consulte condições, disponibilidade e contratação com nossa equipe.</p>
        </section>
        <section className="pp-proof" id="depoimentos">
          <div className="pp-testimonial"><div className="pp-quote-icon"><Quote size={22}/></div><div className="pp-stars">{[1,2,3,4,5].map(n=><Star key={n} size={14} fill="currentColor"/>)}</div><blockquote>“O PRISMAPRES transformou nossa gráfica. Com o sistema, controlamos nossos custos, entregamos mais rápido e aumentamos nosso faturamento.”</blockquote><div className="pp-person"><div className="pp-person-avatar">MS</div><div><b>Mariana Silva</b><small>Proprietária · Gráfica Expansão</small></div></div></div>
          <div className="pp-advantages" id="vantagens"><span className="pp-eyebrow">FEITO PARA A ROTINA GRÁFICA</span><h2>Por que escolher o PRISMAPRES?</h2>{advantages.map(({Icon,title,copy})=><article key={title}><span><Icon size={19}/></span><div><b>{title}</b><small>{copy}</small></div></article>)}</div>
        </section>
        <section className="pp-final-cta" id="faq"><div className="pp-final-cmyk"><i/><i/><i/></div><span className="pp-eyebrow">SUA GRÁFICA PODE IR MAIS LONGE</span><h2>Pronto para levar sua gráfica<br/>para o próximo nível?</h2><p>Comece agora mesmo e conheça o PRISMAPRES.</p><button className="pp-button pp-button-orange" onClick={onLogin}>Criar Minha Conta <ArrowUpRight size={17}/></button></section>
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

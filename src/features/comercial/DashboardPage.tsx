/*
 * @REVISAO: PRISMAPRES-ERP-20261109-005
 * @DATA: 2026-11-09
 * @ALTERACOES:
 * - Dashboard inspirado na referência enviada, preservando o shell e navegação do PRISMAPRES.
 * - KPIs, produção, financeiro e notas consultados no Supabase por empresa_id.
 * - Removidos números, clientes, notas e movimentações fictícias.
 * - Estados explícitos de carregamento, erro e ausência de dados.
 * @STATUS: APLICADO
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ClipboardList, Factory, FileText, LoaderCircle, Plus, ReceiptText, RefreshCw, Users, Wallet, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { Cliente, NotaFiscal, OrdemServico, Pedido, TituloFinanceiro } from '../../lib/types'
import './DashboardPage.css'

type DashboardPageProps = { onNavigate: (page: string) => void }
type InvoiceFilter = 'Todas' | 'A receber' | 'A pagar'
type ChartPoint = { month: string; incoming: number; outgoing: number }
const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const dateLabel = (value: string | null) => value ? new Date(value + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem data'
const stageInfo = [
  { id: 'pre', label: 'Pré-impressão', color: '#8067df' },
  { id: 'impressao', label: 'Impressão', color: '#45aaa0' },
  { id: 'acabamento', label: 'Acabamento', color: '#e3a64f' },
  { id: 'expedicao', label: 'Expedição', color: '#d77c9e' },
  { id: 'concluido', label: 'Concluído', color: '#aaa6b5' },
]

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { empresa, perfil } = useSession()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [titulos, setTitulos] = useState<TituloFinanceiro[]>([])
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>('Todas')
  const [activeMonth, setActiveMonth] = useState(5)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [available, setAvailable] = useState({ pedidos: true, ordens: true, financeiro: true, notas: true, clientes: true })

  const carregar = useCallback(async (silent = false) => {
    if (!supabase || !empresa?.id) {
      setError('Banco de dados ou empresa não disponíveis nesta sessão.')
      setLoading(false)
      return
    }
    if (silent) setRefreshing(true); else setLoading(true)
    setError(null)
    const results = await Promise.all([
      supabase.from('gr_pedidos').select('*').eq('empresa_id', empresa.id),
      supabase.from('gr_ordens_servico').select('*').eq('empresa_id', empresa.id),
      supabase.from('gr_titulos_financeiros').select('*').eq('empresa_id', empresa.id),
      supabase.from('gr_notas_fiscais').select('*').eq('empresa_id', empresa.id).order('emitida_em', { ascending: false }).limit(8),
      supabase.from('gr_clientes').select('*').eq('empresa_id', empresa.id).eq('ativo', true),
    ])
    const [p, o, t, n, c] = results
    const flags = { pedidos: !p.error, ordens: !o.error, financeiro: !t.error, notas: !n.error, clientes: !c.error }
    setAvailable(flags)
    const failures = results.flatMap((result, index) => result.error ? [`${['Pedidos', 'Produção', 'Financeiro', 'Notas fiscais', 'Clientes'][index]}: ${result.error.message}`] : [])
    if (failures.length) setError(failures.join(' · '))
    if (!p.error) setPedidos((p.data ?? []) as Pedido[])
    if (!o.error) setOrdens((o.data ?? []) as OrdemServico[])
    if (!t.error) setTitulos((t.data ?? []) as TituloFinanceiro[])
    if (!n.error) setNotas((n.data ?? []) as NotaFiscal[])
    if (!c.error) setClientes((c.data ?? []) as Cliente[])
    setLoading(false)
    setRefreshing(false)
  }, [empresa?.id])

  useEffect(() => { void carregar() }, [carregar])

  const today = new Date()
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const monthTitles = titulos.filter(t => t.status === 'pago' && (t.pago_em ?? '').slice(0, 10) >= monthStart && (t.pago_em ?? '').slice(0, 10) <= todayISO)
  const received = monthTitles.filter(t => t.tipo === 'receber').reduce((sum, t) => sum + Number(t.valor || 0), 0)
  const paid = monthTitles.filter(t => t.tipo === 'pagar').reduce((sum, t) => sum + Number(t.valor || 0), 0)
  const receivable = titulos.filter(t => t.tipo === 'receber' && t.status === 'pendente').reduce((sum, t) => sum + Number(t.valor || 0), 0)
  const pendingOrders = pedidos.filter(p => p.status === 'aberto').length
  const activeOrders = ordens.filter(o => o.status !== 'concluido' && o.status !== 'cancelado')
  const dueToday = ordens.filter(o => o.fim_previsto === todayISO && o.status !== 'concluido' && o.status !== 'cancelado').length

  const chart = useMemo<ChartPoint[]>(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1)
    const key = monthKey(date)
    const rows = titulos.filter(t => t.vencimento.slice(0, 7) === key)
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      incoming: rows.filter(t => t.tipo === 'receber').reduce((sum, t) => sum + Number(t.valor || 0), 0) / 1000,
      outgoing: rows.filter(t => t.tipo === 'pagar').reduce((sum, t) => sum + Number(t.valor || 0), 0) / 1000,
    }
  }), [titulos])
  const maxChart = Math.max(10, ...chart.flatMap(point => [point.incoming, point.outgoing]))
  const currentChart = chart[activeMonth] ?? chart[5]
  const filteredInvoices = notas.filter(n => {
    if (invoiceFilter === 'Todas') return true
    return invoiceFilter === 'A receber' ? n.tipo === 'saida' : n.tipo === 'entrada'
  })
  const stages = stageInfo.map(stage => ({ ...stage, count: stage.id === 'concluido' ? ordens.filter(o => o.status === 'concluido').length : activeOrders.filter(o => o.etapa === stage.id).length }))
  const greeting = perfil?.nome ? perfil.nome.split(' ')[0] : 'Sua equipe'
  const formattedToday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(today)
  const invoiceClient = (note: NotaFiscal) => clientes.find(client => client.id === (note.tipo === 'saida' ? note.cliente_id : note.fornecedor_id))?.nome ?? (note.tipo === 'saida' ? 'Cliente' : 'Fornecedor')

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <small>PAINEL DE GESTÃO · PRISMAPRES</small>
          <h2>Olá, {greeting}. Sua gráfica em movimento.</h2>
          <p>Visão operacional e financeira da sua empresa, atualizada pelo banco de dados.</p>
          <span className="dashboard-date"><CalendarDays size={14}/> {formattedToday}</span>
        </div>
        <div className="dashboard-hero-art" aria-hidden="true"><span>CMYK</span><i/><i/><i/></div>
      </section>

      <div className="dashboard-toolbar">
        <span>Dados da empresa · {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        <button type="button" onClick={() => void carregar(true)} disabled={refreshing}><RefreshCw size={13} className={refreshing ? 'dashboard-spin' : ''}/> Atualizar</button>
      </div>
      {error && <div className="dashboard-error" role="alert">{error}<span>Os indicadores indisponíveis não são preenchidos com dados fictícios.</span></div>}

      <section className="dashboard-kpis">
        {[
          { title: 'Orçamentos / pedidos abertos', value: available.pedidos ? String(pendingOrders).padStart(2, '0') : '—', detail: 'Pedidos aguardando aprovação', Icon: FileText, tone: 'purple', target: 'Pedidos' },
          { title: 'Ordens em produção', value: available.ordens ? String(activeOrders.length).padStart(2, '0') : '—', detail: 'Ordens não concluídas', Icon: Factory, tone: 'teal', target: 'Chão de gráfica' },
          { title: 'A receber', value: available.financeiro ? money(receivable) : '—', detail: 'Títulos pendentes', Icon: Wallet, tone: 'orange', target: 'Financeiro' },
          { title: 'Entregas previstas hoje', value: available.ordens ? String(dueToday).padStart(2, '0') : '—', detail: 'Ordens com prazo para hoje', Icon: CalendarDays, tone: 'pink', target: 'Chão de gráfica' },
        ].map(({ title, value, detail, Icon, tone, target }) => (
          <button type="button" className={`dashboard-kpi tone-card-${tone}`} key={title} onClick={() => onNavigate(target)}>
            <span className={`dashboard-kpi-icon tone-${tone}`}><Icon size={19}/></span>
            <div><small>{title}</small><strong>{loading ? '…' : value}</strong><p>{detail}</p></div><ArrowUpRight className="dashboard-kpi-arrow" size={16}/>
          </button>
        ))}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel dashboard-finance">
          <div className="dashboard-panel-heading"><div><small>VISÃO FINANCEIRA · TÍTULOS POR VENCIMENTO</small><h3>Receber x pagar</h3></div><span className="dashboard-period">Últimos 6 meses</span></div>
          <div className="dashboard-legend"><span><i className="legend-in"/> A receber</span><span><i className="legend-out"/> A pagar</span></div>
          {loading ? <div className="dashboard-loading"><LoaderCircle size={18}/> Carregando financeiro...</div> : !available.financeiro ? <div className="dashboard-loading">Dados financeiros indisponíveis.</div> : titulos.length === 0 ? <div className="dashboard-loading">Nenhum título financeiro cadastrado.</div> : <>
            <div className="dashboard-chart" role="group" aria-label="Valores mensais de títulos a receber e pagar">
              <div className="chart-axis"><span>{Math.ceil(maxChart)}k</span><span>{Math.ceil(maxChart * .75)}k</span><span>{Math.ceil(maxChart * .5)}k</span><span>{Math.ceil(maxChart * .25)}k</span><span>0</span></div>
              <div className="chart-bars">{chart.map((item,index) => <button type="button" className="chart-month" key={item.month + index} onClick={() => setActiveMonth(index)} onFocus={() => setActiveMonth(index)} aria-pressed={activeMonth === index} aria-label={`${item.month}: receber ${money(item.incoming * 1000)}, pagar ${money(item.outgoing * 1000)}`}><div className="chart-bar-pair"><i className="chart-in" style={{height:`${item.incoming / maxChart * 100}%`}}/><i className="chart-out" style={{height:`${item.outgoing / maxChart * 100}%`}}/></div><small>{item.month}</small></button>)}</div>
            </div>
            <div className="dashboard-chart-selected"><b>{currentChart?.month}</b><span>A receber: {money((currentChart?.incoming ?? 0) * 1000)}</span><span>A pagar: {money((currentChart?.outgoing ?? 0) * 1000)}</span></div>
          </>}
          <p className="dashboard-chart-caption">Valores obtidos dos títulos financeiros da empresa. Agrupados pelo mês de vencimento.</p>
        </article>

        <article className="dashboard-panel dashboard-invoices">
          <div className="dashboard-panel-heading"><div><small>ROTINA FISCAL</small><h3>Notas fiscais</h3></div><button className="dashboard-text-action" onClick={() => onNavigate('Fiscal')}>Ver módulo <ArrowRight size={14}/></button></div>
          <div className="invoice-tabs" role="group" aria-label="Filtrar notas fiscais">{(['Todas','A receber','A pagar'] as const).map(filter => <button type="button" key={filter} aria-pressed={invoiceFilter === filter} className={invoiceFilter === filter ? 'active' : ''} onClick={() => setInvoiceFilter(filter)}>{filter}</button>)}</div>
          {loading ? <div className="dashboard-loading">Carregando notas...</div> : !available.notas ? <div className="dashboard-loading">Notas fiscais indisponíveis.</div> : filteredInvoices.length ? <div className="invoice-list">{filteredInvoices.slice(0,5).map(note => <div className="invoice-row" key={note.id}><div><b>NF {note.numero}</b><small>{invoiceClient(note)} · {dateLabel(note.emitida_em)}</small></div><strong>{money(note.valor)}</strong><span className={note.tipo === 'saida' ? 'invoice-receive' : 'invoice-pay'}>{note.tipo === 'saida' ? 'Saída' : 'Entrada'}</span></div>)}</div> : <div className="dashboard-loading">Nenhuma nota fiscal nesta visualização.</div>}
          <p className="dashboard-chart-caption">Documentos fiscais reais registrados no PRISMAPRES.</p>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><small>CHÃO DE GRÁFICA</small><h3>Fluxo de produção</h3></div><button className="dashboard-text-action" onClick={() => onNavigate('Chão de gráfica')}>Abrir produção <ArrowRight size={14}/></button></div>
          {loading ? <div className="dashboard-loading">Carregando ordens...</div> : !available.ordens ? <div className="dashboard-loading">Produção indisponível.</div> : <div className="production-stages">{stages.map(stage => <div key={stage.id}><span style={{background:stage.color}}><Check size={14}/></span><b>{stage.count}</b><small>{stage.label}</small></div>)}</div>}
          <p className="dashboard-chart-caption">Contagem de ordens reais por etapa atual.</p>
        </article>

        <article className="dashboard-panel dashboard-summary">
          <div className="dashboard-panel-heading"><div><small>RESUMO FINANCEIRO</small><h3>Movimentação do mês</h3></div><Wallet size={18}/></div>
          {!available.financeiro ? <div className="dashboard-loading">Financeiro indisponível.</div> : <><div className="summary-values"><div><small>Recebido</small><b className="summary-positive">{loading ? '…' : money(received)}</b><span><ArrowDownRight size={13}/> Títulos pagos</span></div><div><small>Pago</small><b>{loading ? '…' : money(paid)}</b><span><ArrowUpRight size={13}/> Títulos pagos</span></div></div><div className="summary-balance"><small>Saldo líquido do mês</small><strong>{loading ? '…' : money(received - paid)}</strong></div></>}
        </article>

        <article className="dashboard-panel dashboard-quick">
          <div className="dashboard-panel-heading"><div><small>PRODUTIVIDADE</small><h3>Atalhos rápidos</h3></div><Zap size={18}/></div>
          <button onClick={() => onNavigate('Orçamentos')}><Plus/><span>Novo orçamento</span><ArrowRight/></button>
          <button onClick={() => onNavigate('Clientes')}><Users/><span>Cadastrar cliente</span><ArrowRight/></button>
          <button onClick={() => onNavigate('Engenharia gráfica')}><ClipboardList/><span>Ficha técnica</span><ArrowRight/></button>
          <button onClick={() => onNavigate('Fiscal')}><ReceiptText/><span>Notas fiscais</span><ArrowRight/></button>
        </article>
      </section>
      <footer className="dashboard-footer">PRISMAPRES · Gestão inteligente para o universo da impressão.<span>{loading ? 'Carregando dados da empresa…' : `Empresa: ${empresa?.nome ?? '—'} · Atualização mediante consulta ao Supabase`}</span></footer>
      <div className="dashboard-revision">REV. PRISMAPRES-ERP-20261109-005 · DASHBOARD CONECTADO A DADOS REAIS</div>
    </div>
  )
}

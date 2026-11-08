import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ClipboardList, Factory, FileText, Plus, ReceiptText, Users, Wallet, Zap } from "lucide-react";
import "./DashboardPage.css";

type DashboardPageProps = { onNavigate: (page: string) => void };

const chart = [
  { month: "Jan", incoming: 28, outgoing: 18 },
  { month: "Fev", incoming: 24, outgoing: 15 },
  { month: "Mar", incoming: 30, outgoing: 18 },
  { month: "Abr", incoming: 31, outgoing: 18 },
  { month: "Mai", incoming: 33, outgoing: 19 },
  { month: "Jun", incoming: 36, outgoing: 21 },
];

const invoices = [
  { number: "NF-e exemplo 125", client: "Cliente demonstrativo A", amount: "R$ 3.250,00", kind: "A receber" },
  { number: "NF-e exemplo 124", client: "Fornecedor demonstrativo B", amount: "R$ 1.870,00", kind: "A pagar" },
  { number: "NF-e exemplo 123", client: "Cliente demonstrativo C", amount: "R$ 5.600,00", kind: "A receber" },
];

const stages = [
  { label: "Aguardando", count: 2, color: "stage-purple" },
  { label: "Pré-impressão", count: 1, color: "stage-teal" },
  { label: "Impressão", count: 3, color: "stage-orange" },
  { label: "Acabamento", count: 2, color: "stage-pink" },
  { label: "Pronto", count: 1, color: "stage-muted" },
];


export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <small>PAINEL DE GESTÃO · PRISMAPRES</small>
          <h2>Sua gráfica em movimento.</h2>
          <p>Uma visão clara do comercial à expedição, em um só lugar.</p>
          <span className="dashboard-date"><CalendarDays size={14} /> {today}</span>
        </div>
        <div className="dashboard-hero-art" aria-hidden="true"><span>CMYK</span><i/><i/><i/></div>
      </section>

      <div className="dashboard-demo-note">PAINEL DEMONSTRATIVO · Os valores e registros abaixo são ilustrativos e ainda não vêm do banco de dados.</div>

      <section className="dashboard-kpis">
        {[
          { title: "Orçamentos abertos", value: "12", detail: "Aguardando retorno", Icon: FileText, tone: "purple" },
          { title: "Pedidos em produção", value: "08", detail: "Em diferentes etapas", Icon: Factory, tone: "teal" },
          { title: "A receber", value: "R$ 18.450", detail: "Contas de clientes", Icon: Wallet, tone: "orange" },
          { title: "Entregas programadas", value: "03", detail: "Agenda demonstrativa", Icon: CalendarDays, tone: "pink" },
        ].map(({ title, value, detail, Icon, tone }) => (
          <article className="dashboard-kpi" key={title}>
            <span className={`dashboard-kpi-icon tone-${tone}`}><Icon size={19}/></span>
            <div><small>{title}</small><strong>{value}</strong><p>{detail}</p></div>
            <ArrowUpRight className="dashboard-kpi-arrow" size={16}/>
          </article>
        ))}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel dashboard-finance">
          <div className="dashboard-panel-heading"><div><small>VISÃO FINANCEIRA</small><h3>Receber x pagar</h3></div><span className="dashboard-period">Últimos 6 meses</span></div>
          <div className="dashboard-legend"><span><i className="legend-in"/> A receber</span><span><i className="legend-out"/> A pagar</span></div>
          <div className="dashboard-chart" role="img" aria-label="Gráfico demonstrativo de contas a receber e a pagar nos últimos seis meses">
            <div className="chart-axis"><span>40k</span><span>30k</span><span>20k</span><span>10k</span><span>0</span></div>
            <div className="chart-bars">{chart.map(item => <div className="chart-month" key={item.month}><div className="chart-bar-pair"><i className="chart-in" style={{height:`${item.incoming / 40 * 100}%`}}/><i className="chart-out" style={{height:`${item.outgoing / 40 * 100}%`}}/></div><small>{item.month}</small></div>)}</div>
          </div>
          <p className="dashboard-chart-caption">Valores ilustrativos em milhares de reais. Integração financeira ainda pendente.</p>
        </article>

        <article className="dashboard-panel dashboard-invoices">
          <div className="dashboard-panel-heading"><div><small>ROTINA FISCAL</small><h3>Notas fiscais</h3></div><button className="dashboard-text-action" onClick={() => onNavigate("Fiscal")}>Ver módulo <ArrowRight size={14}/></button></div>
          <div className="invoice-tabs"><span className="active">Todas</span><span>A receber</span><span>A pagar</span></div>
          <div className="invoice-list">{invoices.map(invoice => <div className="invoice-row" key={invoice.number}><div><b>{invoice.number}</b><small>{invoice.client}</small></div><strong>{invoice.amount}</strong><span className={invoice.kind === "A receber" ? "invoice-receive" : "invoice-pay"}>{invoice.kind}</span></div>)}</div>
          <p className="dashboard-chart-caption">Nenhuma nota fiscal real foi consultada.</p>
        </article>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-heading"><div><small>CHÃO DE GRÁFICA</small><h3>Fluxo de produção</h3></div><button className="dashboard-text-action" onClick={() => onNavigate("Chão de gráfica")}>Abrir produção <ArrowRight size={14}/></button></div>
          <div className="production-stages">{stages.map(stage => <div key={stage.label}><span className={stage.color}><Check size={14}/></span><b>{stage.count}</b><small>{stage.label}</small></div>)}</div>
          <p className="dashboard-chart-caption">Etapas e quantidades apenas para demonstração.</p>
        </article>

        <article className="dashboard-panel dashboard-summary">
          <div className="dashboard-panel-heading"><div><small>RESUMO FINANCEIRO</small><h3>Movimentação do mês</h3></div><Wallet size={18}/></div>
          <div className="summary-values"><div><small>Recebido</small><b className="summary-positive">R$ 92.800</b><span><ArrowDownRight size={13}/> Ilustrativo</span></div><div><small>Pago</small><b>R$ 63.500</b><span><ArrowUpRight size={13}/> Ilustrativo</span></div></div>
          <div className="summary-balance"><small>Saldo demonstrativo</small><strong>R$ 29.300</strong></div>
        </article>

        <article className="dashboard-panel dashboard-quick">
          <div className="dashboard-panel-heading"><div><small>PRODUTIVIDADE</small><h3>Atalhos rápidos</h3></div><Zap size={18}/></div>
          <button onClick={() => onNavigate("Orçamentos")}><Plus/><span>Novo orçamento</span><ArrowRight/></button>
          <button onClick={() => onNavigate("Clientes")}><Users/><span>Cadastrar cliente</span><ArrowRight/></button>
          <button onClick={() => onNavigate("Engenharia gráfica")}><ClipboardList/><span>Ficha técnica</span><ArrowRight/></button>
          <button onClick={() => onNavigate("Fiscal")}><ReceiptText/><span>Notas fiscais</span><ArrowRight/></button>
        </article>
      </section>
      <footer className="dashboard-footer">PRISMAPRES · Gestão inteligente para o universo da impressão.<span>Indicadores demonstrativos · aguardando integração</span></footer>
    </div>
  );
}

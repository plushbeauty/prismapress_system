import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Layers3,
  PackageCheck,
  Pause,
  Play,
  Printer,
  ScanLine,
} from 'lucide-react'
import './ChaoDeGraficaPage.css'

type ProductionTab = 'terminal' | 'fila'

export default function ChaoDeGraficaPage() {
  const [tab, setTab] = useState<ProductionTab>('terminal')

  return (
    <section className="print-floor" aria-labelledby="print-floor-title">
      <div className="print-floor-intro">
        <div>
          <span className="print-floor-kicker"><Printer size={14} /> PRODUÇÃO GRÁFICA</span>
          <h2 id="print-floor-title">Chão de gráfica</h2>
          <p>Terminal do operador e acompanhamento das ordens de impressão em um único espaço.</p>
        </div>
        <div className="print-floor-live"><span /> OPERAÇÃO CONECTADA QUANDO O ERP ESTIVER CONFIGURADO</div>
      </div>

      <div className="print-floor-tabs" role="tablist" aria-label="Área de produção">
        <button role="tab" aria-selected={tab === 'terminal'} className={tab === 'terminal' ? 'active' : ''} onClick={() => setTab('terminal')}>
          <ScanLine size={17} /> Terminal do operador
        </button>
        <button role="tab" aria-selected={tab === 'fila'} className={tab === 'fila' ? 'active' : ''} onClick={() => setTab('fila')}>
          <ClipboardList size={17} /> Fila de impressão
        </button>
      </div>

      {tab === 'terminal' ? (
        <div className="print-terminal">
          <article className="print-active-order">
            <div className="print-panel-heading">
              <span className="print-icon-tile"><Printer size={19} /></span>
              <div><small>ORDEM DE PRODUÇÃO ATIVA</small><h3>Nenhuma OP selecionada</h3></div>
              <span className="print-state"><span /> AGUARDANDO OP</span>
            </div>
            <div className="print-empty-order">
              <div className="print-empty-symbol"><FileText size={27} /></div>
              <h4>Pronto para iniciar um trabalho</h4>
              <p>Selecione uma ordem na fila para visualizar produto, cliente, substrato, formato, cores, máquina e especificações técnicas.</p>
              <button onClick={() => setTab('fila')}>Abrir fila de impressão <ArrowRight size={16} /></button>
            </div>
            <div className="print-order-meta">
              <div><small>OPERADOR</small><b>Não identificado</b></div>
              <div><small>MÁQUINA</small><b>Não vinculada</b></div>
              <div><small>ETAPA</small><b>Aguardando seleção</b></div>
            </div>
          </article>

          <aside className="print-operator-panel">
            <div className="print-panel-heading"><span className="print-icon-tile cyan"><Clock3 size={19} /></span><div><small>APONTAMENTO</small><h3>Registro de produção</h3></div></div>
            <div className="print-production-fields">
              <label>Quantidade produzida<input type="number" min="0" placeholder="0" disabled /></label>
              <label>Quantidade refug ada<input type="number" min="0" placeholder="0" disabled /></label>
              <label>Observações<textarea placeholder="Registre ocorrências ou detalhes do processo..." disabled /></label>
            </div>
            <div className="print-action-grid">
              <button disabled><Play size={16} /> Iniciar</button>
              <button disabled><Pause size={16} /> Registrar parada</button>
              <button disabled><PackageCheck size={16} /> Finalizar OP</button>
            </div>
            <p className="print-integration-note"><AlertCircle size={15} /> Ações serão habilitadas após conectar OPs, operadores e apontamentos ao banco exclusivo do PRISMAPRES.</p>
          </aside>
        </div>
      ) : (
        <div className="print-queue">
          <div className="print-queue-head">
            <div><small>PROGRAMAÇÃO DE PRODUÇÃO</small><h3>Fila de impressão</h3><p>Ordens liberadas para programação e execução.</p></div>
            <span className="print-queue-count">0 ordens aguardando</span>
          </div>
          <div className="print-queue-empty">
            <div className="print-empty-symbol"><Layers3 size={28} /></div>
            <h4>Nenhuma ordem disponível</h4>
            <p>Quando houver pedidos liberados para produção, eles aparecerão aqui com prioridade, prazo, máquina, material e arquivo de impressão.</p>
            <div className="print-queue-steps"><span><CheckCircle2 size={15} /> Pedido aprovado</span><ArrowRight size={14} /><span><CheckCircle2 size={15} /> Ficha técnica liberada</span><ArrowRight size={14} /><span><Printer size={15} /> Programação</span></div>
          </div>
        </div>
      )}
      <footer className="print-floor-foot"><span>PRISMAPRES · TERMINAL DE PRODUÇÃO</span><span>Interface preparada para integração operacional real</span></footer>
    </section>
  )
}

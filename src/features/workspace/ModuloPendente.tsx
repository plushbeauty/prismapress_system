import { ArrowLeft, CircleDashed, Database } from 'lucide-react'
import type { ReactNode } from 'react'

type PendingModule = {
  summary: string
  features: string[]
  pages: { label: string; route: string }[]
}

const pendingModules: Record<string, PendingModule> = {
  'Pré-impressão': {
    summary: 'Conferência técnica de arquivos, provas e liberação para produção gráfica.',
    features: ['Recebimento e versionamento de arquivos', 'Conferência de sangria, resolução, fontes e cores', 'Prova digital e aprovação do cliente', 'Liberação rastreável para produção'],
    pages: [{ label: 'Fila de pré-impressão', route: 'Pré-impressão' }, { label: 'Conferência de arquivos', route: 'Conferência' }, { label: 'Aprovação de prova', route: 'Provas' }],
  },
  'Engenharia gráfica': {
    summary: 'Padronização de produtos, materiais, formatos, processos e fichas técnicas.',
    features: ['Cadastro técnico de produtos gráficos', 'Substratos, gramaturas, formatos e aproveitamento', 'Cores, impressão e acabamentos', 'Revisões e roteiros de fabricação'],
    pages: [{ label: 'Fichas técnicas', route: 'Fichas técnicas' }, { label: 'Materiais e formatos', route: 'Materiais' }, { label: 'Roteiros gráficos', route: 'Roteiros' }],
  },
  'Chão de gráfica': {
    summary: 'Acompanhamento da execução das ordens de produção por etapa e equipamento.',
    features: ['Fila de ordens liberadas', 'Apontamento por operador e equipamento', 'Consumo, perdas e refugos', 'Rastreabilidade entre etapas e expedição'],
    pages: [{ label: 'Terminal de produção', route: 'Terminal' }, { label: 'Apontamentos', route: 'Apontamentos' }, { label: 'Paradas e ocorrências', route: 'Ocorrências' }],
  },
  'Materiais': {
    summary: 'Catálogo técnico de papéis, mídias, tintas, chapas e insumos gráficos.',
    features: ['Cadastro de materiais e unidades', 'Especificações técnicas e fornecedores', 'Lotes e rastreabilidade', 'Integração com compras e estoque'],
    pages: [{ label: 'Catálogo de materiais', route: 'Catálogo' }, { label: 'Grupos e unidades', route: 'Grupos' }],
  },
  'Estoque': {
    summary: 'Controle de entradas, saídas, reservas, perdas e inventários da gráfica.',
    features: ['Saldos por local e lote', 'Reservas vinculadas às ordens', 'Movimentações com documento de origem', 'Inventário e ajustes auditáveis'],
    pages: [{ label: 'Saldos', route: 'Saldos' }, { label: 'Movimentações', route: 'Movimentações' }, { label: 'Inventário', route: 'Inventário' }],
  },
  'Compras': {
    summary: 'Planejamento de reposição, cotações, fornecedores e recebimento de insumos.',
    features: ['Solicitações de compra', 'Cotações comparativas', 'Aprovação e pedido ao fornecedor', 'Conferência de recebimento e entrada no estoque'],
    pages: [{ label: 'Solicitações', route: 'Solicitações' }, { label: 'Cotações', route: 'Cotações' }, { label: 'Recebimentos', route: 'Recebimentos' }],
  },
  'Fiscal': {
    summary: 'Gestão de documentos fiscais emitidos e recebidos e suas obrigações.',
    features: ['Documentos fiscais de saída e entrada', 'Conferência de impostos e operações', 'Vínculo com pedidos e financeiro', 'Relatórios e trilha de auditoria'],
    pages: [{ label: 'Notas fiscais', route: 'Notas fiscais' }, { label: 'Apuração', route: 'Apuração' }, { label: 'Obrigações', route: 'Obrigações' }],
  },
  'Financeiro': {
    summary: 'Controle de contas a pagar e receber, caixa e conciliação financeira.',
    features: ['Títulos a pagar e a receber', 'Fluxo de caixa por período', 'Baixas e conciliação', 'Relatórios financeiros conectados aos documentos'],
    pages: [{ label: 'Contas a pagar', route: 'Contas a pagar' }, { label: 'Contas a receber', route: 'Contas a receber' }, { label: 'Fluxo de caixa', route: 'Fluxo de caixa' }],
  },
  'Entregas': {
    summary: 'Separação, conferência, expedição e confirmação das entregas.',
    features: ['Separação por pedido e volume', 'Romaneios e transportadoras', 'Programação de entrega', 'Comprovante e histórico de entrega'],
    pages: [{ label: 'Fila de expedição', route: 'Expedição' }, { label: 'Romaneios', route: 'Romaneios' }, { label: 'Acompanhamento', route: 'Acompanhamento' }],
  },
  'Relatórios': {
    summary: 'Indicadores consolidados das áreas comercial, produtiva e administrativa.',
    features: ['Vendas, margens e conversão', 'Produtividade e prazos', 'Consumo e perdas de materiais', 'Indicadores financeiros e fiscais'],
    pages: [{ label: 'Comercial', route: 'Comercial' }, { label: 'Produção', route: 'Produção' }, { label: 'Financeiro', route: 'Financeiro' }],
  },
  'Configurações': {
    summary: 'Parâmetros da empresa, usuários, perfis de acesso e preferências.',
    features: ['Dados cadastrais da empresa', 'Usuários e perfis de acesso', 'Permissões por módulo', 'Parâmetros operacionais e integrações'],
    pages: [{ label: 'Empresa', route: 'Empresa' }, { label: 'Usuários e permissões', route: 'Usuários' }, { label: 'Preferências', route: 'Preferências' }],
  },
}

export default function ModuloPendente({ page, onBack }: { page: string; onBack: () => void }) {
  const mod = pendingModules[page]
  if (!mod) {
    return <section className="workspace-form"><h2>Módulo não encontrado</h2><p>Esta área não corresponde a um módulo cadastrado no PRISMAPRES.</p><button className="workspace-primary" onClick={onBack}><ArrowLeft size={14}/> Voltar ao dashboard</button></section>
  }

  return (
    <div className="workspace-module">
      <div className="workspace-module-heading">
        <div><span className="workspace-eyebrow"><CircleDashed size={13}/> MÓDULO EM CONSTRUÇÃO</span><h2>{page}</h2><p>{mod.summary}</p></div>
        <button className="workspace-primary" onClick={onBack}><ArrowLeft size={14}/> Voltar ao dashboard</button>
      </div>
      <div className="workspace-demo-alert"><Database size={15}/> IMPLEMENTAÇÃO PENDENTE <span>Esta tela não simula registros nem gravações.</span></div>
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="workspace-form">
          <div className="workspace-form-title"><div><small>ESCOPO APROVADO</small><h3>O que será entregue</h3></div></div>
          <ul className="mt-4 grid gap-2">{mod.features.map(feature => <li key={feature} className="flex items-start gap-2 rounded-lg border border-[#eeedf3] bg-[#faf9fc] px-3 py-2 text-[11px] font-semibold text-[#51476e]"><CircleDashed size={13} className="mt-0.5 shrink-0 text-[#8e899c]"/>{feature}</li>)}</ul>
        </section>
        <section className="workspace-form">
          <div className="workspace-form-title"><div><small>ESTADO DA ENTREGA</small><h3>Sem dados fictícios</h3></div></div>
          <p className="mt-3 text-[11px] leading-relaxed text-[#716b83]">O menu e esta área de referência estão disponíveis. As telas operacionais e a persistência serão liberadas somente quando estiverem conectadas às tabelas próprias do PRISMAPRES no Supabase.</p>
          <div className="mt-4 rounded-lg border border-[#e6e0fa] bg-[#f8f6ff] p-3 text-[10px] leading-relaxed text-[#725dc0]">Nenhum registro, indicador ou status de produção é inventado nesta visualização.</div>
        </section>
      </div>
      <section className="workspace-table-panel">
        <div className="workspace-table-top"><div><small>MAPA DE TELAS</small><h3>Telas previstas para este módulo</h3></div></div>
        <ul className="grid gap-2 px-4 pb-4 sm:grid-cols-2">{mod.pages.map(item => <li key={item.route} className="rounded-lg border border-[#eeedf3] px-3 py-2"><strong className="block text-[11px] text-[#51476e]">{item.label}</strong><span className="font-mono text-[9px] text-[#9993a7]">{item.route}</span></li>)}</ul>
      </section>
    </div>
  )
}

import { useMemo, useState } from 'react'
import {
  ArrowDownToLine, ArrowUpRight, BadgeCheck, CalendarClock, CheckCircle2,
  ClipboardList, Download, FilePlus2, Filter, Package, Plus, Printer,
  Search, Send, Settings2, Truck, Users, Wallet, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './WorkspaceModule.css'

type ModuleConfig = {
  eyebrow: string
  title: string
  description: string
  action: string
  icon: LucideIcon
  stats: [string, string, string][]
  columns: string[]
  rows: string[][]
  fields: string[]
  tabs: string[]
}

const modules: Record<string, ModuleConfig> = {
  'Orçamentos': {
    eyebrow: 'COMERCIAL · FORMAÇÃO DE PREÇOS', title: 'Central de orçamentos',
    description: 'Monte propostas com materiais, processos, acabamentos, margem e prazo de entrega.',
    action: 'Novo orçamento', icon: ClipboardList,
    stats: [['Em elaboração','08','Rascunhos'],['Aguardando cliente','12','Propostas enviadas'],['Aprovados no mês','19','Conversão a acompanhar']],
    columns: ['Código','Cliente','Produto / serviço','Valor estimado','Validade','Situação'],
    rows: [['ORC-0028','Studio Amora','Cartão de visita 4x4','R$ 680,00','12/11/2026','Aguardando'],['ORC-0027','Café Aurora','Rótulos adesivos','R$ 1.240,00','10/11/2026','Em análise'],['ORC-0026','Clínica Horizonte','Folder A4 dobrado','R$ 920,00','09/11/2026','Aprovado']],
    fields: ['Cliente','Produto / serviço','Quantidade','Valor estimado'], tabs: ['Todos','Rascunhos','Enviados','Aprovados','Perdidos'],
  },
  'Pedidos': {
    eyebrow: 'COMERCIAL · CARTEIRA DE PEDIDOS', title: 'Pedidos de venda',
    description: 'Acompanhe os pedidos confirmados, seus prazos, prioridades e andamento.',
    action: 'Novo pedido', icon: FilePlus2,
    stats: [['Abertos','16','Carteira atual'],['Em atraso','02','Exigem atenção'],['Entregues no mês','34','Histórico']],
    columns: ['Pedido','Cliente','Descrição','Entrada','Entrega prevista','Status'],
    rows: [['PED-0268','Studio Amora','Cartões de visita','06/11/2026','10/11/2026','Em produção'],['PED-0267','Café Aurora','Embalagem kraft','05/11/2026','11/11/2026','Pré-impressão'],['PED-0265','Clínica Horizonte','Folder A4','04/11/2026','09/11/2026','Acabamento']],
    fields: ['Cliente','Descrição do pedido','Data de entrega','Prioridade'], tabs: ['Todos','Abertos','Em produção','Concluídos','Cancelados'],
  },
  'Clientes': {
    eyebrow: 'COMERCIAL · RELACIONAMENTO', title: 'Cadastro de clientes',
    description: 'Centralize contatos, endereços, condições comerciais e histórico de compras.',
    action: 'Novo cliente', icon: Users,
    stats: [['Clientes ativos','128','Carteira'],['Novos no mês','09','Cadastros'],['Sem contato recente','14','Relacionamento']],
    columns: ['Código','Cliente / empresa','Contato','E-mail','Último pedido','Situação'],
    rows: [['CLI-0108','Studio Amora','Marina Costa','marina@exemplo.com','06/11/2026','Ativo'],['CLI-0107','Café Aurora','Rafael Lima','rafael@exemplo.com','05/11/2026','Ativo'],['CLI-0106','Clínica Horizonte','Ana Prado','ana@exemplo.com','04/11/2026','Ativo']],
    fields: ['Nome / razão social','Pessoa de contato','E-mail','Telefone'], tabs: ['Todos','Ativos','Inativos','Prospects'],
  },
  'Pré-impressão': {
    eyebrow: 'ENGENHARIA GRÁFICA · PRÉ-IMPRESSÃO', title: 'Fila de pré-impressão',
    description: 'Organize conferência de arquivos, fechamento, imposição, provas e liberação para produzir.',
    action: 'Abrir análise', icon: Printer,
    stats: [['Aguardando arquivo','05','Entrada'],['Em conferência','03','Pré-flight'],['Liberados','11','Prontos para produção']],
    columns: ['OS / Pedido','Cliente','Arquivo','Formato','Conferência','Responsável'],
    rows: [['PED-0268','Studio Amora','cartao_final.pdf','90 × 50 mm','Conferir sangria','Arte'],['PED-0267','Café Aurora','rotulo_v8.pdf','A4 / faca','Em análise','Pré-impressão'],['PED-0265','Clínica Horizonte','folder_final.pdf','A4 aberto','Liberado','Arte']],
    fields: ['Pedido','Nome do arquivo','Formato final','Observações'], tabs: ['Todos','Aguardando','Em análise','Prova','Liberados'],
  },
  'Engenharia gráfica': {
    eyebrow: 'ENGENHARIA GRÁFICA · FICHA TÉCNICA', title: 'Produtos e processos gráficos',
    description: 'Defina substratos, formatos, cores, impressão, acabamento, perdas técnicas e roteiro padrão.',
    action: 'Nova ficha técnica', icon: Settings2,
    stats: [['Fichas cadastradas','42','Catálogo'],['Em revisão','04','Engenharia'],['Processos ativos','12','Roteiros']],
    columns: ['Código','Produto / serviço','Processo','Material principal','Formato','Revisão'],
    rows: [['FT-0042','Cartão de visita','Offset','Couché 300 g','90 × 50 mm','REV. 03'],['FT-0041','Adesivo rótulo','Digital','BOPP branco','Variável','REV. 02'],['FT-0040','Banner','Grande formato','Lona 440 g','m²','REV. 01']],
    fields: ['Nome da ficha','Processo de impressão','Material principal','Formato / unidade'], tabs: ['Todas','Offset','Digital','Sublimação','Comunicação visual'],
  },
  'Chão de gráfica': {
    eyebrow: 'PRODUÇÃO · EXECUÇÃO', title: 'Chão de gráfica',
    description: 'Visualize a fila por etapa, prioridade, máquina, operador e prazo.',
    action: 'Apontar produção', icon: Printer,
    stats: [['Na fila','09','Ordens liberadas'],['Em execução','06','Ordens em processo'],['Paradas','01','Acompanhar motivo']],
    columns: ['OP','Produto','Etapa atual','Equipamento','Prazo','Prioridade'],
    rows: [['OP-0268','Cartão de visita','Impressão','Offset 01','10/11/2026','Alta'],['OP-0267','Embalagem kraft','Pré-impressão','Pré-flight','11/11/2026','Normal'],['OP-0265','Folder A4','Acabamento','Dobra 01','09/11/2026','Alta']],
    fields: ['Ordem de produção','Etapa','Equipamento','Observação do apontamento'], tabs: ['Quadro geral','Pré-impressão','Impressão','Acabamento','Expedição'],
  },
  'Materiais': {
    eyebrow: 'SUPRIMENTOS · CATÁLOGO TÉCNICO', title: 'Materiais gráficos',
    description: 'Cadastre papéis, mídias, tintas, chapas, insumos e suas especificações comerciais.',
    action: 'Novo material', icon: Package,
    stats: [['Itens ativos','216','Catálogo'],['Abaixo do mínimo','08','Repor'],['Aguardando cotação','05','Compras']],
    columns: ['Código','Material','Grupo','Unidade','Estoque atual','Mínimo'],
    rows: [['MAT-0216','Couché brilho 300 g','Papel','Folha','2.400','800'],['MAT-0215','Lona front 440 g','Mídia','m²','180','250'],['MAT-0214','Tinta CMYK','Tinta','Litro','36','12']],
    fields: ['Descrição do material','Grupo','Unidade de medida','Estoque mínimo'], tabs: ['Todos','Papéis','Mídias','Tintas','Chapas','Insumos'],
  },
  'Estoque': {
    eyebrow: 'SUPRIMENTOS · MOVIMENTAÇÃO', title: 'Controle de estoque',
    description: 'Consulte saldos, reservas para pedidos, entradas, saídas, perdas e inventários.',
    action: 'Registrar movimento', icon: Package,
    stats: [['Valor em estoque','R$ 84.200','Custo ilustrativo'],['Itens críticos','08','Abaixo do mínimo'],['Reservado para OP','R$ 12.640','Comprometido']],
    columns: ['Material','Localização','Saldo físico','Reservado','Disponível','Status'],
    rows: [['Couché brilho 300 g','Almox. A','2.400 fls','600 fls','1.800 fls','Normal'],['Lona front 440 g','Almox. B','180 m²','40 m²','140 m²','Atenção'],['Tinta CMYK','Almox. A','36 L','8 L','28 L','Normal']],
    fields: ['Material','Tipo de movimento','Quantidade','Documento de referência'], tabs: ['Saldos','Entradas','Saídas','Reservas','Inventário'],
  },
  'Compras': {
    eyebrow: 'SUPRIMENTOS · AQUISIÇÕES', title: 'Central de compras',
    description: 'Planeje reposições, solicite cotações, compare fornecedores e acompanhe pedidos.',
    action: 'Nova solicitação', icon: ArrowDownToLine,
    stats: [['Solicitações abertas','05','Em cotação'],['Pedidos emitidos','08','Compras'],['Aguardando recebimento','03','Entregas']],
    columns: ['Solicitação','Fornecedor','Itens','Data','Previsão','Status'],
    rows: [['SC-0085','Papelaria Central','Couché 300 g','07/11/2026','12/11/2026','Cotando'],['SC-0084','Química Print','Tinta CMYK','06/11/2026','10/11/2026','Aprovada'],['SC-0083','Mídias Brasil','Lona 440 g','05/11/2026','09/11/2026','Recebimento']],
    fields: ['Fornecedor','Material solicitado','Quantidade','Data necessária'], tabs: ['Todas','Solicitações','Cotações','Pedidos','Recebimentos'],
  },
  'Fiscal': {
    eyebrow: 'FISCAL · DOCUMENTOS', title: 'Central fiscal',
    description: 'Organize documentos fiscais emitidos e recebidos, vencimentos e conferência de valores.',
    action: 'Registrar nota fiscal', icon: FilePlus2,
    stats: [['Notas emitidas','28','No período'],['Notas recebidas','16','No período'],['Pendências','03','Conferência']],
    columns: ['Documento','Emissão','Cliente / fornecedor','Valor','Vencimento','Tipo'],
    rows: [['NF-e exemplo 125','07/11/2026','Studio Amora','R$ 3.250,00','17/11/2026','A receber'],['NF-e exemplo 124','06/11/2026','Papelaria Central','R$ 1.870,00','12/11/2026','A pagar'],['NFS-e exemplo 123','05/11/2026','Clínica Horizonte','R$ 5.600,00','15/11/2026','A receber']],
    fields: ['Número do documento','Cliente / fornecedor','Valor','Vencimento'], tabs: ['Todas','Emitidas','Recebidas','A receber','A pagar'],
  },
  'Financeiro': {
    eyebrow: 'FINANCEIRO · FLUXO DE CAIXA', title: 'Gestão financeira',
    description: 'Acompanhe contas a pagar e receber, caixa previsto, conciliação e resultados por período.',
    action: 'Novo lançamento', icon: Wallet,
    stats: [['A receber','R$ 42.680','Em aberto'],['A pagar','R$ 26.940','Em aberto'],['Saldo projetado','R$ 15.740','Período selecionado']],
    columns: ['Lançamento','Pessoa','Categoria','Vencimento','Valor','Situação'],
    rows: [['REC-0125','Studio Amora','Venda gráfica','17/11/2026','R$ 3.250,00','Previsto'],['PAG-0124','Papelaria Central','Matéria-prima','12/11/2026','R$ 1.870,00','Previsto'],['REC-0123','Clínica Horizonte','Serviço gráfico','15/11/2026','R$ 5.600,00','Recebido']],
    fields: ['Descrição','Pessoa / empresa','Valor','Vencimento'], tabs: ['Visão geral','A receber','A pagar','Caixa','Conciliação'],
  },
  'Entregas': {
    eyebrow: 'LOGÍSTICA · EXPEDIÇÃO', title: 'Entregas e expedição',
    description: 'Planeje separação, conferência, romaneios, transportadoras e confirmação de entrega.',
    action: 'Programar entrega', icon: Truck,
    stats: [['A separar','04','Pedidos prontos'],['Em rota','03','Em transporte'],['Entregues hoje','07','Confirmações']],
    columns: ['Pedido','Cliente','Volumes','Destino','Previsão','Status'],
    rows: [['PED-0268','Studio Amora','02','São Paulo · SP','10/11/2026','A separar'],['PED-0267','Café Aurora','05','Campinas · SP','11/11/2026','Programada'],['PED-0265','Clínica Horizonte','01','São Paulo · SP','09/11/2026','Entregue']],
    fields: ['Pedido','Endereço de entrega','Transportadora','Data prevista'], tabs: ['Todas','A separar','Programadas','Em rota','Entregues'],
  },
  'Relatórios': {
    eyebrow: 'GESTÃO · INTELIGÊNCIA', title: 'Relatórios gerenciais',
    description: 'Reúna indicadores comerciais, produtivos, financeiros, fiscais e de desempenho.',
    action: 'Gerar relatório', icon: Download,
    stats: [['Relatórios disponíveis','12','Modelos'],['Agendados','03','Rotinas'],['Exportações','08','Neste mês']],
    columns: ['Relatório','Área','Período','Atualização','Formato','Ação'],
    rows: [['Vendas por cliente','Comercial','Mensal','07/11/2026','PDF / XLS','Abrir'],['Produtividade por etapa','Produção','Semanal','07/11/2026','PDF / XLS','Abrir'],['Fluxo de caixa','Financeiro','Mensal','07/11/2026','PDF / XLS','Abrir']],
    fields: ['Relatório','Período inicial','Período final','Formato'], tabs: ['Comercial','Produção','Estoque','Fiscal','Financeiro'],
  },
  'Configurações': {
    eyebrow: 'SISTEMA · ADMINISTRAÇÃO', title: 'Configurações do PRISMAPRES',
    description: 'Organize dados da empresa, usuários, permissões, preferências e parâmetros de operação.',
    action: 'Adicionar usuário', icon: Settings2,
    stats: [['Usuários','04','Acessos cadastrados'],['Perfis','03','Níveis de acesso'],['Parâmetros','18','Preferências']],
    columns: ['Usuário','E-mail','Perfil','Último acesso','Situação','Ação'],
    rows: [['Administrador','admin@empresa.exemplo','Administrador','07/11/2026','Ativo','Gerenciar'],['Comercial','comercial@empresa.exemplo','Comercial','07/11/2026','Ativo','Gerenciar'],['Produção','producao@empresa.exemplo','Operador','06/11/2026','Ativo','Gerenciar']],
    fields: ['Nome do usuário','E-mail','Perfil de acesso','Situação'], tabs: ['Empresa','Usuários','Permissões','Preferências','Integrações'],
  },
}

const fallback: ModuleConfig = {
  eyebrow: 'PRISMAPRES · WORKSPACE', title: 'Área de trabalho',
  description: 'Organize as rotinas da sua empresa gráfica.',
  action: 'Novo registro', icon: ClipboardList,
  stats: [['Registros','—','Aguardando integração'],['Pendências','—','Aguardando integração'],['Atualização','—','Aguardando banco']],
  columns: ['Código','Descrição','Responsável','Data','Situação','Ação'],
  rows: [], fields: ['Descrição','Responsável','Observação'], tabs: ['Todos','Ativos','Concluídos'],
}

export default function WorkspaceModule({ page, onNavigate }: { page: string; onNavigate: (page: string) => void }) {
  const config = modules[page] ?? fallback
  const [activeTab, setActiveTab] = useState(config.tabs[0])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [values, setValues] = useState<string[]>(config.fields.map(() => ''))
  const [rows, setRows] = useState(config.rows)
  const Icon = config.icon
  const filtered = useMemo(() => rows.filter(row => row.join(' ').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [rows, query])

  const save = () => {
    if (!values.some(value => value.trim())) return
    const code = 'RASC-' + String(rows.length + 1).padStart(4, '0')
    const row = [code, ...values, 'Rascunho']
    setRows(current => [row, ...current])
    setValues(config.fields.map(() => ''))
    setShowForm(false)
  }

  return (
    <div className="workspace-module">
      <div className="workspace-module-heading">
        <div><span className="workspace-eyebrow"><Icon size={13}/> {config.eyebrow}</span><h2>{config.title}</h2><p>{config.description}</p></div>
        <button className="workspace-primary" onClick={() => setShowForm(value => !value)}><Plus size={16}/>{showForm ? 'Fechar formulário' : config.action}</button>
      </div>
      <div className="workspace-demo-alert"><BadgeCheck size={15}/> ESTRUTURA DE TELA MONTADA <span>Dados ilustrativos e rascunhos locais · integração com banco próprio pendente</span></div>
      <div className="workspace-stats">{config.stats.map(([label, value, detail]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>{detail}</span></article>)}</div>
      {showForm && <section className="workspace-form"><div className="workspace-form-title"><div><small>NOVO REGISTRO</small><h3>{config.action}</h3></div><button onClick={() => setShowForm(false)} aria-label="Fechar"><X size={17}/></button></div><div className="workspace-fields">{config.fields.map((field, index) => <label key={field}>{field}<input value={values[index] ?? ''} onChange={event => setValues(current => current.map((value, i) => i === index ? event.target.value : value))} placeholder={'Informe ' + field.toLocaleLowerCase('pt-BR')}/></label>)}</div><div className="workspace-form-actions"><span>Rascunho local, ainda não enviado ao banco.</span><button onClick={save}><CheckCircle2 size={15}/> Salvar rascunho</button></div></section>}
      <section className="workspace-table-panel">
        <div className="workspace-table-top"><div><small>REGISTROS DO MÓDULO</small><h3>{page}</h3></div><div className="workspace-tools"><label><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Pesquisar registros"/></label><button onClick={() => setQuery('')}><Filter size={14}/> Limpar</button><button onClick={() => setShowForm(true)}><Plus size={14}/> Novo</button></div></div>
        <div className="workspace-tabs">{config.tabs.map(tab => <button className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</div>
        <div className="workspace-table-scroll"><table><thead><tr>{config.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{filtered.length ? filtered.map((row, index) => <tr key={row[0] ?? index}>{config.columns.map((column, cell) => <td key={column}>{row[cell] ?? (cell === config.columns.length - 1 ? <span className="workspace-status">Em estruturação</span> : '—')}</td>)}</tr>) : <tr><td colSpan={config.columns.length} className="workspace-empty">Nenhum registro encontrado nesta visualização.</td></tr>}</tbody></table></div>
        <div className="workspace-table-footer"><span>Exibindo {filtered.length} registros ilustrativos</span><span>Visualização: {activeTab}</span></div>
      </section>
      <div className="workspace-next-step"><div><Send size={17}/><span><b>Próxima etapa: integração operacional</b><small>Conectar cadastros, permissões, anexos e movimentações ao banco exclusivo do PRISMAPRES.</small></span></div><button onClick={() => onNavigate('Configurações')}>Configurar sistema <ArrowUpRight size={14}/></button></div>
    </div>
  )
}

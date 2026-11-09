import type { LucideIcon } from 'lucide-react'
import {
  Boxes,
  Calculator,
  ClipboardCheck,
  FileStack,
  Fingerprint,
  Gauge,
  LayoutDashboard,
  Layers3,
  Printer,
  Receipt,
  ScanLine,
  Settings2,
  ShoppingCart,
  Truck,
  Wallet,
} from 'lucide-react'

export type ModuleId =
  | 'dashboard'
  | 'comercial'
  | 'custos'
  | 'preimpressao'
  | 'producao'
  | 'acabamento'
  | 'montagem'
  | 'pcp'
  | 'estoque'
  | 'compras'
  | 'financeiro'
  | 'fiscal'
  | 'entrega'
  | 'qualidade'
  | 'relatorios'
  | 'configuracoes'

export type ModuleDef = {
  id: ModuleId
  label: string
  short: string
  route: string
  icon: LucideIcon
  summary: string
  features: string[]
  pages: { label: string; route: string }[]
}

export const modules: ModuleDef[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    short: 'Painel',
    route: '/app',
    icon: LayoutDashboard,
    summary: 'Visão do dia: orçamentos parados, pedidos em produção, provas aguardando o cliente e caixa.',
    features: [
      'Orçamentos aguardando resposta com valor em jogo',
      'Pedidos por etapa e atraso de entrega',
      'Provas pendentes de aprovação do cliente',
      'Contas a receber e a pagar do mês',
    ],
    pages: [{ label: 'Visão geral', route: '/app' }],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    short: 'Comercial',
    route: '/app/comercial/orcamentos',
    icon: ClipboardCheck,
    summary: 'Cliente, orçamento, proposta e pedido no mesmo cadastro — sem redigitar item.',
    features: [
      'Orçamento em etapas com cálculo de custo ao lado',
      'Proposta com prazo de validade e versão congelada',
      'Conversão em pedido em um clique',
      'Histórico do cliente, tabela de preço e comissão',
    ],
    pages: [
      { label: 'Clientes', route: '/app/comercial/clientes' },
      { label: 'Orçamentos', route: '/app/comercial/orcamentos' },
      { label: 'Pedidos', route: '/app/comercial/pedidos' },
    ],
  },
  {
    id: 'custos',
    label: 'Central de Custos',
    short: 'Custos',
    route: '/app/custos',
    icon: Calculator,
    summary: 'O núcleo do sistema: composição de custo real por item, com tabela vigente e margem por produto.',
    features: [
      'Matéria-prima, energia, hora-máquina, mão de obra e terceiros',
      'Perdas e refugo previstos por processo',
      'Rateio de custo indireto e impostos',
      'Preço por unidade, margem e ponto de equilíbrio',
    ],
    pages: [
      { label: 'Composição', route: '/app/custos' },
      { label: 'Insumos', route: '/app/custos/insumos' },
      { label: 'Máquinas', route: '/app/custos/maquinas' },
      { label: 'Mão de obra', route: '/app/custos/mao-de-obra' },
      { label: 'Regras e margem', route: '/app/custos/regras' },
    ],
  },
  {
    id: 'preimpressao',
    label: 'Pré-impressão',
    short: 'Pré-impressão',
    route: '/app/preimpressao',
    icon: FileStack,
    summary: 'Arquivo, conferência técnica, prova e aprovação registrada com versão.',
    features: [
      'Checklist de arquivo: sangria, resolução, cor, faca',
      'Prova enviada e aprovada pelo cliente com data e hora',
      'Controle de versão do arquivo por pedido',
      'Imposição e aproveitamento de folha',
    ],
    pages: [{ label: 'Arquivos e provas', route: '/app/preimpressao' }],
  },
  {
    id: 'producao',
    label: 'Produção',
    short: 'Produção',
    route: '/app/producao',
    icon: Printer,
    summary: 'Fila de ordens de serviço, impressão, acabamento e montagem com apontamento na estação.',
    features: [
      'Ordem de serviço com etapa, máquina e responsável',
      'Apontamento de peças boas, refugo e parada',
      'Estação de operador em tela grande, com meta da tiragem',
      'Custo realizado x custo previsto por OS',
    ],
    pages: [
      { label: 'Ordens de serviço', route: '/app/producao' },
      { label: 'Acabamento', route: '/app/producao/acabamento' },
      { label: 'Montagem', route: '/app/producao/montagem' },
    ],
  },
  {
    id: 'acabamento',
    label: 'Acabamento de peças',
    short: 'Acabamento',
    route: '/app/producao/acabamento',
    icon: Layers3,
    summary: 'Roteiro por posto: corte, vinco, dobra, laminação, encadernação e refile com conferência.',
    features: [
      'Fila por posto e por máquina de acabamento',
      'Roteiro técnico da peça com tolerâncias',
      'Contagem de peças boas e refugo por operação',
      'Retrabalho registrado e custo de perda apurado',
    ],
    pages: [{ label: 'Estação de acabamento', route: '/app/producao/acabamento' }],
  },
  {
    id: 'montagem',
    label: 'Montagem de peças',
    short: 'Montagem',
    route: '/app/producao/montagem',
    icon: Boxes,
    summary: 'Montagem de caixa, kit, display e paletização com checklist de componentes e foto.',
    features: [
      'Lista de componentes conferida antes de fechar a caixa',
      'Checklist fotográfico do padrão aprovado',
      'Contagem por caixa, kit e palete',
      'Etiqueta e romaneio gerados da própria montagem',
    ],
    pages: [{ label: 'Estação de montagem', route: '/app/producao/montagem' }],
  },
  {
    id: 'pcp',
    label: 'PCP',
    short: 'PCP',
    route: '/app/pcp',
    icon: Gauge,
    summary: 'Capacidade por máquina, programação do dia e gargalo identificado antes de furar o prazo.',
    features: [
      'Carga por máquina e por posto de acabamento',
      'Programação em calendário com sequência',
      'Gargalo e atraso projetado',
      'Replanejamento com arrastar de ordem',
    ],
    pages: [{ label: 'Programação', route: '/app/pcp' }],
  },
  {
    id: 'estoque',
    label: 'Estoque',
    short: 'Estoque',
    route: '/app/estoque',
    icon: ScanLine,
    summary: 'Papel, tinta, chapa e substrato com lote, endereço, reserva e ponto de reposição.',
    features: [
      'Saldo por lote e por endereço de armazenagem',
      'Reservado x disponível por pedido',
      'Baixa automática pelo apontamento da OS',
      'Alerta de ponto de reposição',
    ],
    pages: [{ label: 'Posição de estoque', route: '/app/estoque' }],
  },
  {
    id: 'compras',
    label: 'Compras',
    short: 'Compras',
    route: '/app/compras',
    icon: ShoppingCart,
    summary: 'Solicitação, cotação com três fornecedores e pedido com prazo de entrega.',
    features: [
      'Solicitação gerada do ponto de reposição',
      'Mapa de cotação comparando preço e prazo',
      'Pedido de compra e previsão de recebimento',
      'Custo de compra atualiza a tabela de insumo',
    ],
    pages: [{ label: 'Compras', route: '/app/compras' }],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    short: 'Financeiro',
    route: '/app/financeiro',
    icon: Wallet,
    summary: 'Contas a pagar e a receber, fluxo de caixa, inadimplência e conciliação.',
    features: [
      'Título gerado do pedido com vencimento e parcela',
      'Fluxo de caixa projetado por semana',
      'Inadimplência por cliente',
      'Conciliação bancária e baixa manual',
    ],
    pages: [{ label: 'Financeiro', route: '/app/financeiro' }],
  },
  {
    id: 'fiscal',
    label: 'Fiscal',
    short: 'Fiscal',
    route: '/app/fiscal',
    icon: Receipt,
    summary: 'Nota de entrada e saída, impostos por operação e vínculo com o pedido.',
    features: [
      'NF de saída a partir do pedido faturado',
      'NF de entrada do insumo comprado',
      'Regra de imposto por produto e cliente',
      'Documento auxiliar e rastreio do XML',
    ],
    pages: [{ label: 'Documentos fiscais', route: '/app/fiscal' }],
  },
  {
    id: 'entrega',
    label: 'Entrega',
    short: 'Entrega',
    route: '/app/entrega',
    icon: Truck,
    summary: 'Expedição, romaneio, transportadora e comprovante de entrega.',
    features: [
      'Separação e conferência antes de embarcar',
      'Romaneio por rota e por volume',
      'Transporte próprio ou terceirizado',
      'Comprovante assinado anexado ao pedido',
    ],
    pages: [{ label: 'Expedição', route: '/app/entrega' }],
  },
  {
    id: 'qualidade',
    label: 'Qualidade',
    short: 'Qualidade',
    route: '/app/qualidade',
    icon: Fingerprint,
    summary: 'Inspeção de peça, retrabalho, perda e não conformidade com plano de ação.',
    features: [
      'Inspeção por amostragem com registro fotográfico',
      'Não conformidade com causa e ação corretiva',
      'Retrabalho e perda com custo apurado',
      'Indicador de refugo por máquina e por operador',
    ],
    pages: [{ label: 'Inspeções e NC', route: '/app/qualidade' }],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    short: 'Relatórios',
    route: '/app/relatorios',
    icon: Gauge,
    summary: 'Custo previsto x realizado, margem por produto, produtividade e rentabilidade por cliente.',
    features: [
      'Custo previsto x realizado por OS',
      'Margem real por produto e por cliente',
      'Produtividade por máquina e por posto',
      'Rentabilidade e ponto de equilíbrio',
    ],
    pages: [{ label: 'Relatórios', route: '/app/relatorios' }],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    short: 'Configurações',
    route: '/app/configuracoes',
    icon: Settings2,
    summary: 'Usuários, permissões, máquinas, tabelas de preço e regras de arredondamento.',
    features: [
      'Perfil de acesso por módulo',
      'Cadastro de máquina e formato máximo',
      'Tabela de preço e política de margem',
      'Regra de arredondamento e validade da proposta',
    ],
    pages: [{ label: 'Configurações', route: '/app/configuracoes' }],
  },
]

export const moduleById = (id: ModuleId): ModuleDef | undefined =>
  modules.find((module) => module.id === id)

export type PlanId = 'essencial' | 'grafica' | 'enterprise'

export type Plan = {
  id: PlanId
  name: string
  tagline: string
  priceMonthly: number | null
  priceLabel: string
  highlight?: boolean
  badge?: string
  users: string
  includes: string[]
  cta: string
}

export type PlanMatrixValue = boolean | string

export type PlanMatrixGroup = {
  group: string
  items: {
    feature: string
    essencial: PlanMatrixValue
    grafica: PlanMatrixValue
    enterprise: PlanMatrixValue
  }[]
}

/**
 * Tabela comercial publicada na vitrine. Alterar aqui muda a página inteira.
 * Confirme os valores com o proprietário antes de publicar alterações.
 */
export const plans: Plan[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    tagline: 'Para a gráfica que precisa parar de orçar na planilha e perder prazo no caderno.',
    priceMonthly: 249,
    priceLabel: 'por mês, por empresa',
    users: 'até 3 usuários',
    cta: 'Começar no Essencial',
    includes: [
      'Comercial completo: clientes, orçamentos e pedidos',
      'Proposta em PDF com validade e versão congelada',
      'Central de Custos com composição por insumo',
      'Estoque de papel, tinta e chapa',
      'Contas a pagar e a receber',
      'Pré-impressão com checklist de arquivo',
      'Relatório de margem por orçamento',
    ],
  },
  {
    id: 'grafica',
    name: 'Gráfica',
    tagline: 'A operação inteira: da aprovação da prova ao romaneio assinado na entrega.',
    priceMonthly: 549,
    priceLabel: 'por mês, por empresa',
    highlight: true,
    badge: 'Mais escolhido',
    users: 'até 15 usuários',
    cta: 'Começar na Gráfica',
    includes: [
      'Tudo do Essencial',
      'Máquinas com hora real: energia, manutenção e depreciação',
      'PCP com capacidade, calendário e gargalo',
      'Produção com ordem de serviço e apontamento',
      'Estação de acabamento por posto',
      'Estação de montagem com checklist e paletização',
      'Compras com mapa de cotação',
      'Fiscal: nota de entrada e de saída',
      'Entrega com romaneio e comprovante',
      'Qualidade: inspeção, retrabalho e não conformidade',
      'Relatórios de custo previsto x realizado',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para rede de gráficas, franquia e operação com mais de uma unidade.',
    priceMonthly: null,
    priceLabel: 'sob consulta',
    users: 'usuários ilimitados',
    cta: 'Falar sobre Enterprise',
    includes: [
      'Tudo do Gráfica',
      'Múltiplas unidades e consolidação por filial',
      'Permissões por módulo, unidade e cargo',
      'Integração com API e webhooks',
      'Integração fiscal e conciliação bancária assistida',
      'Treinamento e implantação acompanhada',
      'Suporte prioritário com SLA',
    ],
  },
]

/** Matriz completa: capacidades previstas e plano comercial correspondente. */
export const planMatrix: PlanMatrixGroup[] = [
  {
    group: 'Comercial',
    items: [
      { feature: 'Cadastro de clientes e contatos', essencial: true, grafica: true, enterprise: true },
      { feature: 'Orçamento com composição de custo', essencial: true, grafica: true, enterprise: true },
      { feature: 'Proposta com versão congelada', essencial: true, grafica: true, enterprise: true },
      { feature: 'Pedido a partir do orçamento aprovado', essencial: true, grafica: true, enterprise: true },
      { feature: 'Tabela de preço por cliente', essencial: '1 tabela', grafica: 'ilimitada', enterprise: 'ilimitada' },
      { feature: 'Comissão de vendedor', essencial: false, grafica: true, enterprise: true },
    ],
  },
  {
    group: 'Central de Custos',
    items: [
      { feature: 'Insumos: papel, tinta, chapa e substrato', essencial: true, grafica: true, enterprise: true },
      { feature: 'Mão de obra por função e setor', essencial: true, grafica: true, enterprise: true },
      { feature: 'Hora-máquina com energia e depreciação', essencial: 'custo fixo', grafica: true, enterprise: true },
      { feature: 'Perdas e refugo previstos', essencial: true, grafica: true, enterprise: true },
      { feature: 'Rateio de custo indireto', essencial: false, grafica: true, enterprise: true },
      { feature: 'Preço por unidade e ponto de equilíbrio', essencial: true, grafica: true, enterprise: true },
      { feature: 'Alerta de tabela de custo vencida', essencial: true, grafica: true, enterprise: true },
    ],
  },
  {
    group: 'Pré-impressão',
    items: [
      { feature: 'Checklist de arquivo', essencial: true, grafica: true, enterprise: true },
      { feature: 'Prova e aprovação do cliente', essencial: true, grafica: true, enterprise: true },
      { feature: 'Controle de versão do arquivo', essencial: true, grafica: true, enterprise: true },
      { feature: 'Imposição e aproveitamento de folha', essencial: false, grafica: true, enterprise: true },
    ],
  },
  {
    group: 'Produção',
    items: [
      { feature: 'Ordem de serviço', essencial: false, grafica: true, enterprise: true },
      { feature: 'Apontamento de boas, refugo e parada', essencial: false, grafica: true, enterprise: true },
      { feature: 'Estação de acabamento por posto', essencial: false, grafica: true, enterprise: true },
      { feature: 'Estação de montagem com checklist', essencial: false, grafica: true, enterprise: true },
      { feature: 'Custo realizado x previsto', essencial: false, grafica: true, enterprise: true },
    ],
  },
  {
    group: 'Planejamento e suprimentos',
    items: [
      { feature: 'PCP com capacidade e gargalo', essencial: false, grafica: true, enterprise: true },
      { feature: 'Estoque com lote e endereço', essencial: 'simples', grafica: true, enterprise: true },
      { feature: 'Compras com mapa de cotação', essencial: false, grafica: true, enterprise: true },
      { feature: 'Múltiplas unidades', essencial: false, grafica: false, enterprise: true },
    ],
  },
  {
    group: 'Financeiro e fiscal',
    items: [
      { feature: 'Contas a pagar e a receber', essencial: true, grafica: true, enterprise: true },
      { feature: 'Fluxo de caixa e inadimplência', essencial: false, grafica: true, enterprise: true },
      { feature: 'Nota fiscal de saída e de entrada', essencial: false, grafica: true, enterprise: true },
      { feature: 'Conciliação bancária assistida', essencial: false, grafica: false, enterprise: true },
    ],
  },
  {
    group: 'Entrega, qualidade e gestão',
    items: [
      { feature: 'Entrega com romaneio e comprovante', essencial: false, grafica: true, enterprise: true },
      { feature: 'Inspeção, retrabalho e não conformidade', essencial: false, grafica: true, enterprise: true },
      { feature: 'Relatórios de margem e produtividade', essencial: 'básico', grafica: true, enterprise: true },
      { feature: 'API e webhooks', essencial: false, grafica: false, enterprise: true },
      { feature: 'Suporte prioritário com SLA', essencial: false, grafica: false, enterprise: true },
    ],
  },
]

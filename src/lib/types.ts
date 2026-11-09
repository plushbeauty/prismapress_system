export type Empresa = {
  id: string
  nome: string
  cnpj: string | null
  cidade: string | null
  uf: string | null
}

export type Perfil = {
  id: string
  empresa_id: string
  nome: string
  email: string | null
  papel: 'admin' | 'comercial' | 'producao' | 'financeiro' | 'operador'
  ativo: boolean
}

export type Cliente = {
  id: string
  empresa_id: string
  codigo: string | null
  nome: string
  cnpj: string | null
  contato: string | null
  telefone: string | null
  email: string | null
  cidade: string | null
  uf: string | null
  tabela_preco: string | null
  ativo: boolean
  created_at: string
}

export type Fornecedor = {
  id: string
  empresa_id: string
  nome: string
  cnpj: string | null
  contato: string | null
  telefone: string | null
  email: string | null
  categoria: string | null
  ativo: boolean
}

export type InsumoCategoria = 'papel' | 'tinta' | 'chapa' | 'substrato' | 'acabamento' | 'embalagem'

export type Insumo = {
  id: string
  empresa_id: string
  codigo: string | null
  descricao: string
  categoria: InsumoCategoria
  unidade: string
  custo_unitario: number
  perda_pct: number
  fornecedor_id: string | null
  estoque_atual: number
  estoque_minimo: number
  endereco: string | null
  lote: string | null
  custo_atualizado_em: string | null
  ativo: boolean
}

export type Maquina = {
  id: string
  empresa_id: string
  codigo: string | null
  nome: string
  tipo: string
  formato_max_l_mm: number | null
  formato_max_a_mm: number | null
  valor_aquisicao: number
  vida_util_horas: number
  potencia_kw: number
  custo_kwh: number
  manutencao_ano: number
  horas_ano: number
  operadores: number
  ativo: boolean
}

export type MaoObra = {
  id: string
  empresa_id: string
  funcao: string
  setor: string
  custo_hora: number
  encargos_pct: number
  ativo: boolean
}

export type RegraCusto = {
  id: string
  empresa_id: string
  nome: string
  rateio_pct: number
  imposto_pct: number
  comissao_pct: number
  margem_padrao_pct: number
  validade_proposta_dias: number
  arredondamento: string
  ativo: boolean
}

export type OrcamentoStatus = 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado'

export type Orcamento = {
  id: string
  empresa_id: string
  numero: string
  cliente_id: string | null
  titulo: string
  status: OrcamentoStatus
  validade_em: string | null
  desconto_pct: number
  observacoes: string | null
  criado_por: string | null
  created_at: string
  updated_at: string
}

export type OrcamentoItem = {
  id: string
  empresa_id: string
  orcamento_id: string
  sequencia: number
  descricao: string
  produto: string | null
  quantidade: number
  largura_mm: number | null
  altura_mm: number | null
  material_id: string | null
  maquina_id: string | null
  custo_input: Record<string, unknown>
  custo_total: number
  preco_unitario: number
  preco_total: number
}

export type OrcamentoVersao = {
  id: string
  empresa_id: string
  orcamento_id: string
  versao: number
  snapshot: Record<string, unknown>
  preco_total: number
  aprovado_em: string | null
  aprovado_por_nome: string | null
  created_at: string
}

export type PedidoStatus = 'aberto' | 'em_producao' | 'concluido' | 'cancelado'

export type Pedido = {
  id: string
  empresa_id: string
  numero: string
  cliente_id: string | null
  orcamento_id: string | null
  status: PedidoStatus
  valor_total: number
  prazo_entrega: string | null
  created_at: string
}

export type Arquivo = {
  id: string
  empresa_id: string
  pedido_id: string | null
  nome: string
  versao: number
  status: 'recebido' | 'em_conferencia' | 'aguardando_prova' | 'prova_aprovada' | 'reprovado'
  checklist: Record<string, boolean>
  aprovado_em: string | null
  aprovado_por: string | null
  observacoes: string | null
  created_at: string
}

export type OrdemServico = {
  id: string
  empresa_id: string
  numero: string
  pedido_id: string | null
  cliente_id: string | null
  descricao: string
  etapa: string
  maquina_id: string | null
  quantidade: number
  quantidade_boa: number
  refugo: number
  status: 'aberto' | 'em_producao' | 'concluido' | 'cancelado'
  inicio_previsto: string | null
  fim_previsto: string | null
  inicio_real: string | null
  fim_real: string | null
  operador: string | null
  created_at: string
}

export type OsOperacao = {
  id: string
  empresa_id: string
  os_id: string
  sequencia: number
  posto: string
  descricao: string
  maquina_id: string | null
  status: 'pendente' | 'em_producao' | 'concluido'
  qtd_boa: number
  qtd_refugo: number
  operador: string | null
  inicio: string | null
  fim: string | null
  observacoes: string | null
}

export type MontagemComponente = {
  id: string
  empresa_id: string
  os_id: string
  descricao: string
  quantidade_prevista: number
  quantidade_conferida: number
  conferido: boolean
}

export type Apontamento = {
  id: string
  empresa_id: string
  os_id: string
  operacao_id: string | null
  tipo: 'producao' | 'refugo' | 'parada' | 'setup' | 'retrabalho'
  quantidade: number
  motivo: string | null
  operador: string | null
  created_at: string
}

export type EstoqueMov = {
  id: string
  empresa_id: string
  insumo_id: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  quantidade: number
  lote: string | null
  endereco: string | null
  documento: string | null
  created_at: string
}

export type Compra = {
  id: string
  empresa_id: string
  numero: string
  fornecedor_id: string | null
  insumo_id: string | null
  quantidade: number
  preco_unitario: number
  status: 'solicitado' | 'cotando' | 'aprovado' | 'recebido' | 'cancelado'
  prazo_entrega: string | null
  created_at: string
}

export type TituloFinanceiro = {
  id: string
  empresa_id: string
  tipo: 'pagar' | 'receber'
  descricao: string
  cliente_id: string | null
  fornecedor_id: string | null
  pedido_id: string | null
  valor: number
  vencimento: string
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  pago_em: string | null
}

export type NotaFiscal = {
  id: string
  empresa_id: string
  tipo: 'entrada' | 'saida'
  numero: string
  serie: string | null
  cliente_id: string | null
  fornecedor_id: string | null
  pedido_id: string | null
  valor: number
  imposto: number
  status: 'pendente' | 'emitida' | 'cancelada'
  emitida_em: string | null
}

export type Entrega = {
  id: string
  empresa_id: string
  pedido_id: string | null
  transportadora: string | null
  volumes: number
  peso_kg: number
  romaneio: string | null
  status: 'separacao' | 'expedido' | 'entregue' | 'devolvido'
  entregue_em: string | null
  comprovante_url: string | null
}

export type Inspecao = {
  id: string
  empresa_id: string
  os_id: string | null
  tipo: string
  amostra: number
  defeitos: number
  resultado: 'aprovado' | 'reprovado' | 'retrabalho'
  causa: string | null
  acao: string | null
  responsavel: string | null
  status: 'aberta' | 'em_acao' | 'fechada'
  created_at: string
}

export type Programacao = {
  id: string
  empresa_id: string
  os_id: string
  maquina_id: string | null
  inicio: string
  fim: string
  sequencia: number
}

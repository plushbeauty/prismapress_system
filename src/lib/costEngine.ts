/**
 * Motor de composição de custo do PRISMAPRES.
 *
 * Regra do produto: o preço sai de custo comprovado, não de "preço de mercado".
 * Cada linha de insumo, máquina, mão de obra e terceiro entra no cálculo com a sua
 * própria perda. Sobre o custo direto incidem rateio, imposto, comissão e margem
 * desejada — nesta ordem, com divisor de markup para a margem ser sobre o preço.
 */

export type InsumoLinha = {
  descricao: string
  custoUnitario: number
  quantidade: number
  unidade: string
  perdaPct?: number
}

export type MaquinaLinha = {
  descricao: string
  custoHora: number
  horasProducao: number
  horasAcerto?: number
  perdaPct?: number
}

export type MaoObraLinha = {
  descricao: string
  custoHora: number
  horas: number
  pessoas?: number
  perdaPct?: number
}

export type TerceiroLinha = {
  descricao: string
  valor: number
}

export type CustoInput = {
  quantidade: number
  insumos: InsumoLinha[]
  maquinas: MaquinaLinha[]
  maoObra: MaoObraLinha[]
  terceiros: TerceiroLinha[]
  frete: number
  embalagem: number
  perdaGeralPct: number
  rateioPct: number
  impostoPct: number
  comissaoPct: number
  descontoPct: number
  margemPct: number
}

export type CustoLinhaResultado = {
  descricao: string
  base: number
  comPerda: number
  detalhe: string
}

export type CustoResultado = {
  quantidade: number
  material: number
  maquina: number
  maoObra: number
  terceiros: number
  frete: number
  embalagem: number
  perdaGeral: number
  custoDireto: number
  rateio: number
  custoTotal: number
  imposto: number
  comissao: number
  desconto: number
  lucro: number
  preco: number
  precoUnitario: number
  custoUnitario: number
  margemRealPct: number
  markupPct: number
  divisor: number
  linhas: {
    insumos: CustoLinhaResultado[]
    maquinas: CustoLinhaResultado[]
    maoObra: CustoLinhaResultado[]
    terceiros: CustoLinhaResultado[]
  }
}

export const custoInputVazio = (): CustoInput => ({
  quantidade: 1000,
  insumos: [],
  maquinas: [],
  maoObra: [],
  terceiros: [],
  frete: 0,
  embalagem: 0,
  perdaGeralPct: 0,
  rateioPct: 0,
  impostoPct: 0,
  comissaoPct: 0,
  descontoPct: 0,
  margemPct: 20,
})

const safe = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

const percentualSeguro = (v: unknown) => Math.max(0, safe(v))

export function calcularCusto(input: CustoInput): CustoResultado {
  const quantidade = Math.max(1, safe(input.quantidade))

  const insumos = (input.insumos ?? []).map((l) => {
    const base = Math.max(0, safe(l.custoUnitario)) * Math.max(0, safe(l.quantidade))
    const perda = percentualSeguro(l.perdaPct)
    return {
      descricao: l.descricao,
      base,
      comPerda: base * (1 + perda / 100),
      detalhe: `${safe(l.quantidade)} ${l.unidade} × ${safe(l.custoUnitario).toFixed(4)}${perda ? ` + ${perda}% perda` : ''}`,
    }
  })

  const maquinas = (input.maquinas ?? []).map((l) => {
    const horas = Math.max(0, safe(l.horasProducao)) + Math.max(0, safe(l.horasAcerto))
    const base = horas * Math.max(0, safe(l.custoHora))
    const perda = percentualSeguro(l.perdaPct)
    return {
      descricao: l.descricao,
      base,
      comPerda: base * (1 + perda / 100),
      detalhe: `${horas.toFixed(2)} h × ${safe(l.custoHora).toFixed(2)}/h${perda ? ` + ${perda}%` : ''}`,
    }
  })

  const maoObra = (input.maoObra ?? []).map((l) => {
    const horas = Math.max(0, safe(l.horas)) * Math.max(1, safe(l.pessoas) || 1)
    const base = horas * Math.max(0, safe(l.custoHora))
    const perda = percentualSeguro(l.perdaPct)
    return {
      descricao: l.descricao,
      base,
      comPerda: base * (1 + perda / 100),
      detalhe: `${horas.toFixed(2)} h × ${safe(l.custoHora).toFixed(2)}/h${perda ? ` + ${perda}%` : ''}`,
    }
  })

  const terceiros = (input.terceiros ?? []).map((l) => {
    const base = Math.max(0, safe(l.valor))
    return { descricao: l.descricao, base, comPerda: base, detalhe: 'serviço de terceiro' }
  })

  const soma = (xs: CustoLinhaResultado[]) => xs.reduce((acc, x) => acc + x.comPerda, 0)

  const material = soma(insumos)
  const maquina = soma(maquinas)
  const maoDeObra = soma(maoObra)
  const terceirosTotal = soma(terceiros)
  const frete = Math.max(0, safe(input.frete))
  const embalagem = Math.max(0, safe(input.embalagem))

  const subtotal = material + maquina + maoDeObra + terceirosTotal + frete + embalagem
  const perdaGeral = subtotal * (percentualSeguro(input.perdaGeralPct) / 100)
  const custoDireto = subtotal + perdaGeral
  const rateio = custoDireto * (percentualSeguro(input.rateioPct) / 100)
  const custoTotal = custoDireto + rateio

  // Impostos, comissão, desconto e margem são percentuais do preço final.
  const encargos = percentualSeguro(input.impostoPct)
    + percentualSeguro(input.comissaoPct)
    + percentualSeguro(input.descontoPct)
    + percentualSeguro(input.margemPct)
  const divisor = Math.max(0.05, 1 - encargos / 100)
  const preco = custoTotal / divisor
  const imposto = preco * (percentualSeguro(input.impostoPct) / 100)
  const comissao = preco * (percentualSeguro(input.comissaoPct) / 100)
  const desconto = preco * (percentualSeguro(input.descontoPct) / 100)
  const lucro = preco - custoTotal - imposto - comissao - desconto

  return {
    quantidade,
    material,
    maquina,
    maoObra: maoDeObra,
    terceiros: terceirosTotal,
    frete,
    embalagem,
    perdaGeral,
    custoDireto,
    rateio,
    custoTotal,
    imposto,
    comissao,
    desconto,
    lucro,
    preco,
    precoUnitario: preco / quantidade,
    custoUnitario: custoTotal / quantidade,
    margemRealPct: preco > 0 ? (lucro / preco) * 100 : 0,
    markupPct: custoTotal > 0 ? (preco / custoTotal - 1) * 100 : 0,
    divisor: divisor * 100,
    linhas: { insumos, maquinas, maoObra, terceiros },
  }
}

/** Custo da hora-máquina calculado a partir dos componentes reais do equipamento. */
export function custoHoraMaquina(params: {
  valorAquisicao: number
  vidaUtilHoras: number
  potenciaKw: number
  custoKwh: number
  manutencaoAno: number
  horasAno: number
  operadores: number
  custoHoraOperador: number
  fatorOcupacaoPct?: number
}) {
  const horasAno = Math.max(1, safe(params.horasAno))
  const depreciacao = Math.max(0, safe(params.valorAquisicao)) / Math.max(1, safe(params.vidaUtilHoras))
  const energia = Math.max(0, safe(params.potenciaKw)) * Math.max(0, safe(params.custoKwh))
  const manutencao = Math.max(0, safe(params.manutencaoAno)) / horasAno
  const operacao = Math.max(0, safe(params.operadores)) * Math.max(0, safe(params.custoHoraOperador))
  const direto = depreciacao + energia + manutencao + operacao
  const ocupacao = Math.max(1, safe(params.fatorOcupacaoPct) || 100) / 100
  return {
    depreciacao,
    energia,
    manutencao,
    operacao,
    hora: direto / ocupacao,
  }
}

/** Calcula o melhor aproveitamento em uma folha, testando orientação normal e girada. */
export function aproveitamentoFolha(params: {
  folhaLarguraMm: number
  folhaAlturaMm: number
  pecaLarguraMm: number
  pecaAlturaMm: number
  sangriaMm?: number
  espacoEntrePecasMm?: number
  margemPinacaMm?: number
}) {
  const sangria = Math.max(0, safe(params.sangriaMm))
  const gap = Math.max(0, safe(params.espacoEntrePecasMm))
  const pinaca = Math.max(0, safe(params.margemPinacaMm))

  const pecaL = Math.max(0, safe(params.pecaLarguraMm)) + sangria * 2
  const pecaA = Math.max(0, safe(params.pecaAlturaMm)) + sangria * 2
  const utilL = safe(params.folhaLarguraMm) - pinaca * 2
  const utilA = safe(params.folhaAlturaMm) - pinaca * 2

  if (pecaL <= 0 || pecaA <= 0 || utilL <= 0 || utilA <= 0) {
    return { porFolha: 0, colunas: 0, linhas: 0, aproveitamentoPct: 0, larguraUtil: utilL, alturaUtil: utilA }
  }

  const contar = (largura: number, altura: number, itemL: number, itemA: number) => {
    const colunas = Math.floor((largura + gap) / (itemL + gap))
    const linhas = Math.floor((altura + gap) / (itemA + gap))
    return { colunas, linhas, total: colunas * linhas }
  }

  const normal = contar(utilL, utilA, pecaL, pecaA)
  const girado = contar(utilL, utilA, pecaA, pecaL)
  const melhor = normal.total >= girado.total ? normal : girado
  const areaPeca = pecaL * pecaA * melhor.total
  const areaUtil = utilL * utilA

  return {
    porFolha: melhor.total,
    colunas: melhor.colunas,
    linhas: melhor.linhas,
    aproveitamentoPct: areaUtil > 0 ? (areaPeca / areaUtil) * 100 : 0,
    larguraUtil: utilL,
    alturaUtil: utilA,
  }
}

/** Quantidade de folhas necessárias considerando a perda de acerto. */
export function folhasNecessarias(params: { quantidade: number; porFolha: number; perdaAcertoPct?: number }) {
  const porFolha = Math.max(1, Math.floor(safe(params.porFolha)))
  const perda = percentualSeguro(params.perdaAcertoPct)
  const folhas = Math.ceil(Math.max(0, safe(params.quantidade)) / porFolha)
  return {
    folhas,
    folhasComPerda: Math.ceil(folhas * (1 + perda / 100)),
    pecasProduzidas: folhas * porFolha,
  }
}

export function margemParaPreco(custoTotal: number, preco: number) {
  if (preco <= 0) return 0
  return ((preco - custoTotal) / preco) * 100
}

export function precoParaMargem(custoTotal: number, margemPct: number, encargosPct = 0) {
  const divisor = Math.max(0.05, 1 - (percentualSeguro(margemPct) + percentualSeguro(encargosPct)) / 100)
  return Math.max(0, safe(custoTotal)) / divisor
}

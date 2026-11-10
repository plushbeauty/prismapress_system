import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Factory, Play, RefreshCw, ClipboardList, LoaderCircle, PackageCheck } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { Cliente, OrdemServico, OsOperacao, Pedido } from '../../lib/types'
import './ChaoDeGraficaPage.css'

const moneyQty = (value: number) => Number(value || 0).toLocaleString('pt-BR')
const etapas = [
  { id: 'pre', label: 'Pré-impressão' },
  { id: 'impressao', label: 'Impressão' },
  { id: 'acabamento', label: 'Acabamento' },
  { id: 'expedicao', label: 'Expedição' },
]

export default function ChaoDeGraficaPage() {
  const { empresa, perfil } = useSession()
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [operacoes, setOperacoes] = useState<Record<string, OsOperacao[]>>({})
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [boas, setBoas] = useState('')
  const [refugo, setRefugo] = useState('')
  const [aba, setAba] = useState<'terminal' | 'fila'>('terminal')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!supabase || !empresa?.id) {
      setErro('Banco de dados ou empresa não disponíveis nesta sessão.')
      setLoading(false)
      return
    }
    setLoading(true)
    setErro(null)
    const [osResult, pedidoResult, clienteResult] = await Promise.all([
      supabase.from('gr_ordens_servico').select('*').eq('empresa_id', empresa.id).order('created_at', { ascending: false }),
      supabase.from('gr_pedidos').select('*').eq('empresa_id', empresa.id),
      supabase.from('gr_clientes').select('*').eq('empresa_id', empresa.id),
    ])
    if (osResult.error) {
      setErro('Falha ao carregar a fila: ' + osResult.error.message)
      setOrdens([])
      setLoading(false)
      return
    }
    const lista = (osResult.data ?? []) as OrdemServico[]
    setOrdens(lista)
    if (pedidoResult.error) setErro(pedidoResult.error.message)
    else setPedidos((pedidoResult.data ?? []) as Pedido[])
    if (clienteResult.error) setErro(clienteResult.error.message)
    else setClientes((clienteResult.data ?? []) as Cliente[])
    if (lista.length) {
      const result = await supabase.from('gr_os_operacoes').select('*').eq('empresa_id', empresa.id).in('os_id', lista.map(os => os.id)).order('sequencia')
      if (result.error) setErro('Não foi possível carregar o roteiro: ' + result.error.message)
      else {
        const grouped: Record<string, OsOperacao[]> = {}
        for (const op of (result.data ?? []) as OsOperacao[]) (grouped[op.os_id] ??= []).push(op)
        setOperacoes(grouped)
      }
    } else setOperacoes({})
    setLoading(false)
  }, [empresa?.id])

  useEffect(() => { void carregar() }, [carregar])
  useEffect(() => { setBoas(''); setRefugo('') }, [selecionada])

  const abertas = useMemo(() => ordens.filter(os => os.status !== 'concluido' && os.status !== 'cancelado'), [ordens])
  const ativa = abertas.find(os => os.id === selecionada)
    ?? abertas.find(os => os.status === 'em_producao')
    ?? abertas[0]
  const roteiro = ativa ? operacoes[ativa.id] ?? [] : []
  const operacaoAtual = roteiro.find(op => op.status !== 'concluido')
  const totais = roteiro.reduce((acc, op) => ({
    boas: acc.boas + Number(op.qtd_boa || 0),
    refugo: acc.refugo + Number(op.qtd_refugo || 0),
  }), { boas: 0, refugo: 0 })
  const progresso = ativa?.quantidade ? Math.min(100, Math.round((totais.boas / ativa.quantidade) * 100)) : 0
  const pedidoAtivo = ativa ? pedidos.find(p => p.id === ativa.pedido_id) : undefined
  const clienteAtivo = ativa ? clientes.find(c => c.id === ativa.cliente_id) : undefined

  const iniciar = async () => {
    if (!supabase || !empresa?.id || !ativa) return
    setSaving(true); setErro(null); setSucesso(null)
    const agora = new Date().toISOString()
    const { error } = await supabase.from('gr_ordens_servico').update({
      status: 'em_producao', inicio_real: ativa.inicio_real ?? agora,
    }).eq('id', ativa.id).eq('empresa_id', empresa.id)
    if (error) setErro('Não foi possível iniciar a OP: ' + error.message)
    else {
      if (operacaoAtual) await supabase.from('gr_os_operacoes').update({
        status: 'em_producao', inicio: operacaoAtual.inicio ?? agora,
        operador: perfil?.nome ?? operacaoAtual.operador,
      }).eq('id', operacaoAtual.id).eq('empresa_id', empresa.id)
      setSucesso('Ordem enviada para produção.')
      await carregar()
    }
    setSaving(false)
  }

  const apontar = async () => {
    if (!supabase || !empresa?.id || !ativa || !operacaoAtual) return
    const b = Number(boas || 0), r = Number(refugo || 0)
    if (!Number.isInteger(b) || !Number.isInteger(r) || b < 0 || r < 0 || (b === 0 && r === 0)) {
      setErro('Informe quantidades inteiras e não negativas. Pelo menos uma deve ser maior que zero.')
      return
    }
    setSaving(true); setErro(null); setSucesso(null)
    const { error } = await supabase.from('gr_os_operacoes').update({
      qtd_boa: Number(operacaoAtual.qtd_boa || 0) + b,
      qtd_refugo: Number(operacaoAtual.qtd_refugo || 0) + r,
      operador: perfil?.nome ?? operacaoAtual.operador,
      status: 'em_producao',
      inicio: operacaoAtual.inicio ?? new Date().toISOString(),
    }).eq('id', operacaoAtual.id).eq('empresa_id', empresa.id)
    if (error) setErro('Falha ao salvar apontamento: ' + error.message)
    else {
      setBoas(''); setRefugo('')
      setSucesso('Apontamento registrado na operação atual.')
      await carregar()
    }
    setSaving(false)
  }

  const concluirEtapa = async () => {
    if (!supabase || !empresa?.id || !ativa || !operacaoAtual) return
    setSaving(true); setErro(null); setSucesso(null)
    const { error } = await supabase.from('gr_os_operacoes').update({
      status: 'concluido', fim: new Date().toISOString(),
      operador: perfil?.nome ?? operacaoAtual.operador,
    }).eq('id', operacaoAtual.id).eq('empresa_id', empresa.id)
    if (error) setErro('Não foi possível concluir a etapa: ' + error.message)
    else {
      setSucesso('Etapa concluída. O próximo posto já pode assumir a ordem.')
      await carregar()
    }
    setSaving(false)
  }

  const concluirOP = async () => {
    if (!supabase || !empresa?.id || !ativa) return
    const roteiroAtual = operacoes[ativa.id] ?? []
    if (!roteiroAtual.length || roteiroAtual.some(op => op.status !== 'concluido')) {
      setErro('Conclua todas as etapas do roteiro antes de finalizar a OP.')
      return
    }
    setSaving(true); setErro(null); setSucesso(null)
    const { error } = await supabase.from('gr_ordens_servico').update({
      status: 'concluido', etapa: 'concluido', fim_real: new Date().toISOString(),
      quantidade_boa: roteiroAtual.reduce((sum, op) => sum + Number(op.qtd_boa || 0), 0),
      refugo: roteiroAtual.reduce((sum, op) => sum + Number(op.qtd_refugo || 0), 0),
    }).eq('id', ativa.id).eq('empresa_id', empresa.id)
    if (error) { setErro('Falha ao concluir a OP: ' + error.message); setSaving(false); return }
    if (ativa.pedido_id) {
      const pedidoResult = await supabase.from('gr_pedidos').update({ status: 'concluido' }).eq('id', ativa.pedido_id).eq('empresa_id', empresa.id)
      if (pedidoResult.error) setErro('OP concluída, mas o pedido não foi atualizado: ' + pedidoResult.error.message)
    }
    setSucesso('OP concluída e pedido vinculado atualizado.')
    await carregar()
    setSaving(false)
  }

  return <div className="cg-page">
    <div className="cg-heading">
      <div><span><Factory size={14}/> PRODUÇÃO · TERMINAL DO OPERADOR</span><h2>Chão de gráfica</h2><p>Fila de impressão, apontamento e acompanhamento das etapas.</p></div>
      <button onClick={() => void carregar()} disabled={loading || saving}><RefreshCw size={14}/> Atualizar</button>
    </div>
    {erro && <div className="cg-error" role="alert">{erro}</div>}
    {sucesso && <div className="cg-success" role="status">{sucesso}</div>}
    <div className="cg-tabs">
      <button className={aba === 'terminal' ? 'active' : ''} onClick={() => setAba('terminal')}>Terminal do operador</button>
      <button className={aba === 'fila' ? 'active' : ''} onClick={() => setAba('fila')}>Fila de produção ({abertas.length})</button>
    </div>
    {loading ? <div className="cg-empty"><LoaderCircle size={20}/> Carregando ordens...</div> : aba === 'terminal' ? (
      !ativa ? <div className="cg-empty cg-empty-card"><PackageCheck size={26}/><b>Nenhuma ordem em aberto</b><span>As ordens aprovadas em Pedidos aparecerão aqui.</span></div> :
      <section className="cg-terminal">
        <div className="cg-terminal-top">
          <div><small>OPERADOR RESPONSÁVEL</small><b>{perfil?.nome || ativa.operador || 'Não identificado'}</b></div>
          <div><small>POSTO ATUAL</small><b>{operacaoAtual?.posto || 'Roteiro concluído'}</b></div>
          <span className={'cg-status ' + ativa.status}>{ativa.status === 'em_producao' ? 'Em produção' : 'Aguardando'}</span>
        </div>
        <div className="cg-job">
          <small>ORDEM DE PRODUÇÃO</small><strong>{ativa.numero}</strong>
          <p>{clienteAtivo?.nome || 'Cliente não identificado'}{pedidoAtivo?.numero ? ' · ' + pedidoAtivo.numero : ''}</p>
          <h3>{ativa.descricao}</h3>
          <div className="cg-progress-label"><span>Meta da tiragem: <b>{moneyQty(ativa.quantidade)} un.</b></span><span>Boas: <b>{moneyQty(totais.boas)}</b> · Refugo: <b>{moneyQty(totais.refugo)}</b></span></div>
          <div className="cg-progress"><i style={{ width: progresso + '%' }}/></div>
          <small className="cg-progress-pct">{progresso}% da meta apontada</small>
        </div>
        <div className="cg-actions">
          <button className="cg-start" disabled={saving || ativa.status === 'em_producao' || !operacaoAtual} onClick={() => void iniciar()}><Play size={15}/> Iniciar trabalho</button>
          <label>Quantidade boa<input type="number" min="0" step="1" inputMode="numeric" value={boas} onChange={e => setBoas(e.target.value)} /></label>
          <label>Refugo / perda<input type="number" min="0" step="1" inputMode="numeric" value={refugo} onChange={e => setRefugo(e.target.value)} /></label>
          <button className="cg-record" disabled={saving || !operacaoAtual} onClick={() => void apontar()}>Registrar apontamento</button>
          <button className="cg-finish-step" disabled={saving || !operacaoAtual} onClick={() => void concluirEtapa()}><Check size={15}/> Concluir etapa</button>
          <button className="cg-finish-op" disabled={saving || saving || ativa.status === 'concluido'} onClick={() => void concluirOP()}><ClipboardList size={15}/> Finalizar OP</button>
        </div>
        <div className="cg-route"><b>Roteiro de produção</b>{roteiro.map((op, index) => <article key={op.id} className={op.status}><span>{index + 1}</span><div><b>{op.posto}</b><small>{op.descricao}</small></div><em>{op.status === 'concluido' ? 'Concluída' : op.status === 'em_producao' ? 'Em produção' : 'Pendente'}</em></article>)}</div>
      </section>
    ) : (
      <div className="cg-queue">{abertas.map(os => {
        const pedido = pedidos.find(p => p.id === os.pedido_id)
        const cliente = clientes.find(c => c.id === os.cliente_id)
        const steps = operacoes[os.id] ?? []
        const done = steps.filter(op => op.status === 'concluido').length
        return <button key={os.id} className="cg-queue-card" onClick={() => { setSelecionada(os.id); setAba('terminal') }}>
          <div><b>{os.numero}</b><span className={'cg-status ' + os.status}>{os.status === 'em_producao' ? 'Em produção' : 'Aguardando'}</span></div>
          <strong>{os.descricao}</strong><p>{cliente?.nome || 'Cliente'} · {pedido?.numero || 'Sem pedido vinculado'}</p>
          <small>{etapas.find(e => e.id === os.etapa)?.label || 'Produção'} · {moneyQty(os.quantidade)} unidades · {done}/{steps.length} etapas</small>
        </button>
      })}{!abertas.length && <div className="cg-empty">Nenhuma ordem aguardando produção.</div>}</div>
    )}
    <div className="cg-revision">PRISMAPRES · TERMINAL GRÁFICO INTEGRADO AO PCP</div>
  </div>
}

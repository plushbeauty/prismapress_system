/*
 * @REVISAO: PRISMAPRES-ERP-20261109-003
 * @DATA: 2026-11-09
 * @ALTERACOES:
 * - Cadastro e edição de orçamentos com itens, quantidades, preços e totais.
 * - Fluxo de status: rascunho, enviado, aprovado e recusado.
 * - Conversão de orçamento aprovado em pedido, com vínculo ao orçamento.
 * - Persistência Supabase e isolamento por empresa_id.
 * @STATUS: APLICADO
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Plus, Search, Send, Trash2, X, LoaderCircle, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { Cliente, Orcamento, OrcamentoItem, OrcamentoStatus } from '../../lib/types'
import './OrcamentosPage.css'

type ItemForm = { descricao: string; produto: string; quantidade: number; preco_unitario: number }
const itemVazio: ItemForm = { descricao: '', produto: '', quantidade: 1000, preco_unitario: 0.5 }
const statusLabel: Record<OrcamentoStatus, string> = {
  rascunho: 'Rascunho', enviado: 'Aguardando resposta', aprovado: 'Aprovado', recusado: 'Recusado', expirado: 'Expirado',
}
const statusClass: Record<OrcamentoStatus, string> = {
  rascunho: 'rascunho', enviado: 'enviado', aprovado: 'aprovado', recusado: 'recusado', expirado: 'expirado',
}
const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

export default function OrcamentosPage() {
  const { empresa, perfil } = useSession()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [itensPorOrcamento, setItensPorOrcamento] = useState<Record<string, OrcamentoItem[]>>({})
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [aberto, setAberto] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [validade, setValidade] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState<ItemForm[]>([{ ...itemVazio }])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!supabase || !empresa?.id) { setErro('Banco de dados ou empresa não disponíveis nesta sessão.'); setLoading(false); return }
    setLoading(true); setErro(null)
    const [cli, orc] = await Promise.all([
      supabase.from('gr_clientes').select('*').eq('empresa_id', empresa.id).eq('ativo', true).order('nome'),
      supabase.from('gr_orcamentos').select('*').eq('empresa_id', empresa.id).order('created_at', { ascending: false }),
    ])
    if (cli.error) setErro('Falha ao carregar clientes: ' + cli.error.message)
    else { setClientes((cli.data ?? []) as Cliente[]); if (!clienteId && cli.data?.[0]) setClienteId(cli.data[0].id) }
    if (orc.error) { setErro('Falha ao carregar orçamentos: ' + orc.error.message); setOrcamentos([]); setLoading(false); return }
    const lista = (orc.data ?? []) as Orcamento[]
    setOrcamentos(lista)
    if (lista.length) {
      const { data, error: itemsError } = await supabase.from('gr_orcamento_itens').select('*').eq('empresa_id', empresa.id).in('orcamento_id', lista.map(o => o.id)).order('sequencia')
      if (itemsError) setErro('Orçamentos carregados, mas não foi possível consultar os itens: ' + itemsError.message)
      else {
        const grouped: Record<string, OrcamentoItem[]> = {}
        for (const item of (data ?? []) as OrcamentoItem[]) (grouped[item.orcamento_id] ??= []).push(item)
        setItensPorOrcamento(grouped)
      }
    } else setItensPorOrcamento({})
    setLoading(false)
  }, [empresa?.id, clienteId])

  useEffect(() => { void carregar() }, [carregar])

  const total = itens.reduce((sum, item) => sum + Math.max(0, item.quantidade) * Math.max(0, item.preco_unitario), 0)
  const totalDo = (orc: Orcamento) => (itensPorOrcamento[orc.id] ?? []).reduce((sum, item) => sum + Number(item.preco_total ?? item.quantidade * item.preco_unitario), 0)
  const filtrados = useMemo(() => orcamentos.filter(o => {
    const cliente = clientes.find(c => c.id === o.cliente_id)?.nome ?? ''
    const term = busca.toLocaleLowerCase('pt-BR')
    return (statusFiltro === 'todos' || o.status === statusFiltro) && [o.numero, o.titulo, cliente].some(v => (v ?? '').toLocaleLowerCase('pt-BR').includes(term))
  }), [orcamentos, clientes, busca, statusFiltro])
  const counts = useMemo(() => ({
    enviados: orcamentos.filter(o => o.status === 'enviado').length,
    aprovados: orcamentos.filter(o => o.status === 'aprovado').length,
    soma: orcamentos.filter(o => o.status === 'aprovado').reduce((sum, o) => sum + totalDo(o), 0),
  }), [orcamentos, itensPorOrcamento])

  const novo = () => { setTitulo(''); setObservacoes(''); setValidade(''); setItens([{ ...itemVazio }]); setSucesso(null); setAberto(true) }
  const atualizarItem = (index: number, patch: Partial<ItemForm>) => setItens(current => current.map((item, i) => i === index ? { ...item, ...patch } : item))

  const salvar = async () => {
    if (!supabase || !empresa?.id || !clienteId || !titulo.trim() || !itens.length || itens.some(i => !i.descricao.trim() || i.quantidade <= 0 || i.preco_unitario < 0)) {
      setErro('Informe cliente, título e ao menos um item válido (descrição, quantidade e preço).'); return
    }
    setSaving(true); setErro(null); setSucesso(null)
    const { count, error: countError } = await supabase.from('gr_orcamentos').select('id', { count: 'exact', head: true }).eq('empresa_id', empresa.id)
    if (countError) { setErro(countError.message); setSaving(false); return }
    const numero = 'ORC-' + new Date().getFullYear() + '-' + String((count ?? 0) + 1).padStart(5, '0')
    const subtotal = total
    const { data: created, error: createError } = await supabase.from('gr_orcamentos').insert({
      empresa_id: empresa.id, numero, cliente_id: clienteId, titulo: titulo.trim(),
      status: 'enviado', validade_em: validade || null, desconto_pct: 0,
      observacoes: observacoes.trim() || null, criado_por: perfil?.id ?? null,
    }).select('*').single()
    if (createError || !created) { setErro(createError?.message ?? 'Não foi possível criar o orçamento.'); setSaving(false); return }
    const payload = itens.map((item, index) => ({
      empresa_id: empresa.id, orcamento_id: created.id, sequencia: index + 1,
      descricao: item.descricao.trim(), produto: item.produto.trim() || null,
      quantidade: item.quantidade, largura_mm: null, altura_mm: null, material_id: null, maquina_id: null,
      custo_input: {}, custo_total: 0, preco_unitario: item.preco_unitario,
      preco_total: item.quantidade * item.preco_unitario,
    }))
    const { error: itemError } = await supabase.from('gr_orcamento_itens').insert(payload)
    if (itemError) {
      await supabase.from('gr_orcamentos').delete().eq('id', created.id).eq('empresa_id', empresa.id)
      setErro('Falha ao gravar os itens. O cabeçalho foi revertido: ' + itemError.message)
      setSaving(false); return
    }
    void subtotal
    setAberto(false); setSucesso('Orçamento criado e enviado com sucesso.'); await carregar(); setSaving(false)
  }

  const mudarStatus = async (orc: Orcamento, status: 'enviado' | 'aprovado' | 'recusado') => {
    if (!supabase || !empresa?.id) return
    setSaving(true); setErro(null); setSucesso(null)
    if (status === 'aprovado') {
      const { data: existing, error: existingError } = await supabase.from('gr_pedidos').select('id, numero').eq('empresa_id', empresa.id).eq('orcamento_id', orc.id).maybeSingle()
      if (existingError) { setErro(existingError.message); setSaving(false); return }
      if (!existing) {
        const cliente = clientes.find(c => c.id === orc.cliente_id)
        const pedidoNumero = 'PED-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-6)
        const { error: pedidoError } = await supabase.from('gr_pedidos').insert({
          empresa_id: empresa.id, numero: pedidoNumero, cliente_id: orc.cliente_id,
          orcamento_id: orc.id, status: 'aberto', valor_total: totalDo(orc),
          prazo_entrega: null,
        })
        if (pedidoError) { setErro('Não foi possível gerar o pedido para ' + (cliente?.nome ?? 'o cliente') + ': ' + pedidoError.message); setSaving(false); return }
      }
    }
    const { error: statusError } = await supabase.from('gr_orcamentos').update({ status }).eq('id', orc.id).eq('empresa_id', empresa.id)
    if (statusError) setErro(statusError.message)
    else { setSucesso(status === 'aprovado' ? 'Orçamento aprovado e convertido em pedido.' : 'Status do orçamento atualizado.'); await carregar() }
    setSaving(false)
  }

  return (
    <div className="orc-page">
      <div className="orc-heading"><div><span className="orc-eyebrow"><FileText size={14}/> COMERCIAL · FORMAÇÃO DE PREÇOS</span><h2>Central de orçamentos</h2><p>Crie propostas, acompanhe respostas e converta aprovações em pedidos.</p></div><button className="orc-primary" onClick={novo}><Plus size={16}/> Novo orçamento</button></div>
      {sucesso && <div className="orc-success" role="status">{sucesso}</div>}{erro && <div className="orc-error" role="alert">{erro}</div>}
      <div className="orc-stats"><article><small>Aguardando resposta</small><strong>{counts.enviados}</strong><span>Propostas enviadas</span></article><article><small>Aprovados</small><strong>{counts.aprovados}</strong><span>Orçamentos convertidos</span></article><article><small>Total aprovado</small><strong>{money(counts.soma)}</strong><span>Valor dos orçamentos aprovados</span></article></div>
      <section className="orc-panel"><div className="orc-toolbar"><label><Search size={15}/><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar número, título ou cliente"/></label><select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}><option value="todos">Todos os status</option>{Object.entries(statusLabel).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select><span>{filtrados.length} orçamento(s)</span></div>
        {loading ? <div className="orc-empty"><LoaderCircle className="orc-spin" size={20}/> Carregando dados do banco...</div> : filtrados.length === 0 ? <div className="orc-empty"><FileText size={24}/><b>Nenhum orçamento encontrado</b><span>Crie a primeira proposta comercial.</span></div> :
          <div className="orc-table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Proposta</th><th>Itens</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtrados.map(orc => <tr key={orc.id}><td><b>{orc.numero}</b></td><td>{clientes.find(c => c.id === orc.cliente_id)?.nome ?? '—'}</td><td>{orc.titulo}</td><td>{(itensPorOrcamento[orc.id] ?? []).length}</td><td><b>{money(totalDo(orc))}</b></td><td><span className={'orc-status ' + statusClass[orc.status]}>{statusLabel[orc.status]}</span></td><td><div className="orc-actions">{orc.status === 'rascunho' && <button disabled={saving} onClick={() => void mudarStatus(orc, 'enviado')}><Send size={13}/> Enviar</button>}{orc.status === 'enviado' && <><button disabled={saving} onClick={() => void mudarStatus(orc, 'aprovado')}><Check size={13}/> Aprovar e gerar pedido</button><button disabled={saving} className="orc-reject" onClick={() => void mudarStatus(orc, 'recusado')}><X size={13}/> Recusar</button></>}</div></td></tr>)}</tbody></table></div>}
      </section>
      {aberto && <div className="orc-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setAberto(false) }}><section className="orc-modal" role="dialog" aria-modal="true" aria-labelledby="orc-modal-title"><header><div><small>NOVA PROPOSTA COMERCIAL</small><h3 id="orc-modal-title">Criar orçamento</h3></div><button onClick={() => setAberto(false)} aria-label="Fechar"><X size={18}/></button></header><div className="orc-form">
        <label>Cliente<select value={clienteId} onChange={e => setClienteId(e.target.value)}><option value="">Selecione um cliente</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
        <label>Título da proposta<input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex.: Cartões de visita 4x4"/></label>
        <label>Validade da proposta<input type="date" value={validade} onChange={e => setValidade(e.target.value)}/></label>
        <div className="orc-items-head"><b>Itens e serviços</b><button type="button" onClick={() => setItens(current => [...current, { ...itemVazio }])}><Plus size={14}/> Adicionar item</button></div>
        {itens.map((item,index) => <div className="orc-item" key={index}><label>Descrição<input value={item.descricao} onChange={e => atualizarItem(index,{descricao:e.target.value})} placeholder="Descrição do serviço"/></label><label>Produto<input value={item.produto} onChange={e => atualizarItem(index,{produto:e.target.value})} placeholder="Opcional"/></label><label>Quantidade<input type="number" min="1" value={item.quantidade} onChange={e => atualizarItem(index,{quantidade:Number(e.target.value)})}/></label><label>Preço unitário<input type="number" min="0" step="0.01" value={item.preco_unitario} onChange={e => atualizarItem(index,{preco_unitario:Number(e.target.value)})}/></label><button type="button" className="orc-remove" aria-label="Remover item" disabled={itens.length === 1} onClick={() => setItens(current => current.filter((_,i)=>i!==index))}><Trash2 size={16}/></button></div>)}
        <label>Observações<textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2}/></label><div className="orc-total">Total da proposta <strong>{money(total)}</strong></div>
      </div><footer><button className="orc-cancel" onClick={() => setAberto(false)}>Cancelar</button><button className="orc-primary" disabled={saving || !clientes.length || !titulo.trim() || itens.some(i=>!i.descricao.trim() || i.quantidade<=0 || i.preco_unitario<0)} onClick={() => void salvar()}>{saving ? 'Gravando...' : 'Criar e enviar'} <Send size={15}/></button></footer></section></div>}
      <div className="orc-revision">REV. PRISMAPRES-ERP-20261109-003 · DADOS PERSISTIDOS NO SUPABASE</div>
    </div>
  )
}

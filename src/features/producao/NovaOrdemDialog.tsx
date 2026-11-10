import { useEffect, useState, type FormEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { Maquina, OrdemServico, Pedido } from '../../lib/types'

type Props = { onClose: () => void; onCreated: () => void }

export default function NovaOrdemDialog({ onClose, onCreated }: Props) {
  const { empresa, perfil } = useSession()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [pedidoId, setPedidoId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [quantidade, setQuantidade] = useState('1000')
  const [maquinaId, setMaquinaId] = useState('')
  const [prazo, setPrazo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase || !empresa?.id) return
    void Promise.all([
      supabase.from('gr_pedidos').select('*').eq('empresa_id', empresa.id).neq('status', 'concluido'),
      supabase.from('gr_maquinas').select('*').eq('empresa_id', empresa.id).eq('ativo', true).order('nome'),
      supabase.from('gr_ordens_servico').select('*').eq('empresa_id', empresa.id),
    ]).then(([p, m, o]) => {
      if (p.error) setErro(p.error.message)
      else setPedidos((p.data ?? []) as Pedido[])
      if (!m.error) setMaquinas((m.data ?? []) as Maquina[])
      if (!o.error) setOrdens((o.data ?? []) as OrdemServico[])
    })
  }, [empresa?.id])

  const criar = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase || !empresa?.id) return
    const qtd = Number(quantidade)
    if (!descricao.trim() || !Number.isInteger(qtd) || qtd <= 0) {
      setErro('Informe o produto e uma tiragem inteira maior que zero.')
      return
    }
    const pedido = pedidos.find(item => item.id === pedidoId)
    if (pedido && ordens.some(os => os.pedido_id === pedido.id)) {
      setErro('Este pedido já possui uma ordem de produção.')
      return
    }
    setLoading(true); setErro(null)
    const numero = 'OP-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6)
    const { data, error } = await supabase.from('gr_ordens_servico').insert({
      empresa_id: empresa.id, numero, pedido_id: pedido?.id ?? null,
      cliente_id: pedido?.cliente_id ?? null, descricao: descricao.trim(),
      etapa: 'pre', maquina_id: maquinaId || null, quantidade: qtd,
      quantidade_boa: 0, refugo: 0, status: 'aberto',
      inicio_previsto: null, fim_previsto: prazo || pedido?.prazo_entrega || null,
      inicio_real: null, fim_real: null, operador: perfil?.nome ?? null,
    }).select('*').single()
    if (error || !data) {
      setErro('Não foi possível criar a OP: ' + (error?.message ?? 'sem retorno'))
      setLoading(false); return
    }
    const roteiro = [
      ['Pré-impressão', 'Conferência de arquivo e prova'],
      ['Impressão', 'Preparação e impressão'],
      ['Acabamento', 'Corte, dobra e acabamento'],
      ['Expedição', 'Conferência e embalagem'],
    ]
    const { error: routeError } = await supabase.from('gr_os_operacoes').insert(roteiro.map(([posto, detalhe], index) => ({
      empresa_id: empresa.id, os_id: data.id, sequencia: index + 1,
      posto, descricao: detalhe, maquina_id: index === 1 ? (maquinaId || null) : null,
      status: 'pendente', qtd_boa: 0, qtd_refugo: 0, operador: null,
      inicio: null, fim: null, observacoes: null,
    })))
    if (routeError) {
      await supabase.from('gr_ordens_servico').delete().eq('id', data.id).eq('empresa_id', empresa.id)
      setErro('Falha ao criar o roteiro. A OP foi revertida: ' + routeError.message)
      setLoading(false); return
    }
    setLoading(false)
    onCreated()
  }

  return <div className="pro-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !loading) onClose() }}>
    <form className="pro-modal pro-create-modal" role="dialog" aria-modal="true" onSubmit={criar}>
      <header><div><small>PLANEJAMENTO E CONTROLE DA PRODUÇÃO</small><h3>Nova ordem de produção</h3></div><button type="button" onClick={onClose} aria-label="Fechar"><X size={18}/></button></header>
      <div className="pro-create-form">
        {erro && <p className="pro-error" role="alert">{erro}</p>}
        <label>Pedido de origem<select value={pedidoId} onChange={event => { const id = event.target.value; setPedidoId(id); const item = pedidos.find(p => p.id === id); if (item) setDescricao(item.descricao || 'Produção gráfica') }}><option value="">Ordem avulsa</option>{pedidos.filter(p => !ordens.some(os => os.pedido_id === p.id)).map(p => <option key={p.id} value={p.id}>{p.numero} · {p.descricao || 'Pedido gráfico'}</option>)}</select></label>
        <label>Produto / serviço<input value={descricao} onChange={event => setDescricao(event.target.value)} required placeholder="Ex.: Cartão de visita 4x4"/></label>
        <div><label>Tiragem / meta<input type="number" min="1" step="1" value={quantidade} onChange={event => setQuantidade(event.target.value)} required/></label><label>Máquina principal<select value={maquinaId} onChange={event => setMaquinaId(event.target.value)}><option value="">Definir no posto</option>{maquinas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select></label></div>
        <label>Prazo de entrega<input type="date" value={prazo} onChange={event => setPrazo(event.target.value)}/></label>
        <p>Será criado o roteiro de pré-impressão, impressão, acabamento e expedição.</p>
      </div>
      <footer><button type="button" className="pro-create-cancel" onClick={onClose} disabled={loading}>Cancelar</button><button type="submit" className="pro-create-submit" disabled={loading}><Plus size={14}/>{loading ? 'Criando...' : 'Criar OP e enviar ao PCP'}</button></footer>
    </form>
  </div>
}

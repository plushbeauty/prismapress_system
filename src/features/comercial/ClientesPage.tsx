/*
 * @REVISAO: PRISMAPRES-ERP-20261109-002
 * @DATA: 2026-11-09
 * @ALTERACOES:
 * - Cadastro, edição e busca de clientes com persistência no Supabase.
 * - Contagem de pedidos por cliente consultada no banco da empresa.
 * - Isolamento por empresa_id e estados explícitos de carregamento/erro.
 * @STATUS: APLICADO
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Users, X, LoaderCircle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { Cliente } from '../../lib/types'
import './ClientesPage.css'

type ClienteForm = {
  nome: string
  email: string
  telefone: string
  cidade: string
  contato: string
  cnpj: string
}

const vazio: ClienteForm = { nome: '', email: '', telefone: '', cidade: '', contato: '', cnpj: '' }

export default function ClientesPage() {
  const { empresa } = useSession()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidosPorCliente, setPedidosPorCliente] = useState<Record<string, number>>({})
  const [busca, setBusca] = useState('')
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ClienteForm>(vazio)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!supabase || !empresa?.id) {
      setErro('Banco de dados ou empresa não disponíveis para esta sessão.')
      setLoading(false)
      return
    }
    setLoading(true)
    setErro(null)
    const [clientesResult, pedidosResult] = await Promise.all([
      supabase.from('gr_clientes').select('*').eq('empresa_id', empresa.id).order('nome'),
      supabase.from('gr_pedidos').select('cliente_id').eq('empresa_id', empresa.id).not('cliente_id', 'is', null),
    ])
    if (clientesResult.error) {
      setErro(clientesResult.error.message)
      setClientes([])
    } else {
      setClientes((clientesResult.data ?? []) as Cliente[])
    }
    if (pedidosResult.error) {
      setPedidosPorCliente({})
      if (!clientesResult.error) setErro('Clientes carregados. Não foi possível consultar a contagem de pedidos: ' + pedidosResult.error.message)
    } else {
      const counts: Record<string, number> = {}
      for (const pedido of pedidosResult.data ?? []) {
        if (pedido.cliente_id) counts[pedido.cliente_id] = (counts[pedido.cliente_id] ?? 0) + 1
      }
      setPedidosPorCliente(counts)
    }
    setLoading(false)
  }, [empresa?.id])

  useEffect(() => { void carregar() }, [carregar])

  const lista = useMemo(() => clientes.filter(cliente =>
    [cliente.nome, cliente.email, cliente.cidade, cliente.telefone, cliente.cnpj]
      .some(value => (value ?? '').toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')))
  ), [clientes, busca])

  const iniciarNovo = () => { setEditId(null); setForm(vazio); setOpen(true) }
  const iniciarEdicao = (cliente: Cliente) => {
    setEditId(cliente.id)
    setForm({
      nome: cliente.nome ?? '', email: cliente.email ?? '', telefone: cliente.telefone ?? '',
      cidade: cliente.cidade ?? '', contato: cliente.contato ?? '', cnpj: cliente.cnpj ?? '',
    })
    setOpen(true)
  }

  const salvar = async () => {
    if (!supabase || !empresa?.id || !form.nome.trim()) return
    setSaving(true)
    setErro(null)
    const payload = {
      nome: form.nome.trim(), email: form.email.trim() || null, telefone: form.telefone.trim() || null,
      cidade: form.cidade.trim() || null, contato: form.contato.trim() || null, cnpj: form.cnpj.trim() || null,
    }
    const result = editId
      ? await supabase.from('gr_clientes').update(payload).eq('id', editId).eq('empresa_id', empresa.id)
      : await supabase.from('gr_clientes').insert({ ...payload, empresa_id: empresa.id, ativo: true })
    if (result.error) {
      setErro(result.error.message)
    } else {
      setOpen(false)
      setForm(vazio)
      await carregar()
    }
    setSaving(false)
  }

  return (
    <div className="clientes-page">
      <div className="clientes-heading">
        <div><span className="clientes-eyebrow"><Users size={14}/> COMERCIAL · RELACIONAMENTO</span><h2>Cadastro de clientes</h2><p>Cadastre empresas e contatos e acompanhe os pedidos vinculados.</p></div>
        <button type="button" className="clientes-primary" onClick={iniciarNovo}><Plus size={16}/> Novo cliente</button>
      </div>
      <div className="clientes-summary"><strong>{clientes.length}</strong><span>clientes cadastrados nesta empresa</span><span className="clientes-revision">REV. PRISMAPRES-ERP-20261109-002</span></div>
      {erro && <div className="clientes-error" role="alert">{erro}</div>}
      <section className="clientes-panel">
        <div className="clientes-toolbar"><label><Search size={16}/><input value={busca} onChange={event => setBusca(event.target.value)} placeholder="Buscar por nome, e-mail, telefone ou cidade"/></label><span>{lista.length} resultado(s)</span></div>
        {loading ? <div className="clientes-empty"><LoaderCircle className="clientes-spin" size={20}/> Carregando clientes do banco...</div> :
          lista.length === 0 ? <div className="clientes-empty"><Users size={22}/><b>{busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</b><span>{busca ? 'Altere os termos da busca.' : 'Cadastre o primeiro cliente para começar.'}</span></div> :
          <div className="clientes-table-wrap"><table><thead><tr><th>Cliente / razão social</th><th>E-mail</th><th>Telefone</th><th>Cidade</th><th>Pedidos</th><th/></tr></thead><tbody>
            {lista.map(cliente => <tr key={cliente.id}><td><b>{cliente.nome}</b>{cliente.cnpj && <small>{cliente.cnpj}</small>}</td><td>{cliente.email || '—'}</td><td>{cliente.telefone || '—'}</td><td>{[cliente.cidade, cliente.uf].filter(Boolean).join(' / ') || '—'}</td><td><span className="clientes-count">{pedidosPorCliente[cliente.id] ?? 0}</span></td><td><button type="button" className="clientes-edit" onClick={() => iniciarEdicao(cliente)} aria-label={'Editar ' + cliente.nome}><Pencil size={14}/> Editar</button></td></tr>)}
          </tbody></table></div>}
      </section>
      {open && <div className="clientes-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false) }}>
        <section className="clientes-modal" role="dialog" aria-modal="true" aria-labelledby="clientes-modal-title">
          <header><div><small>CADASTRO COMERCIAL</small><h3 id="clientes-modal-title">{editId ? 'Editar cliente' : 'Novo cliente'}</h3></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar"><X size={18}/></button></header>
          <div className="clientes-form">
            <label>Nome / razão social *<input autoFocus value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
            <label>E-mail<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>
            <div className="clientes-form-grid"><label>Telefone<input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })}/></label><label>CNPJ / CPF<input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })}/></label></div>
            <div className="clientes-form-grid"><label>Pessoa de contato<input value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })}/></label><label>Cidade<input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })}/></label></div>
          </div>
          <footer><button type="button" className="clientes-cancel" onClick={() => setOpen(false)}>Cancelar</button><button type="button" className="clientes-primary" disabled={saving || !form.nome.trim()} onClick={() => void salvar()}>{saving ? 'Salvando...' : 'Salvar cliente'}</button></footer>
        </section>
      </div>}
    </div>
  )
}

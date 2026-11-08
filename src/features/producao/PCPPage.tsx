import { useState } from 'react'
import { AlertCircle, CalendarDays, ClipboardList, FileText, Layers3, Plus, Printer, Search } from 'lucide-react'
import './PCPPage.css'

type FormState = {
  pedido: string
  cliente: string
  produto: string
  referencia: string
  tiragem: string
  especificacoes: string
  arquivo: string
  maquina: string
  operador: string
  matricula: string
  prazo: string
  prioridade: string
}

const initial: FormState = {
  pedido: '', cliente: '', produto: '', referencia: '', tiragem: '',
  especificacoes: '', arquivo: '', maquina: '', operador: '', matricula: '',
  prazo: '', prioridade: 'normal',
}

export default function PCPPage() {
  const [form, setForm] = useState<FormState>(initial)
  const [search, setSearch] = useState('')
  const update = (key: keyof FormState, value: string) => setForm(current => ({ ...current, [key]: value }))

  return (
    <section className="prisma-pcp">
      <div className="pcp-intro">
        <div><span>PLANEJAMENTO E CONTROLE DA PRODUÇÃO</span><h2>Ordens de produção</h2><p>Transforme pedidos aprovados em ordens técnicas, organizadas por máquina, prazo e prioridade.</p></div>
        <div className="pcp-status"><i/> MÓDULO PREPARADO · BANCO PENDENTE</div>
      </div>

      <div className="pcp-layout">
        <form className="pcp-form" onSubmit={e => e.preventDefault()}>
          <div className="pcp-form-title"><span><Plus size={17}/></span><div><small>ABERTURA DE PRODUÇÃO</small><h3>Nova ordem de produção</h3></div></div>
          <div className="pcp-field"><label htmlFor="pcp-order">Pedido interno</label><select id="pcp-order" value={form.pedido} onChange={e => update('pedido', e.target.value)}><option value="">Selecione um pedido aprovado</option></select><small>Pedidos serão carregados do módulo Comercial após a integração.</small></div>
          <div className="pcp-two">
            <div className="pcp-field"><label htmlFor="pcp-client">Cliente</label><input id="pcp-client" value={form.cliente} onChange={e => update('cliente',e.target.value)} placeholder="Nome do cliente"/></div>
            <div className="pcp-field"><label htmlFor="pcp-product">Produto gráfico</label><input id="pcp-product" value={form.produto} onChange={e => update('produto',e.target.value)} placeholder="Ex.: cartão, folder, rótulo"/></div>
          </div>
          <div className="pcp-two">
            <div className="pcp-field"><label htmlFor="pcp-ref">Referência / código</label><input id="pcp-ref" value={form.referencia} onChange={e => update('referencia',e.target.value)} placeholder="Código interno"/></div>
            <div className="pcp-field"><label htmlFor="pcp-qty">Tiragem planejada</label><input id="pcp-qty" type="number" min="1" value={form.tiragem} onChange={e => update('tiragem',e.target.value)} placeholder="Quantidade"/></div>
          </div>
          <div className="pcp-field"><label htmlFor="pcp-spec">Especificações técnicas</label><textarea id="pcp-spec" rows={3} value={form.especificacoes} onChange={e => update('especificacoes',e.target.value)} placeholder="Papel/substrato, gramatura, formato, cores, resolução, acabamento..."/></div>
          <div className="pcp-field"><label htmlFor="pcp-file">Arquivo de impressão</label><input id="pcp-file" type="url" value={form.arquivo} onChange={e => update('arquivo',e.target.value)} placeholder="Link do arquivo aprovado"/></div>
          <div className="pcp-two">
            <div className="pcp-field"><label htmlFor="pcp-machine">Máquina / equipamento</label><input id="pcp-machine" value={form.maquina} onChange={e => update('maquina',e.target.value)} placeholder="A definir"/></div>
            <div className="pcp-field"><label htmlFor="pcp-deadline">Prazo de produção</label><input id="pcp-deadline" type="date" value={form.prazo} onChange={e => update('prazo',e.target.value)}/></div>
          </div>
          <div className="pcp-two">
            <div className="pcp-field"><label htmlFor="pcp-operator">Operador responsável</label><input id="pcp-operator" value={form.operador} onChange={e => update('operador',e.target.value)} placeholder="A definir"/></div>
            <div className="pcp-field"><label htmlFor="pcp-registration">Matrícula</label><input id="pcp-registration" value={form.matricula} onChange={e => update('matricula',e.target.value)} placeholder="Matrícula"/></div>
          </div>
          <div className="pcp-field"><label htmlFor="pcp-priority">Prioridade</label><select id="pcp-priority" value={form.prioridade} onChange={e => update('prioridade',e.target.value)}><option value="alta">Alta</option><option value="normal">Normal</option><option value="baixa">Baixa</option></select></div>
          <button className="pcp-submit" type="button" disabled><Plus size={16}/> Criar ordem e enviar à produção</button>
          <p className="pcp-disabled-note"><AlertCircle size={14}/> Gravação bloqueada até conectar pedidos, estoque, máquinas e banco de dados real.</p>
        </form>

        <div className="pcp-orders">
          <div className="pcp-orders-head"><div><small>PROGRAMAÇÃO</small><h3>Ordens cadastradas</h3><p>Acompanhe tiragem, máquina, avanço e situação de cada trabalho.</p></div><span>0 ordens</span></div>
          <div className="pcp-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por OS, cliente ou produto" /></div>
          <div className="pcp-empty"><div><ClipboardList size={27}/></div><h4>Nenhuma ordem cadastrada</h4><p>As ordens criadas a partir dos pedidos aprovados aparecerão aqui com progresso de produção, refugo, prazo e status.</p><div className="pcp-flow"><span><FileText size={15}/> Pedido aprovado</span><b>→</b><span><Layers3 size={15}/> Ficha técnica</span><b>→</b><span><Printer size={15}/> Produção</span></div></div>
          <div className="pcp-foot"><span><CalendarDays size={14}/> Planejamento de produção</span><span>Sem dados operacionais conectados</span></div>
        </div>
      </div>
    </section>
  )
}

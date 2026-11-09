/*
 * @REVISAO: PRISMAPRES-ERP-20261109-004
 * @DATA: 2026-11-09
 * @ALTERACOES: Fila de pedidos por setor; importação .eml/.txt; parser; aprovação e geração de OP.
 * @STATUS: APLICADO
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Factory, Mail, Search, Upload, FileText, LoaderCircle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { Cliente, Pedido, OrdemServico } from '../../lib/types'
import './PedidosPage.css'

type Parsed = { cliente:string; email:string; produto:string; quantidade:number; prazo:string; valor:number; referencia:string }
const money=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0)
const date=(s:string|null)=>s?new Date(s+'T12:00:00').toLocaleDateString('pt-BR'):'Sem prazo'
const parse=(raw:string):Parsed|null=>{
 const clean=raw.replace(/\r/g,'')
 const field=(name:string)=>clean.match(new RegExp('^\\s*(?:'+name+')\\s*:\\s*(.+))?.[1]?.trim()??''
 const cliente=field('Cliente')
 const produto=field('Produto|Serviço|Item')
 if(!cliente||!produto)return null
 const qtdRaw=field('Quantidade|Qtd').replace(/\./g,'').replace(',','.')
 const valorRaw=field('Valor|Total').replace(/R\$\s?/i,'').replace(/\./g,'').replace(',','.')
 const prazoRaw=field('Prazo|Entrega')
 let prazo=''
 if(/^\d{4}-\d{2}-\d{2}$/.test(prazoRaw))prazo=prazoRaw
 else if(/^\d{2}\/\d{2}\/\d{4}$/.test(prazoRaw)){const [d,m,y]=prazoRaw.split('/');prazo=y+'-'+m+'-'+d}
 return {cliente,email:field('E-mail|Email'),produto,quantidade:Math.max(1,Number(qtdRaw)||1),prazo,valor:Math.max(0,Number(valorRaw)||0),referencia:field('REF|Referência')}
}
const setores=[{id:'pre',label:'Pré-impressão',color:'#8B5CF6'},{id:'impressao',label:'Impressão',color:'#1596A8'},{id:'acabamento',label:'Acabamento',color:'#D68B27'},{id:'expedicao',label:'Expedição',color:'#26945D'}]
export default function PedidosPage(){
 const {empresa,perfil}=useSession()
 const [pedidos,setPedidos]=useState<Pedido[]>([])
 const [clientes,setClientes]=useState<Cliente[]>([])
 const [ops,setOps]=useState<OrdemServico[]>([])
 const [filtro,setFiltro]=useState('todos')
 const [busca,setBusca]=useState('')
 const [loading,setLoading]=useState(true)
 const [saving,setSaving]=useState(false)
 const [erro,setErro]=useState<string|null>(null)
 const [sucesso,setSucesso]=useState<string|null>(null)
 const [modal,setModal]=useState(false)
 const [texto,setTexto]=useState('')
 const [parsed,setParsed]=useState<Parsed|null>(null)
 const fileRef=useRef<HTMLInputElement>(null)
 const carregar=useCallback(async()=>{
  if(!supabase||!empresa?.id){setErro('Banco ou empresa não disponíveis.');setLoading(false);return}
  setLoading(true);setErro(null)
  const [p,c,o]=await Promise.all([
   supabase.from('gr_pedidos').select('*').eq('empresa_id',empresa.id).order('created_at',{ascending:false}),
   supabase.from('gr_clientes').select('*').eq('empresa_id',empresa.id).order('nome'),
   supabase.from('gr_ordens_servico').select('*').eq('empresa_id',empresa.id)
  ])
  if(p.error)setErro(p.error.message);else setPedidos((p.data??[]) as Pedido[])
  if(c.error)setErro(c.error.message);else setClientes((c.data??[]) as Cliente[])
  if(o.error&&o.error.code!=='42P01'&&o.error.code!=='PGRST205')setErro(o.error.message);else setOps((o.data??[]) as OrdemServico[])
  setLoading(false)
 },[empresa?.id])
 useEffect(()=>{void carregar()},[carregar])
 const lista=useMemo(()=>pedidos.filter(p=>{
  const term=busca.toLocaleLowerCase('pt-BR')
  const cli=clientes.find(c=>c.id===p.cliente_id)?.nome??''
  return (filtro==='todos'||(filtro==='pendentes'?p.status==='aberto':p.status===filtro))&&[p.numero,cli].some(v=>(v??'').toLocaleLowerCase('pt-BR').includes(term))
 }),[pedidos,clientes,filtro,busca])
 const importar=async(file:File)=>{if(file.size>2_000_000){setErro('Arquivo acima de 2 MB.');return}setTexto(await file.text());setParsed(null);setErro(null)}
 const criar=async()=>{
  if(!supabase||!empresa?.id||!parsed)return
  setSaving(true);setErro(null)
  let cli=clientes.find(c=>c.nome.trim().toLocaleLowerCase('pt-BR')===parsed.cliente.trim().toLocaleLowerCase('pt-BR'))
  if(!cli){
   const {data,error}=await supabase.from('gr_clientes').insert({empresa_id:empresa.id,nome:parsed.cliente,email:parsed.email||null,ativo:true}).select('*').single()
   if(error||!data){setErro('Não foi possível cadastrar o cliente: '+(error?.message??'sem retorno'));setSaving(false);return}
   cli=data as Cliente
  }
  const numero='PED-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6)
  const {error}=await supabase.from('gr_pedidos').insert({empresa_id:empresa.id,numero,cliente_id:cli.id,orcamento_id:null,status:'aberto',valor_total:parsed.valor,prazo_entrega:parsed.prazo||null,descricao:parsed.produto,quantidade:parsed.quantidade,referencia:parsed.referencia||null,origem:'email',setor:'pre'})
  if(error){setErro('Falha ao gravar pedido: '+error.message);setSaving(false);return}
  setModal(false);setTexto('');setParsed(null);setSucesso('Pedido importado e registrado como pendente.');await carregar();setSaving(false)
 }
 const aprovar=async(p:Pedido)=>{
  if(!supabase||!empresa?.id)return
  setSaving(true);setErro(null)
  const existing=ops.find(o=>o.pedido_id===p.id)
  if(!existing){
   const {data:createdOp,error}=await supabase.from('gr_ordens_servico').insert({empresa_id:empresa.id,numero:'OP-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6),pedido_id:p.id,cliente_id:p.cliente_id,descricao:(p as Pedido&{descricao?:string}).descricao||'Serviço gráfico',etapa:'pre',maquina_id:null,quantidade:(p as Pedido&{quantidade?:number}).quantidade||1,quantidade_boa:0,refugo:0,status:'aberto',inicio_previsto:null,fim_previsto:p.prazo_entrega,inicio_real:null,fim_real:null,operador:perfil?.nome??null}).select('*').single()
   if(error||!createdOp){setErro('Falha ao gerar ordem de serviço: '+(error?.message??'sem retorno'));setSaving(false);return}
   const roteiro=[['Pré-impressão','Conferência de arquivo e prova'],['Impressão','Preparação e impressão'],['Acabamento','Corte, dobra e acabamento'],['Expedição','Conferência e embalagem']]
   const {error:routeError}=await supabase.from('gr_os_operacoes').insert(roteiro.map(([posto,descricao],index)=>({empresa_id:empresa.id,os_id:createdOp.id,sequencia:index+1,posto,descricao,maquina_id:null,status:'pendente',qtd_boa:0,qtd_refugo:0,operador:null,inicio:null,fim:null,observacoes:null})))
   if(routeError){await supabase.from('gr_ordens_servico').delete().eq('id',createdOp.id).eq('empresa_id',empresa.id);setErro('Falha ao criar roteiro de produção: '+routeError.message);setSaving(false);return}
  }
  const {error}=await supabase.from('gr_pedidos').update({status:'em_producao'}).eq('id',p.id).eq('empresa_id',empresa.id)
  if(error)setErro(error.message);else{setSucesso('Pedido aprovado e ordem de produção gerada.');await carregar()}
  setSaving(false)
 }
 return <div className="ped-page">
  <div className="ped-heading"><div><span className="ped-eyebrow"><Factory size={14}/> COMERCIAL · FILA DE PRODUÇÃO</span><h2>Pedidos e entrada comercial</h2><p>Acompanhe pedidos, importe solicitações recebidas por e-mail e encaminhe para produção.</p></div><button className="ped-primary" onClick={()=>{setModal(true);setErro(null);setParsed(null)}}><Mail size={16}/> Importar pedido</button></div>
  {erro&&<div className="ped-error" role="alert">{erro}</div>}{sucesso&&<div className="ped-success" role="status">{sucesso}</div>}
  <div className="ped-filters"><button className={filtro==='todos'?'active':''} onClick={()=>setFiltro('todos')}>Todos · {pedidos.length}</button><button className={filtro==='pendentes'?'active':''} onClick={()=>setFiltro('pendentes')}>Pendentes · {pedidos.filter(p=>p.status==='aberto').length}</button><button className={filtro==='em_producao'?'active':''} onClick={()=>setFiltro('em_producao')}>Em produção · {pedidos.filter(p=>p.status==='em_producao').length}</button><button className={filtro==='concluido'?'active':''} onClick={()=>setFiltro('concluido')}>Concluídos · {pedidos.filter(p=>p.status==='concluido').length}</button></div>
  <div className="ped-sector-legend">{setores.map(s=><span key={s.id}><i style={{background:s.color}}/>{s.label}</span>)}</div>
  <section className="ped-panel"><div className="ped-toolbar"><label><Search size={15}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar pedido ou cliente"/></label><span>{lista.length} pedido(s)</span></div>
  {loading?<div className="ped-empty"><LoaderCircle size={20}/> Carregando pedidos...</div>:!lista.length?<div className="ped-empty"><FileText size={24}/><b>Nenhum pedido nesta visualização</b><span>Importe um pedido por e-mail ou aprove um orçamento.</span></div>:<div className="ped-grid">{lista.map(p=>{const cli=clientes.find(c=>c.id===p.cliente_id);const op=ops.find(o=>o.pedido_id===p.id);const desc=(p as Pedido&{descricao?:string}).descricao??'Pedido gráfico';const qty=(p as Pedido&{quantidade?:number}).quantidade??1;return <article className="ped-card" key={p.id} style={{borderLeftColor:setores.find(s=>s.id===(p as Pedido&{setor?:string}).setor)?.color??'#1596A8'}}><div className="ped-card-top"><b>{p.numero}</b><span className={'ped-status '+p.status}>{p.status==='aberto'?'Pendente':p.status==='em_producao'?'Em produção':p.status==='concluido'?'Concluído':'Cancelado'}</span></div><h3>{cli?.nome??'Cliente não identificado'}</h3><p>{qty.toLocaleString('pt-BR')} × {desc}</p><div className="ped-meta"><span>Prazo: {date(p.prazo_entrega)}</span><b>{money(p.valor_total)}</b></div><footer>{op&&<span>OP: {op.numero}</span>}{p.status==='aberto'&&<button disabled={saving} onClick={()=>void aprovar(p)}><Check size={14}/> Aprovar e gerar OP</button>}{op&&<button className="ped-link" onClick={()=>window.dispatchEvent(new CustomEvent('prismapres:navigate',{detail:'Chão de gráfica'}))}>Abrir OP</button>}</footer></article>})}</div>}
  </section>
  <div className="ped-revision">REV. PRISMAPRES-ERP-20261109-004 · PEDIDOS E IMPORTAÇÃO DE E-MAIL</div>
  {modal&&<div className="ped-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="ped-modal" role="dialog" aria-modal="true"><header><div><small>ENTRADA DE PEDIDOS</small><h3>Importar pedido por e-mail</h3></div><button onClick={()=>setModal(false)}>×</button></header><div className="ped-modal-body"><p>Cole o conteúdo do e-mail ou importe um arquivo .eml/.txt. A leitura é local; conexão IMAP automática não está habilitada.</p><div className="ped-import-actions"><button onClick={()=>fileRef.current?.click()}><Upload size={14}/> Selecionar arquivo</button><input ref={fileRef} hidden type="file" accept=".eml,.txt,message/rfc822,text/plain" onChange={e=>{const f=e.target.files?.[0];if(f)void importar(f);e.currentTarget.value=''}}/></div><textarea value={texto} onChange={e=>{setTexto(e.target.value);setParsed(null)}} placeholder={'Cliente: Gráfica Exemplo\nE-mail: compras@exemplo.com\nProduto: Cartão de visita 4x4\nQuantidade: 1000\nPrazo: 20/11/2026\nValor: 350,00\nREF: CV-001'}/><button className="ped-primary" onClick={()=>{const result=parse(texto);if(!result){setErro('Não identifiquei Cliente e Produto. Confira os campos do e-mail.');setParsed(null)}else{setErro(null);setParsed(result)}}}><Mail size={15}/> Interpretar e-mail</button>{parsed&&<div className="ped-preview"><b>Confira os dados antes de gravar</b><span>Cliente: {parsed.cliente}</span><span>Produto: {parsed.produto}</span><span>Quantidade: {parsed.quantidade}</span><span>Prazo: {parsed.prazo||'A definir'}</span><span>Valor: {money(parsed.valor)}</span><button className="ped-primary" disabled={saving} onClick={()=>void criar()}>{saving?'Gravando...':'Criar pedido pendente'}</button></div>}</div></section></div>}
 </div>
}
,'im'))?.[1]?.trim()??''
 const cliente=field('Cliente')
 const produto=field('Produto|Serviço|Item')
 if(!cliente||!produto)return null
 const qtdRaw=field('Quantidade|Qtd').replace(/\./g,'').replace(',','.')
 const valorRaw=field('Valor|Total').replace(/R\$\s?/i,'').replace(/\./g,'').replace(',','.')
 const prazoRaw=field('Prazo|Entrega')
 let prazo=''
 if(/^\d{4}-\d{2}-\d{2}$/.test(prazoRaw))prazo=prazoRaw
 else if(/^\d{2}\/\d{2}\/\d{4}$/.test(prazoRaw)){const [d,m,y]=prazoRaw.split('/');prazo=y+'-'+m+'-'+d}
 return {cliente,email:field('E-mail|Email'),produto,quantidade:Math.max(1,Number(qtdRaw)||1),prazo,valor:Math.max(0,Number(valorRaw)||0),referencia:field('REF|Referência')}
}
const setores=[{id:'pre',label:'Pré-impressão',color:'#8B5CF6'},{id:'impressao',label:'Impressão',color:'#1596A8'},{id:'acabamento',label:'Acabamento',color:'#D68B27'},{id:'expedicao',label:'Expedição',color:'#26945D'}]
export default function PedidosPage(){
 const {empresa,perfil}=useSession()
 const [pedidos,setPedidos]=useState<Pedido[]>([])
 const [clientes,setClientes]=useState<Cliente[]>([])
 const [ops,setOps]=useState<OrdemServico[]>([])
 const [filtro,setFiltro]=useState('todos')
 const [busca,setBusca]=useState('')
 const [loading,setLoading]=useState(true)
 const [saving,setSaving]=useState(false)
 const [erro,setErro]=useState<string|null>(null)
 const [sucesso,setSucesso]=useState<string|null>(null)
 const [modal,setModal]=useState(false)
 const [texto,setTexto]=useState('')
 const [parsed,setParsed]=useState<Parsed|null>(null)
 const fileRef=useRef<HTMLInputElement>(null)
 const carregar=useCallback(async()=>{
  if(!supabase||!empresa?.id){setErro('Banco ou empresa não disponíveis.');setLoading(false);return}
  setLoading(true);setErro(null)
  const [p,c,o]=await Promise.all([
   supabase.from('gr_pedidos').select('*').eq('empresa_id',empresa.id).order('created_at',{ascending:false}),
   supabase.from('gr_clientes').select('*').eq('empresa_id',empresa.id).order('nome'),
   supabase.from('gr_ordens_servico').select('*').eq('empresa_id',empresa.id)
  ])
  if(p.error)setErro(p.error.message);else setPedidos((p.data??[]) as Pedido[])
  if(c.error)setErro(c.error.message);else setClientes((c.data??[]) as Cliente[])
  if(o.error&&o.error.code!=='42P01'&&o.error.code!=='PGRST205')setErro(o.error.message);else setOps((o.data??[]) as OrdemServico[])
  setLoading(false)
 },[empresa?.id])
 useEffect(()=>{void carregar()},[carregar])
 const lista=useMemo(()=>pedidos.filter(p=>{
  const term=busca.toLocaleLowerCase('pt-BR')
  const cli=clientes.find(c=>c.id===p.cliente_id)?.nome??''
  return (filtro==='todos'||(filtro==='pendentes'?p.status==='aberto':p.status===filtro))&&[p.numero,cli].some(v=>(v??'').toLocaleLowerCase('pt-BR').includes(term))
 }),[pedidos,clientes,filtro,busca])
 const importar=async(file:File)=>{if(file.size>2_000_000){setErro('Arquivo acima de 2 MB.');return}setTexto(await file.text());setParsed(null);setErro(null)}
 const criar=async()=>{
  if(!supabase||!empresa?.id||!parsed)return
  setSaving(true);setErro(null)
  let cli=clientes.find(c=>c.nome.trim().toLocaleLowerCase('pt-BR')===parsed.cliente.trim().toLocaleLowerCase('pt-BR'))
  if(!cli){
   const {data,error}=await supabase.from('gr_clientes').insert({empresa_id:empresa.id,nome:parsed.cliente,email:parsed.email||null,ativo:true}).select('*').single()
   if(error||!data){setErro('Não foi possível cadastrar o cliente: '+(error?.message??'sem retorno'));setSaving(false);return}
   cli=data as Cliente
  }
  const numero='PED-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6)
  const {error}=await supabase.from('gr_pedidos').insert({empresa_id:empresa.id,numero,cliente_id:cli.id,orcamento_id:null,status:'aberto',valor_total:parsed.valor,prazo_entrega:parsed.prazo||null,descricao:parsed.produto,quantidade:parsed.quantidade,referencia:parsed.referencia||null,origem:'email',setor:'pre'})
  if(error){setErro('Falha ao gravar pedido: '+error.message);setSaving(false);return}
  setModal(false);setTexto('');setParsed(null);setSucesso('Pedido importado e registrado como pendente.');await carregar();setSaving(false)
 }
 const aprovar=async(p:Pedido)=>{
  if(!supabase||!empresa?.id)return
  setSaving(true);setErro(null)
  const existing=ops.find(o=>o.pedido_id===p.id)
  if(!existing){
   const {error}=await supabase.from('gr_ordens_servico').insert({empresa_id:empresa.id,numero:'OP-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6),pedido_id:p.id,cliente_id:p.cliente_id,descricao:(p as Pedido&{descricao?:string}).descricao||'Serviço gráfico',etapa:'pre',maquina_id:null,quantidade:(p as Pedido&{quantidade?:number}).quantidade||1,quantidade_boa:0,refugo:0,status:'aberto',inicio_previsto:null,fim_previsto:p.prazo_entrega,inicio_real:null,fim_real:null,operador:perfil?.nome??null})
   if(error){setErro('Falha ao gerar ordem de serviço: '+error.message);setSaving(false);return}
  }
  const {error}=await supabase.from('gr_pedidos').update({status:'em_producao'}).eq('id',p.id).eq('empresa_id',empresa.id)
  if(error)setErro(error.message);else{setSucesso('Pedido aprovado e ordem de produção gerada.');await carregar()}
  setSaving(false)
 }
 return <div className="ped-page">
  <div className="ped-heading"><div><span className="ped-eyebrow"><Factory size={14}/> COMERCIAL · FILA DE PRODUÇÃO</span><h2>Pedidos e entrada comercial</h2><p>Acompanhe pedidos, importe solicitações recebidas por e-mail e encaminhe para produção.</p></div><button className="ped-primary" onClick={()=>{setModal(true);setErro(null);setParsed(null)}}><Mail size={16}/> Importar pedido</button></div>
  {erro&&<div className="ped-error" role="alert">{erro}</div>}{sucesso&&<div className="ped-success" role="status">{sucesso}</div>}
  <div className="ped-filters"><button className={filtro==='todos'?'active':''} onClick={()=>setFiltro('todos')}>Todos · {pedidos.length}</button><button className={filtro==='pendentes'?'active':''} onClick={()=>setFiltro('pendentes')}>Pendentes · {pedidos.filter(p=>p.status==='aberto').length}</button><button className={filtro==='em_producao'?'active':''} onClick={()=>setFiltro('em_producao')}>Em produção · {pedidos.filter(p=>p.status==='em_producao').length}</button><button className={filtro==='concluido'?'active':''} onClick={()=>setFiltro('concluido')}>Concluídos · {pedidos.filter(p=>p.status==='concluido').length}</button></div>
  <div className="ped-sector-legend">{setores.map(s=><span key={s.id}><i style={{background:s.color}}/>{s.label}</span>)}</div>
  <section className="ped-panel"><div className="ped-toolbar"><label><Search size={15}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar pedido ou cliente"/></label><span>{lista.length} pedido(s)</span></div>
  {loading?<div className="ped-empty"><LoaderCircle size={20}/> Carregando pedidos...</div>:!lista.length?<div className="ped-empty"><FileText size={24}/><b>Nenhum pedido nesta visualização</b><span>Importe um pedido por e-mail ou aprove um orçamento.</span></div>:<div className="ped-grid">{lista.map(p=>{const cli=clientes.find(c=>c.id===p.cliente_id);const op=ops.find(o=>o.pedido_id===p.id);const desc=(p as Pedido&{descricao?:string}).descricao??'Pedido gráfico';const qty=(p as Pedido&{quantidade?:number}).quantidade??1;return <article className="ped-card" key={p.id} style={{borderLeftColor:setores.find(s=>s.id===(p as Pedido&{setor?:string}).setor)?.color??'#1596A8'}}><div className="ped-card-top"><b>{p.numero}</b><span className={'ped-status '+p.status}>{p.status==='aberto'?'Pendente':p.status==='em_producao'?'Em produção':p.status==='concluido'?'Concluído':'Cancelado'}</span></div><h3>{cli?.nome??'Cliente não identificado'}</h3><p>{qty.toLocaleString('pt-BR')} × {desc}</p><div className="ped-meta"><span>Prazo: {date(p.prazo_entrega)}</span><b>{money(p.valor_total)}</b></div><footer>{op&&<span>OP: {op.numero}</span>}{p.status==='aberto'&&<button disabled={saving} onClick={()=>void aprovar(p)}><Check size={14}/> Aprovar e gerar OP</button>}{op&&<button className="ped-link" onClick={()=>window.dispatchEvent(new CustomEvent('prismapres:navigate',{detail:'Chão de gráfica'}))}>Abrir OP</button>}</footer></article>})}</div>}
  </section>
  <div className="ped-revision">REV. PRISMAPRES-ERP-20261109-004 · PEDIDOS E IMPORTAÇÃO DE E-MAIL</div>
  {modal&&<div className="ped-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><section className="ped-modal" role="dialog" aria-modal="true"><header><div><small>ENTRADA DE PEDIDOS</small><h3>Importar pedido por e-mail</h3></div><button onClick={()=>setModal(false)}>×</button></header><div className="ped-modal-body"><p>Cole o conteúdo do e-mail ou importe um arquivo .eml/.txt. A leitura é local; conexão IMAP automática não está habilitada.</p><div className="ped-import-actions"><button onClick={()=>fileRef.current?.click()}><Upload size={14}/> Selecionar arquivo</button><input ref={fileRef} hidden type="file" accept=".eml,.txt,message/rfc822,text/plain" onChange={e=>{const f=e.target.files?.[0];if(f)void importar(f);e.currentTarget.value=''}}/></div><textarea value={texto} onChange={e=>{setTexto(e.target.value);setParsed(null)}} placeholder={'Cliente: Gráfica Exemplo\nE-mail: compras@exemplo.com\nProduto: Cartão de visita 4x4\nQuantidade: 1000\nPrazo: 20/11/2026\nValor: 350,00\nREF: CV-001'}/><button className="ped-primary" onClick={()=>{const result=parse(texto);if(!result){setErro('Não identifiquei Cliente e Produto. Confira os campos do e-mail.');setParsed(null)}else{setErro(null);setParsed(result)}}}><Mail size={15}/> Interpretar e-mail</button>{parsed&&<div className="ped-preview"><b>Confira os dados antes de gravar</b><span>Cliente: {parsed.cliente}</span><span>Produto: {parsed.produto}</span><span>Quantidade: {parsed.quantidade}</span><span>Prazo: {parsed.prazo||'A definir'}</span><span>Valor: {money(parsed.valor)}</span><button className="ped-primary" disabled={saving} onClick={()=>void criar()}>{saving?'Gravando...':'Criar pedido pendente'}</button></div>}</div></section></div>}
 </div>
}

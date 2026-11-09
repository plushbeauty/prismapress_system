/*
 * @REVISAO: PRISMAPRES-ERP-20261109-004
 * @DATA: 2026-11-09
 * @ALTERACOES: Quadro de ordens por etapa; ficha de processo; apontamento de operações; conclusão vinculada ao pedido.
 * @STATUS: APLICADO
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Factory, RefreshCw, ClipboardCheck, LoaderCircle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../contexts/SessionContext'
import type { OrdemServico, OsOperacao, Pedido } from '../../lib/types'
import './ProducaoPage.css'
const etapas=[{id:'pre',label:'Pré-impressão',color:'#8B5CF6'},{id:'impressao',label:'Impressão',color:'#1596A8'},{id:'acabamento',label:'Acabamento',color:'#D68B27'},{id:'expedicao',label:'Expedição',color:'#26945D'}]
export default function ProducaoPage(){
 const {empresa,perfil}=useSession()
 const [ops,setOps]=useState<OrdemServico[]>([])
 const [operacoes,setOperacoes]=useState<Record<string,OsOperacao[]>>({})
 const [pedidos,setPedidos]=useState<Pedido[]>([])
 const [aberta,setAberta]=useState<string|null>(null)
 const [loading,setLoading]=useState(true)
 const [saving,setSaving]=useState(false)
 const [erro,setErro]=useState<string|null>(null)
 const [sucesso,setSucesso]=useState<string|null>(null)
 const carregar=useCallback(async()=>{
  if(!supabase||!empresa?.id){setErro('Banco ou empresa não disponíveis.');setLoading(false);return}
  setLoading(true);setErro(null)
  const [o,p]=await Promise.all([supabase.from('gr_ordens_servico').select('*').eq('empresa_id',empresa.id).order('created_at',{ascending:false}),supabase.from('gr_pedidos').select('*').eq('empresa_id',empresa.id)])
  if(o.error){setErro(o.error.message);setOps([]);setLoading(false);return}
  if(p.error)setErro(p.error.message);else setPedidos((p.data??[]) as Pedido[])
  const lista=(o.data??[]) as OrdemServico[];setOps(lista)
  if(lista.length){const {data,error}=await supabase.from('gr_os_operacoes').select('*').eq('empresa_id',empresa.id).in('os_id',lista.map(x=>x.id)).order('sequencia');if(error)setErro(error.message);else{const grouped:Record<string,OsOperacao[]>={};for(const row of (data??[]) as OsOperacao[])(grouped[row.os_id]??=[]).push(row);setOperacoes(grouped)}}else setOperacoes({})
  setLoading(false)
 },[empresa?.id])
 useEffect(()=>{void carregar()},[carregar])
 const atual=ops.find(o=>o.id===aberta)??null
 const concluirOperacao=async(op:OsOperacao)=>{
  if(!supabase||!empresa?.id)return
  setSaving(true);const {error}=await supabase.from('gr_os_operacoes').update({status:'concluido',qtd_boa:op.qtd_boa,operador:perfil?.nome??op.operador,fim:new Date().toISOString()}).eq('id',op.id).eq('empresa_id',empresa.id)
  if(error)setErro(error.message);else await carregar();setSaving(false)
 }
 const concluirOS=async()=>{
  if(!supabase||!empresa?.id||!atual)return
  const steps=operacoes[atual.id]??[]
  if(steps.some(s=>s.status!=='concluido')){setErro('Conclua todas as etapas da ficha de processo antes de finalizar a OP.');return}
  setSaving(true);setErro(null)
  const {error}=await supabase.from('gr_ordens_servico').update({status:'concluido',etapa:'concluido',fim_real:new Date().toISOString(),quantidade_boa:atual.quantidade}).eq('id',atual.id).eq('empresa_id',empresa.id)
  if(error){setErro(error.message);setSaving(false);return}
  if(atual.pedido_id){const {error:pedidoError}=await supabase.from('gr_pedidos').update({status:'concluido'}).eq('id',atual.pedido_id).eq('empresa_id',empresa.id);if(pedidoError)setErro('OP concluída, mas o pedido não foi atualizado: '+pedidoError.message)}
  setSucesso('Ordem de produção concluída. O pedido vinculado foi atualizado.');await carregar();setSaving(false)
 }
 const grouped=useMemo(()=>Object.fromEntries(etapas.map(e=>[e.id,ops.filter(o=>o.etapa===e.id&&o.status!=='concluido')])),[ops])
 return <div className="pro-page"><div className="pro-heading"><div><span><Factory size={14}/> PRODUÇÃO · PCP GRÁFICO</span><h2>Ordens de produção</h2><p>Programação por etapa e ficha de processo de cada ordem.</p></div><button onClick={()=>void carregar()}><RefreshCw size={14}/> Atualizar</button></div>
 {erro&&<div className="pro-error" role="alert">{erro}</div>}{sucesso&&<div className="pro-success" role="status">{sucesso}</div>}
 {loading?<div className="pro-empty"><LoaderCircle size={20}/> Carregando ordens...</div>:<div className="pro-board">{etapas.map(e=><section className="pro-column" key={e.id}><header><i style={{background:e.color}}/>{e.label}<b>{grouped[e.id]?.length??0}</b></header>{(grouped[e.id]??[]).map(o=>{const pedido=pedidos.find(p=>p.id===o.pedido_id);return <button className="pro-ticket" key={o.id} onClick={()=>setAberta(o.id)}><b>{o.numero}</b><span>{o.descricao}</span><small>{pedido?.numero??'Ordem sem pedido'}</small><div><i style={{width:(operacoes[o.id]?.length?((operacoes[o.id].filter(x=>x.status==='concluido').length/operacoes[o.id].length)*100):0)+'%',background:e.color}}/></div><small>{operacoes[o.id]?.filter(x=>x.status==='concluido').length??0}/{operacoes[o.id]?.length??0} etapas concluídas</small></button>})}{!grouped[e.id]?.length&&<p className="pro-column-empty">Sem ordens nesta etapa</p>}</section>)}</div>}
 {atual&&<div className="pro-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setAberta(null)}}><section className="pro-modal" role="dialog" aria-modal="true"><header><div><small>FICHA DE PROCESSO</small><h3>{atual.numero} · {atual.descricao}</h3></div><button onClick={()=>setAberta(null)}>×</button></header><div className="pro-info"><span>Quantidade: <b>{atual.quantidade.toLocaleString('pt-BR')}</b></span><span>Cliente: <b>{atual.cliente_id??'—'}</b></span><span>Status: <b>{atual.status}</b></span></div><h4>Roteiro de produção</h4><div className="pro-steps">{(operacoes[atual.id]??[]).map(op=><article key={op.id}><div><b>{op.sequencia}. {op.posto}</b><span>{op.descricao}</span></div><span className={'pro-step-status '+op.status}>{op.status==='concluido'?'Concluída':op.status==='em_producao'?'Em produção':'Pendente'}</span>{op.status!=='concluido'&&<button disabled={saving||atual.status==='concluido'} onClick={()=>void concluirOperacao(op)}><Check size={13}/> Concluir etapa</button>}</article>)}</div><footer><button disabled={saving||atual.status==='concluido'} onClick={()=>void concluirOS()}><ClipboardCheck size={15}/> Finalizar OP</button></footer></section></div>}
 <div className="pro-revision">REV. PRISMAPRES-ERP-20261109-004 · FICHA DE PROCESSO E PCP</div></div>
}

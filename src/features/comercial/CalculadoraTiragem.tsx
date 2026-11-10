import { useMemo, useState } from 'react'
import { Calculator, Plus } from 'lucide-react'

type Input = {
  pecaLarguraMm:number; pecaAlturaMm:number; sangriaMm:number
  folhaLarguraMm:number; folhaAlturaMm:number; margemMm:number
  precoFolha:number; perdaAcertoFolhas:number; perdaPct:number
  acerto:number; precoChapa:number; numChapas:number
  impressaoMilheiro:number; acabamentoUnit:number; margemLucroPct:number
}
type Linha = { quantidade:number; pecasPorFolha:number; folhas:number; papel:number; fixo:number; impressao:number; acabamento:number; custo:number; total:number; unitario:number }
type Props = { onApply:(item:{descricao:string;quantidade:number;preco_unitario:number;custo_total:number;custo_input:Record<string,unknown>})=>void }
const money=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0)
const initial:Input={pecaLarguraMm:90,pecaAlturaMm:50,sangriaMm:3,folhaLarguraMm:330,folhaAlturaMm:480,margemMm:10,precoFolha:.8,perdaAcertoFolhas:50,perdaPct:3,acerto:60,precoChapa:35,numChapas:4,impressaoMilheiro:80,acabamentoUnit:0,margemLucroPct:40}
const parseList=(value:string)=>[...new Set(value.split(/[;,\s]+/).map(v=>Number.parseInt(v,10)).filter(v=>Number.isInteger(v)&&v>0))]

export default function CalculadoraTiragem({onApply}:Props){
 const [v,setV]=useState(initial)
 const [tiragens,setTiragens]=useState('500, 1000, 2000')
 const [produto,setProduto]=useState('Cartão de visita 4x4')
 const [erro,setErro]=useState('')
 const set=(key:keyof Input,value:string)=>setV(old=>({...old,[key]:Number(value.replace(',','.'))||0}))
 const ppf=useMemo(()=>{
  const w=v.pecaLarguraMm+2*v.sangriaMm,h=v.pecaAlturaMm+2*v.sangriaMm
  const aw=v.folhaLarguraMm-2*v.margemMm,ah=v.folhaAlturaMm-2*v.margemMm
  if(w<=0||h<=0||aw<=0||ah<=0)return 0
  return Math.max(Math.floor(aw/w)*Math.floor(ah/h),Math.floor(aw/h)*Math.floor(ah/w))
 },[v])
 const linhas=useMemo(()=>{
  if(!ppf||v.perdaPct<0||v.perdaPct>=100)return []
  return parseList(tiragens).map(quantidade=>{
   const folhas=Math.ceil(quantidade/ppf/(1-v.perdaPct/100))+Math.max(0,Math.ceil(v.perdaAcertoFolhas))
   const papel=folhas*Math.max(0,v.precoFolha)
   const fixo=Math.max(0,v.acerto)+Math.max(0,v.precoChapa)*Math.max(0,Math.ceil(v.numChapas))
   const impressao=Math.ceil(folhas/1000)*Math.max(0,v.impressaoMilheiro)
   const acabamento=quantidade*Math.max(0,v.acabamentoUnit)
   const custo=papel+fixo+impressao+acabamento
   const margem=Math.min(95,Math.max(0,v.margemLucroPct))/100
   const total=margem>=1?custo:custo/(1-margem)
   return {quantidade,pecasPorFolha:ppf,folhas,papel,fixo,impressao,acabamento,custo,total,unitario:total/quantidade}
  })
 },[v,ppf,tiragens])
 const campos:{key:keyof Input;label:string;unit:string}[]=[
  {key:'pecaLarguraMm',label:'Largura da peça',unit:'mm'},{key:'pecaAlturaMm',label:'Altura da peça',unit:'mm'},{key:'sangriaMm',label:'Sangria',unit:'mm'},
  {key:'folhaLarguraMm',label:'Largura da folha',unit:'mm'},{key:'folhaAlturaMm',label:'Altura da folha',unit:'mm'},{key:'margemMm',label:'Margem máquina',unit:'mm'},
  {key:'precoFolha',label:'Preço por folha',unit:'R$'},{key:'perdaAcertoFolhas',label:'Folhas de acerto',unit:'un.'},{key:'perdaPct',label:'Perda na tiragem',unit:'%'},
  {key:'acerto',label:'Acerto da máquina',unit:'R$'},{key:'precoChapa',label:'Preço por chapa',unit:'R$'},{key:'numChapas',label:'Número de chapas',unit:'un.'},
  {key:'impressaoMilheiro',label:'Impressão por mil folhas',unit:'R$'},{key:'acabamentoUnit',label:'Acabamento por peça',unit:'R$'},{key:'margemLucroPct',label:'Margem de lucro',unit:'%'},
 ]
 return <section className="orc-calc">
  <div className="orc-calc-heading"><div><span><Calculator size={14}/> FORMAÇÃO DE PREÇO GRÁFICO</span><h3>Calculadora de tiragem e aproveitamento</h3><p>Compare tiragens com papel, acerto, chapas, impressão, acabamento e margem.</p></div><b>{ppf} peças / folha</b></div>
  <div className="orc-calc-product"><label>Produto / serviço<input value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex.: Cartão de visita 4x4"/></label><label>Tiragens para comparar<input value={tiragens} onChange={e=>setTiragens(e.target.value)} placeholder="500, 1000, 2000"/></label></div>
  <div className="orc-calc-grid">{campos.map(c=><label key={c.key}>{c.label}<span><input type="number" min="0" step="any" value={v[c.key]} onChange={e=>set(c.key,e.target.value)}/><small>{c.unit}</small></span></label>)}</div>
  {!ppf&&<p className="orc-error">A peça não cabe na folha com as medidas informadas.</p>}
  {v.perdaPct>=100&&<p className="orc-error">A perda percentual deve ser menor que 100%.</p>}
  {erro&&<p className="orc-error">{erro}</p>}
  <div className="orc-calc-results">{linhas.map(line=><article key={line.quantidade}><div><b>{line.quantidade.toLocaleString('pt-BR')} un.</b><strong>{money(line.total)}</strong></div><small>{money(line.unitario)} / peça · {line.folhas.toLocaleString('pt-BR')} folhas</small><dl><dt>Papel</dt><dd>{money(line.papel)}</dd><dt>Acerto + chapas</dt><dd>{money(line.fixo)}</dd><dt>Impressão</dt><dd>{money(line.impressao)}</dd><dt>Acabamento</dt><dd>{money(line.acabamento)}</dd><dt>Custo estimado</dt><dd>{money(line.custo)}</dd></dl><button disabled={!produto.trim()||!ppf} onClick={()=>{setErro('');onApply({descricao:produto.trim(),quantidade:line.quantidade,preco_unitario:line.unitario,custo_total:line.custo,custo_input:{...v,pecasPorFolha:line.pecasPorFolha,folhas:line.folhas,papel:line.papel,fixo:line.fixo,impressao:line.impressao,acabamento:line.acabamento,margemAplicadaPct:v.margemLucroPct}})}}><Plus size={13}/> Usar no orçamento</button></article>)}</div>
 </section>
}

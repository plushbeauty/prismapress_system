import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, Building2, RefreshCw, LogOut, LockKeyhole } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

type EmpresaRow = { id: string; nome: string; cnpj: string | null; ativo: boolean; created_at: string }

export default function MasterDashboard({ nome, onSignOut }: { nome: string; onSignOut: () => void }) {
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!supabase) { setError('Supabase do PRISMAPRES não configurado.'); setLoading(false); return }
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase
      .from('gr_empresas')
      .select('id,nome,cnpj,ativo,created_at')
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setEmpresas((data ?? []) as EmpresaRow[])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  return <main className="master-console">
    <header className="master-console-header">
      <div className="master-brand"><ShieldCheck size={25}/> PRISMAPRES <span>MASTER</span></div>
      <button type="button" onClick={onSignOut}><LogOut size={16}/> Sair</button>
    </header>
    <section className="master-welcome">
      <span>AMBIENTE DO PROPRIETÁRIO</span>
      <h1>Painel de administração MASTER</h1>
      <p>Bem-vindo, {nome}. Este acesso é universal e não está vinculado a uma empresa.</p>
      <div className="master-security"><LockKeyhole size={17}/> Identidade validada pelo Supabase Auth e perfil MASTER no banco.</div>
    </section>
    <section className="master-card">
      <div className="master-card-heading">
        <div><Building2 size={20}/><div><h2>Empresas cadastradas</h2><p>Visão geral das empresas vinculadas ao PRISMAPRES.</p></div></div>
        <button type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Atualizar</button>
      </div>
      {loading ? <p className="master-empty">Carregando empresas...</p> : error ? <p className="master-error">{error}</p> : empresas.length === 0 ? <p className="master-empty">Nenhuma empresa cadastrada ainda. O ambiente MASTER está ativo e pronto para administrar os próximos cadastros.</p> : <div className="master-table-wrap"><table><thead><tr><th>Empresa</th><th>CNPJ</th><th>Status</th></tr></thead><tbody>{empresas.map(item => <tr key={item.id}><td>{item.nome}</td><td>{item.cnpj || '—'}</td><td>{item.ativo ? 'Ativa' : 'Inativa'}</td></tr>)}</tbody></table></div>}
      <small className="master-count">{empresas.length} empresa(s) encontrada(s)</small>
    </section>
  </main>
}

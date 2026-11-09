import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'
import type { Empresa, Perfil } from '../lib/types'

type SessionState = {
  loading: boolean
  session: Session | null
  perfil: Perfil | null
  empresa: Empresa | null
  dbReady: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  reload: () => Promise<void>
}

const Ctx = createContext<SessionState | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [dbReady, setDbReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const limparPerfil = useCallback(() => {
    setPerfil(null)
    setEmpresa(null)
    setDbReady(false)
  }, [])

  const carregarPerfil = useCallback(async (currentSession: Session | null) => {
    const currentRequest = ++requestId.current
    if (!currentSession || !supabase) {
      limparPerfil()
      setError(null)
      return
    }

    const { data, error: queryError } = await supabase
      .from('gr_usuarios')
      .select('id, empresa_id, nome, email, papel, ativo, gr_empresas(id, nome, cnpj, cidade, uf)')
      .eq('id', currentSession.user.id)
      .maybeSingle()

    if (currentRequest !== requestId.current) return

    if (queryError) {
      setError(
        queryError.code === '42P01' || queryError.code === 'PGRST205'
          ? 'As tabelas do PRISMAPRES ainda não existem neste Supabase. Aplique as migrations e o bootstrap.'
          : queryError.message,
      )
      limparPerfil()
      return
    }

    if (!data) {
      setError('Usuário autenticado sem perfil em gr_usuarios. Crie o vínculo correspondente no bootstrap do banco.')
      limparPerfil()
      return
    }

    if (!data.ativo) {
      setError('Este usuário está desativado. Entre em contato com o administrador da empresa.')
      limparPerfil()
      await supabase.auth.signOut()
      return
    }

    setPerfil({
      id: data.id,
      empresa_id: data.empresa_id,
      nome: data.nome,
      email: data.email,
      papel: data.papel,
      ativo: data.ativo,
    })
    const relatedEmpresa = (data as unknown as { gr_empresas: Empresa | Empresa[] | null }).gr_empresas
    setEmpresa(Array.isArray(relatedEmpresa) ? relatedEmpresa[0] ?? null : relatedEmpresa)
    setError(null)
    setDbReady(true)
  }, [limparPerfil])

  const reload = useCallback(async () => {
    if (!supabase) {
      setSession(null)
      limparPerfil()
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) setError(sessionError.message)
    setSession(data.session)
    await carregarPerfil(data.session)
    setLoading(false)
  }, [carregarPerfil, limparPerfil])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(true)
      // Evita executar outra chamada Supabase dentro do callback que mantém o lock de Auth.
      window.setTimeout(() => {
        if (active) void carregarPerfil(nextSession).finally(() => {
          if (active) setLoading(false)
        })
      }, 0)
    })

    void reload()
    return () => {
      active = false
      requestId.current += 1
      listener.subscription.unsubscribe()
    }
  }, [carregarPerfil, reload])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local.' }
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: authError?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
    }
    requestId.current += 1
    setSession(null)
    limparPerfil()
    setError(null)
  }, [limparPerfil])

  const value = useMemo<SessionState>(() => ({
    loading,
    session,
    perfil,
    empresa,
    dbReady,
    error: supabaseConfigured
      ? error
      : 'Supabase não configurado. Copie .env.example para .env.local e preencha as chaves do projeto PRISMAPRES.',
    signIn,
    signOut,
    reload,
  }), [loading, session, perfil, empresa, dbReady, error, signIn, signOut, reload])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession() {
  const context = useContext(Ctx)
  if (!context) throw new Error('useSession precisa estar dentro de <SessionProvider>')
  return context
}

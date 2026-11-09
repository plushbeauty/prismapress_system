import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import { useSession } from '../contexts/SessionContext'

type Options = {
  select?: string
  order?: { column: string; ascending?: boolean }
  filters?: Record<string, string | number | boolean | null>
  enabled?: boolean
  limit?: number
}

type MutationResult = { error: string | null }

function mensagemErro(code?: string, message?: string) {
  if (code === '42P01' || code === 'PGRST205') {
    return 'Tabela do PRISMAPRES ainda não existe neste banco. Aplique as migrations.'
  }
  return message ?? 'Não foi possível concluir a operação.'
}

/**
 * Leitura e gravação no Supabase isoladas pela empresa da sessão.
 * A segurança definitiva também depende das políticas RLS no banco.
 */
export function useCollection<T extends { id: string }>(table: string, options: Options = {}) {
  const { perfil, dbReady } = useSession()
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const enabled = options.enabled !== false
  const filtersKey = JSON.stringify(options.filters ?? {})
  const empresaId = perfil?.empresa_id ?? null

  const load = useCallback(async () => {
    const request = ++requestId.current

    if (!supabase || !dbReady || !empresaId || !enabled) {
      setRows([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from(table)
        .select(options.select ?? '*')
        .eq('empresa_id', empresaId)

      const filters = JSON.parse(filtersKey) as Record<string, string | number | boolean | null>
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== '') {
          query = query.eq(key, value)
        }
      }

      if (options.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        })
      }
      if (options.limit && options.limit > 0) query = query.limit(options.limit)

      const { data, error: queryError } = await query
      if (request !== requestId.current) return

      if (queryError) {
        setError(mensagemErro(queryError.code, queryError.message))
        setRows([])
      } else {
        setError(null)
        setRows((data ?? []) as unknown as T[])
      }
    } catch (cause) {
      if (request !== requestId.current) return
      setRows([])
      setError(cause instanceof Error ? cause.message : 'Erro inesperado ao consultar o banco.')
    } finally {
      if (request === requestId.current) setLoading(false)
    }
  }, [
    table,
    options.select,
    options.order?.column,
    options.order?.ascending,
    options.limit,
    enabled,
    dbReady,
    empresaId,
    filtersKey,
  ])

  useEffect(() => {
    void load()
    return () => {
      requestId.current += 1
    }
  }, [load])

  const insert = useCallback(async (
    payload: Record<string, unknown> | Record<string, unknown>[],
  ): Promise<MutationResult> => {
    if (!supabase) return { error: 'Supabase não configurado.' }
    if (!dbReady || !empresaId) return { error: 'Sessão sem empresa vinculada.' }

    const items = Array.isArray(payload) ? payload : [payload]
    const withTenant = items.map((row) => ({ ...row, empresa_id: empresaId }))
    const { error: mutationError } = await supabase.from(table).insert(withTenant as never)

    if (mutationError) return { error: mensagemErro(mutationError.code, mutationError.message) }
    await load()
    return { error: null }
  }, [table, empresaId, dbReady, load])

  const update = useCallback(async (
    id: string,
    patch: Record<string, unknown>,
  ): Promise<MutationResult> => {
    if (!supabase) return { error: 'Supabase não configurado.' }
    if (!dbReady || !empresaId) return { error: 'Sessão sem empresa vinculada.' }

    // Impede alterar o tenant pelo payload e limita a operação à empresa da sessão.
    const { empresa_id: _ignoredTenant, ...safePatch } = patch
    const { error: mutationError } = await supabase
      .from(table)
      .update(safePatch as never)
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (mutationError) return { error: mensagemErro(mutationError.code, mutationError.message) }
    await load()
    return { error: null }
  }, [table, empresaId, dbReady, load])

  const remove = useCallback(async (id: string): Promise<MutationResult> => {
    if (!supabase) return { error: 'Supabase não configurado.' }
    if (!dbReady || !empresaId) return { error: 'Sessão sem empresa vinculada.' }

    const { error: mutationError } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId)

    if (mutationError) return { error: mensagemErro(mutationError.code, mutationError.message) }
    await load()
    return { error: null }
  }, [table, empresaId, dbReady, load])

  return { rows, loading, error, reload: load, insert, update, remove }
}

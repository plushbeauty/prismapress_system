export type Empresa = {
  id: string
  nome: string
  cnpj: string | null
  cidade: string | null
  uf: string | null
}

export type Perfil = {
  id: string
  empresa_id: string | null
  nome: string
  email: string
  papel: string
  ativo: boolean
}

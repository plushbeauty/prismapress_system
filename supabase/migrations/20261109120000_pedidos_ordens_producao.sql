-- PRISMAPRES · Pedidos e roteiro de produção
-- Revisão PRISMAPRES-ERP-20261109-004
-- Pré-requisito: bootstrap principal com gr_empresas, gr_usuarios, gr_clientes e gr_pedidos.
alter table public.gr_pedidos
  add column if not exists descricao text,
  add column if not exists quantidade numeric(14,3) not null default 1,
  add column if not exists referencia text,
  add column if not exists origem text not null default 'manual',
  add column if not exists setor text not null default 'pre';

create table if not exists public.gr_ordens_servico (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.gr_empresas(id) on delete cascade,
  numero text not null,
  pedido_id uuid references public.gr_pedidos(id) on delete set null,
  cliente_id uuid references public.gr_clientes(id) on delete set null,
  descricao text not null,
  etapa text not null default 'pre',
  maquina_id uuid,
  quantidade numeric(14,3) not null default 1 check (quantidade > 0),
  quantidade_boa numeric(14,3) not null default 0,
  refugo numeric(14,3) not null default 0,
  status text not null default 'aberto' check (status in ('aberto','em_producao','concluido','cancelado')),
  inicio_previsto date,
  fim_previsto date,
  inicio_real timestamptz,
  fim_real timestamptz,
  operador text,
  created_at timestamptz not null default now(),
  unique (empresa_id, numero)
);

create table if not exists public.gr_os_operacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.gr_empresas(id) on delete cascade,
  os_id uuid not null references public.gr_ordens_servico(id) on delete cascade,
  sequencia integer not null,
  posto text not null,
  descricao text not null,
  maquina_id uuid,
  status text not null default 'pendente' check (status in ('pendente','em_producao','concluido')),
  qtd_boa numeric(14,3) not null default 0,
  qtd_refugo numeric(14,3) not null default 0,
  operador text,
  inicio timestamptz,
  fim timestamptz,
  observacoes text,
  unique (os_id, sequencia)
);

create index if not exists gr_pedidos_empresa_status_idx on public.gr_pedidos(empresa_id,status);
create index if not exists gr_ordens_servico_empresa_etapa_idx on public.gr_ordens_servico(empresa_id,etapa,status);
create index if not exists gr_os_operacoes_empresa_os_idx on public.gr_os_operacoes(empresa_id,os_id,sequencia);

alter table public.gr_ordens_servico enable row level security;
alter table public.gr_os_operacoes enable row level security;

drop policy if exists "prismapres_empresa_ordens_select" on public.gr_ordens_servico;
create policy "prismapres_empresa_ordens_select" on public.gr_ordens_servico for select to authenticated
using (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_ordens_servico.empresa_id and u.ativo=true));
drop policy if exists "prismapres_empresa_ordens_insert" on public.gr_ordens_servico;
create policy "prismapres_empresa_ordens_insert" on public.gr_ordens_servico for insert to authenticated
with check (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_ordens_servico.empresa_id and u.ativo=true));
drop policy if exists "prismapres_empresa_ordens_update" on public.gr_ordens_servico;
create policy "prismapres_empresa_ordens_update" on public.gr_ordens_servico for update to authenticated
using (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_ordens_servico.empresa_id and u.ativo=true))
with check (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_ordens_servico.empresa_id and u.ativo=true));

drop policy if exists "prismapres_empresa_operacoes_select" on public.gr_os_operacoes;
create policy "prismapres_empresa_operacoes_select" on public.gr_os_operacoes for select to authenticated
using (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_os_operacoes.empresa_id and u.ativo=true));
drop policy if exists "prismapres_empresa_operacoes_insert" on public.gr_os_operacoes;
create policy "prismapres_empresa_operacoes_insert" on public.gr_os_operacoes for insert to authenticated
with check (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_os_operacoes.empresa_id and u.ativo=true));
drop policy if exists "prismapres_empresa_operacoes_update" on public.gr_os_operacoes;
create policy "prismapres_empresa_operacoes_update" on public.gr_os_operacoes for update to authenticated
using (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_os_operacoes.empresa_id and u.ativo=true))
with check (exists (select 1 from public.gr_usuarios u where u.id=auth.uid() and u.empresa_id=gr_os_operacoes.empresa_id and u.ativo=true));

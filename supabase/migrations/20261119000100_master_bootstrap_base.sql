-- PRISMAPRES: base de identidade e bootstrap inicial do proprietário MASTER.
create extension if not exists pgcrypto;

create table if not exists public.gr_empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  cidade text,
  uf text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gr_usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid null references public.gr_empresas(id) on delete restrict,
  nome text not null,
  email text not null,
  papel text not null check (papel in ('master','admin','comercial','producao','financeiro','operador')),
  ativo boolean not null default true,
  is_master boolean not null default false,
  nivel_admin integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gr_master_sem_empresa check (not is_master or (empresa_id is null and papel = 'master' and nivel_admin >= 100))
);

create unique index if not exists gr_usuarios_um_master
  on public.gr_usuarios ((is_master))
  where is_master = true;

create index if not exists gr_usuarios_empresa_idx on public.gr_usuarios(empresa_id);
create index if not exists gr_usuarios_email_idx on public.gr_usuarios(lower(email));

alter table public.gr_empresas enable row level security;
alter table public.gr_usuarios enable row level security;

drop policy if exists gr_usuarios_select_self_or_master on public.gr_usuarios;
create policy gr_usuarios_select_self_or_master on public.gr_usuarios
for select to authenticated
using (
  id = (select auth.uid())
);

drop policy if exists gr_empresas_select_tenant_or_master on public.gr_empresas;
create policy gr_empresas_select_tenant_or_master on public.gr_empresas
for select to authenticated
using (
  exists (
    select 1 from public.gr_usuarios me
    where me.id = (select auth.uid()) and me.ativo = true
      and (me.is_master = true or me.empresa_id = gr_empresas.id)
  )
);

revoke all on public.gr_usuarios from anon;
revoke all on public.gr_empresas from anon;
grant select on public.gr_usuarios to authenticated;
grant select on public.gr_empresas to authenticated;

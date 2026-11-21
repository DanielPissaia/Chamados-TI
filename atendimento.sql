-- Função de atendimento do Chamados TI, selecionada para leitura técnica.
-- Depende do esquema, dos tipos, de private.is_admin(), da RLS e dos gatilhos
-- existentes na aplicação. Este arquivo não é um instalador do banco completo.
-- Concluído usa o código resolved para preservar a compatibilidade do histórico.

create or replace function public.update_ticket_as_admin(
  p_ticket_id bigint,
  p_expected_updated_at timestamptz,
  p_changes jsonb
)
returns setof public.tickets
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_rows integer;
  assigned_user_id uuid;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception using
      errcode = '42501', message = 'Acesso exclusivo da TI ativa.';
  end if;

  if p_ticket_id is null or p_ticket_id <= 0
    or p_expected_updated_at is null
    or p_changes is null
    or jsonb_typeof(p_changes) <> 'object'
  then
    raise exception using
      errcode = '22023', message = 'Parâmetros de atualização inválidos.';
  end if;

  if p_changes = '{}'::jsonb or exists (
    select 1 from jsonb_object_keys(p_changes) as fields(name)
    where fields.name not in ('assigned_to_id', 'status', 'priority', 'solution')
  ) then
    raise exception using
      errcode = '22023', message = 'Campos de atualização não permitidos.';
  end if;

  if exists (
    select 1 from jsonb_each(p_changes) as fields(name, value)
    where (fields.name in ('status', 'priority')
      and jsonb_typeof(fields.value) <> 'string')
      or (fields.name in ('assigned_to_id', 'solution')
      and jsonb_typeof(fields.value) not in ('string', 'null'))
  ) then
    raise exception using
      errcode = '22023', message = 'Tipos de atualização inválidos.';
  end if;

  if p_changes ? 'solution'
    and char_length(p_changes ->> 'solution') > 3000
  then
    raise exception using
      errcode = '22023', message = 'A solução deve ter até 3000 caracteres.';
  end if;

  -- Só os três status atuais podem ser escolhidos pelo atendimento.
  if p_changes ? 'status'
    and p_changes ->> 'status' not in ('open', 'in_progress', 'resolved')
  then
    raise exception using
      errcode = '22023', message = 'Use Aberto, Em atendimento ou Concluído.';
  end if;

  if p_changes ? 'assigned_to_id'
    and p_changes ->> 'assigned_to_id' is not null
  then
    assigned_user_id := (p_changes ->> 'assigned_to_id')::uuid;
    if not exists (
      select 1 from public.profiles
      where id = assigned_user_id
        and role = 'admin'::public.user_role
        and active = true
    ) then
      raise exception using
        errcode = '22023', message = 'O responsável deve ser um usuário ativo da TI.';
    end if;
  end if;

  return query
  update public.tickets as ticket
  set assigned_to_id = case
        -- A identidade vem da sessão autenticada, não de um nome do navegador.
        when p_changes ->> 'status' = 'in_progress' then auth.uid()
        -- Permite concluir diretamente, sem um botão separado de assumir.
        when p_changes ->> 'status' = 'resolved' and ticket.assigned_to_id is null
          then auth.uid()
        when p_changes ? 'assigned_to_id'
        then (p_changes ->> 'assigned_to_id')::uuid else ticket.assigned_to_id end,
      status = case when p_changes ? 'status'
        then (p_changes ->> 'status')::public.ticket_status else ticket.status end,
      priority = case when p_changes ? 'priority'
        then (p_changes ->> 'priority')::public.ticket_priority else ticket.priority end,
      solution = case when p_changes ? 'solution'
        then nullif(btrim(p_changes ->> 'solution'), '') else ticket.solution end
  where ticket.id = p_ticket_id
    and ticket.updated_at = p_expected_updated_at
  returning ticket.*;

  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception using
      errcode = '40001',
      message = 'TICKET_CONFLICT: reabra o chamado antes de salvar novamente.';
  end if;
end;
$$;

revoke all on function public.update_ticket_as_admin(bigint, timestamptz, jsonb)
from public, anon, authenticated;
grant execute on function public.update_ticket_as_admin(bigint, timestamptz, jsonb)
to authenticated;

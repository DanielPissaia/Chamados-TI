/*
 * Recorte adaptado do fluxo do Chamados TI para leitura técnica.
 * Recebe um cliente Supabase já configurado pela aplicação.
 * A interface, os anexos, o Realtime e as notificações foram omitidos.
 * O esquema, as funções RPC e as políticas RLS pertencem à aplicação completa.
 */

const TICKET_COLUMNS =
  'id,requester_id,assigned_to_id,title,description,department,category,' +
  'priority,status,solution,created_at,updated_at,resolved_at,closed_at';

const PRIORITY_TO_DB = {
  low: 'low', medium: 'normal', high: 'high', critical: 'urgent',
};
const ATTENDANCE_STATUSES = ['open', 'in_progress', 'resolved'];

export function createTicketService(supabaseClient) {
  async function getProfile(authUser) {
    if (!authUser) throw new Error('AUTH_REQUIRED');

    const { data, error } = await supabaseClient.from('profiles')
      .select('id,full_name,department,role,active')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('PROFILE_NOT_FOUND');
    if (data.active !== true) throw new Error('USER_INACTIVE');
    if (!['requester', 'admin'].includes(data.role)) {
      throw new Error('INVALID_PROFILE_ROLE');
    }
    return data;
  }

  async function currentProfile() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return getProfile(data.user);
  }

  async function login(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error) throw error;
      return await getProfile(data.user);
    } catch (loginError) {
      // A limpeza desta tentativa não deve revogar a sessão de outro PC.
      try {
        await supabaseClient.auth.signOut({ scope: 'local' });
      } catch {
        // Preserva o erro original do login.
      }
      throw loginError;
    }
  }

  async function logout() {
    const { error } = await supabaseClient.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }

  async function listTickets() {
    const profile = await currentProfile();
    const rows = [];
    const pageSize = 200;

    for (let start = 0; ; start += pageSize) {
      let query = supabaseClient.from('tickets').select(TICKET_COLUMNS);
      if (profile.role === 'requester') {
        query = query.eq('requester_id', profile.id);
      }

      // O filtro organiza a consulta. A autorização efetiva depende da RLS.
      const { data, error } = await query
        .order('id', { ascending: true })
        .range(start, start + pageSize - 1);

      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('INVALID_QUERY_RESULT');
      rows.push(...data);
      if (data.length < pageSize) return rows;
    }
  }

  async function createTicket(input) {
    const profile = await currentProfile();
    if (profile.role !== 'requester') throw new Error('REQUESTER_REQUIRED');

    const title = input.title.trim();
    const description = input.description.trim();
    const { department, category } = input;
    const priority = Object.hasOwn(PRIORITY_TO_DB, input.priority)
      ? PRIORITY_TO_DB[input.priority] : null;

    if (!title || !description || !department || !category || !priority) {
      throw new Error('REQUIRED_TICKET_FIELDS');
    }
    if (description.length > 2000) throw new Error('DESCRIPTION_TOO_LONG');

    // O solicitante vem da sessão, e não de um identificador do formulário.
    // Este recorte mostra somente os campos básicos da abertura.
    const { data, error } = await supabaseClient.from('tickets').insert({
      requester_id: profile.id, title, description, department, category, priority,
    }).select(TICKET_COLUMNS).single();

    if (error) throw error;
    if (!data) throw new Error('INVALID_CREATE_RESULT');
    return data;
  }

  async function replyToTicket(ticketId, message, requestId) {
    const profile = await currentProfile();
    const text = message.trim();
    if (!text || text.length > 2000) throw new Error('INVALID_REPLY');
    if (!requestId) throw new Error('REQUEST_ID_REQUIRED');

    // A interface cria um UUID por mensagem e o reutiliza se o envio ficar incerto.
    // A deduplicação é responsabilidade da função send_ticket_reply no banco.
    const { data, error } = await supabaseClient.rpc('send_ticket_reply', {
      p_ticket_id: ticketId, p_request_id: requestId, p_message: text,
    }).single();

    if (error) throw error;
    if (!data || String(data.ticket_id) !== String(ticketId) ||
        data.author_id !== profile.id || data.message !== text) {
      throw new Error('INVALID_REPLY_RESULT');
    }
    return data;
  }

  async function updateAttendance(ticket, { status, priority, solution }) {
    const profile = await currentProfile();
    if (profile.role !== 'admin') throw new Error('ADMIN_REQUIRED');
    if (!ATTENDANCE_STATUSES.includes(status) || !Object.hasOwn(PRIORITY_TO_DB, priority)) {
      throw new Error('INVALID_ATTENDANCE_FIELDS');
    }

    const text = solution.trim();
    if (text.length > 3000) throw new Error('SOLUTION_TOO_LONG');
    if (status === 'resolved' && !text) throw new Error('SOLUTION_REQUIRED');

    const { data, error } = await supabaseClient.rpc('update_ticket_as_admin', {
      p_ticket_id: ticket.id,
      // Mantém a precisão do timestamp recebido do PostgreSQL.
      p_expected_updated_at: ticket.updated_at,
      p_changes: { status, priority: PRIORITY_TO_DB[priority], solution: text || null },
    }).single();

    if (error?.code === '40001') {
      // Não sobrescreve nem tenta novamente sem consultar a versão atual.
      throw new Error('Consulte o chamado novamente antes de salvar.', { cause: error });
    }
    if (error) throw error;
    if (!data || String(data.id) !== String(ticket.id)) {
      throw new Error('INVALID_UPDATE_RESULT');
    }
    return data;
  }

  return { login, logout, listTickets, createTicket, replyToTicket, updateAttendance };
}

# Chamados Sopal

Sistema interno de chamados para centralizar solicitações de suporte de TI da Sopal.

O projeto possui interfaces separadas para funcionários solicitantes e para o administrador da TI. A aplicação é desenvolvida em HTML, CSS e JavaScript, utiliza o Supabase para autenticação e terá os chamados, mensagens e anexos armazenados no Supabase.

> **Situação atual:** a autenticação real pelo Supabase já está funcionando para o administrador. Os chamados exibidos na interface ainda são dados locais de teste e serão migrados para o banco antes da publicação em produção.

## Objetivo

- Centralizar os pedidos de suporte da empresa.
- Permitir que cada funcionário acompanhe somente os próprios chamados.
- Oferecer à TI uma visão geral de todos os atendimentos.
- Manter histórico de mensagens, alterações e soluções.
- Permitir o envio seguro de imagens e outros anexos.
- Disponibilizar o sistema somente na rede interna da empresa.

## Perfis de acesso

### Solicitante

- Abrir um novo chamado.
- Informar título, descrição, setor, categoria e prioridade.
- Anexar imagens ou arquivos.
- Consultar somente os próprios chamados.
- Responder mensagens da TI.
- Visualizar a solução registrada.
- Confirmar a resolução ou informar que o problema continua.
- Consultar o histórico de chamados concluídos.

### Administrador da TI

- Visualizar todos os chamados.
- Pesquisar e filtrar atendimentos.
- Assumir um chamado.
- Alterar status e prioridade.
- Responder ao solicitante.
- Registrar a solução aplicada.
- Marcar o chamado como resolvido.
- Consultar chamados encerrados.

## Status dos chamados

- Aberto.
- Em análise.
- Em atendimento.
- Aguardando solicitante.
- Resolvido.
- Fechado.
- Cancelado.

## Tecnologias

- HTML5.
- CSS3.
- JavaScript.
- Supabase Auth.
- Supabase Database (PostgreSQL).
- Supabase Storage.
- Row Level Security (RLS).
- Nginx para a hospedagem interna.
- Ubuntu Server LTS na VM de produção.

## Estrutura do projeto

```text
chamados-sopal/
├── index.html   # Estrutura das telas e formulários
├── style.css    # Estilos, layout e responsividade
├── script.js    # Login, navegação e regras do sistema
└── README.md    # Documentação do projeto
```

## Arquitetura prevista

```text
Computador do funcionário
        │
        ├── HTTPS interno ──> VM Ubuntu + Nginx
        │                         └── HTML, CSS e JavaScript
        │
        └── HTTPS ──────────> Supabase
                                  ├── Login e sessões
                                  ├── Banco de dados
                                  └── Anexos privados
```

A VM será responsável apenas por disponibilizar o front-end na rede interna. O banco de dados, a autenticação e os anexos permanecerão no Supabase.

## Recursos configurados no Supabase

As seguintes consultas foram criadas e executadas no SQL Editor:

1. `01 - Create database structure`
2. `02 - Create security policies`
3. `03 - Configure initial admin`
4. `04 - Configure requester`
5. `05 - Configure attachment storage`

Principais recursos criados:

- Tabela `profiles`.
- Tabela `tickets`.
- Tabela `ticket_messages`.
- Tabela `ticket_attachments`.
- Bucket privado `ticket-attachments`.
- Políticas de segurança RLS.
- Perfil administrador.
- Perfil solicitante para testes.

## Configuração do Supabase no front-end

O `index.html` precisa carregar a biblioteca do Supabase antes do arquivo `script.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="script.js"></script>
```

No início do `script.js`, configure somente a URL e a chave pública do projeto:

```js
const SUPABASE_URL = "URL_DO_PROJETO";
const SUPABASE_PUBLISHABLE_KEY = "CHAVE_PUBLICA_DO_PROJETO";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
```

> A chave `publishable` pode ser usada no navegador porque as permissões são controladas pelas políticas RLS. Nunca coloque uma `secret key` ou uma chave `service_role` no HTML ou no JavaScript.

## Executando localmente

1. Abra a pasta do projeto no Visual Studio Code.
2. Confirme que `index.html`, `style.css` e `script.js` estão na mesma pasta.
3. Instale a extensão **Live Server**, caso ainda não esteja instalada.
4. Clique com o botão direito em `index.html`.
5. Selecione **Open with Live Server**.
6. Acesse o endereço exibido pelo Live Server, normalmente:

```text
http://127.0.0.1:5500
```

As credenciais devem existir no **Supabase Auth**. Não existem usuários ou senhas fixos no código da versão atual.

## Fluxo de autenticação

1. O usuário informa e-mail e senha.
2. O Supabase Auth valida as credenciais.
3. O sistema consulta o perfil correspondente na tabela `profiles`.
4. O campo `role` determina qual painel será exibido:
   - `admin`: Painel da TI.
   - `requester`: Portal do funcionário.
5. O nome, o setor e as permissões são carregados a partir do perfil.

## Configuração prevista da VM

- Ubuntu Server LTS 64 bits.
- 2 vCPUs.
- 2 GB de memória RAM.
- 30 GB de armazenamento.
- IP fixo e registro no DNS interno.
- Nginx.
- HTTPS pela porta 443 somente na rede interna.
- Sem publicação ou acesso de entrada pela internet.
- Acesso administrativo conforme o padrão já utilizado nos servidores da empresa.

Os computadores dos usuários precisarão de saída HTTPS para acessar o projeto no Supabase.

## Segurança

- O sistema não deve conter senhas fixas no JavaScript.
- Somente a chave pública do Supabase pode estar no front-end.
- As tabelas utilizam Row Level Security.
- O solicitante deve acessar somente os próprios chamados.
- O administrador pode acessar os chamados necessários para o atendimento.
- O bucket de anexos é privado.
- A VM não será publicada na internet.
- O acesso administrativo seguirá as regras da infraestrutura da empresa.

## Estado atual

| Recurso | Situação |
|---|---|
| Interface de login | Concluída |
| Painel do solicitante | Interface concluída |
| Painel da TI | Interface concluída |
| Estrutura do banco | Concluída |
| Políticas RLS | Concluídas |
| Supabase Storage | Configurado |
| Login real pelo Supabase | Funcionando |
| Carregamento do perfil administrador | Funcionando |
| Chamados no Supabase | Pendente |
| Mensagens no Supabase | Pendente |
| Anexos enviados pelo front-end | Pendente |
| Atualização em tempo real | Pendente |
| Teste completo do solicitante | Pendente |
| Publicação na VM | Pendente |

## Atenções antes da migração dos chamados

O front-end e o banco usam atualmente alguns identificadores diferentes:

| Informação | Front-end atual | Banco Supabase |
|---|---|---|
| Em análise | `analysis` | `in_analysis` |
| Prioridade média | `medium` | `normal` |
| Prioridade crítica/urgente | `critical` | `urgent` |

Esses valores precisam ser padronizados ou convertidos na integração para evitar erros ao salvar e exibir chamados.

## Próximas etapas

1. Substituir o carregamento de chamados do `localStorage` por consultas à tabela `tickets`.
2. Remover os chamados fictícios usados no desenvolvimento.
3. Conectar a abertura de chamados ao Supabase.
4. Conectar alterações de status, prioridade e responsável.
5. Integrar as mensagens com `ticket_messages`.
6. Integrar os arquivos com o bucket `ticket-attachments`.
7. Implementar atualização em tempo real.
8. Testar o fluxo completo com um administrador e um solicitante.
9. Revisar segurança, mensagens de erro e responsividade.
10. Publicar o front-end na VM Ubuntu com Nginx e HTTPS interno.

## Observação sobre a biblioteca do Supabase

Durante o desenvolvimento, a biblioteca do Supabase é carregada pelo CDN `cdn.jsdelivr.net`. Antes da publicação em um ambiente com acesso externo restrito, é recomendável armazenar essa dependência junto ao projeto ou incluí-la no processo de build.

## Uso

Projeto de uso interno da Sopal. Não distribuir credenciais, chaves privadas ou informações dos chamados fora do ambiente autorizado.

## Navegação

A logo da SOPAL no menu lateral também funciona como atalho para a Visão geral. O sistema abre o painel correspondente à conta conectada: solicitante ou administrador, sem recarregar a página.


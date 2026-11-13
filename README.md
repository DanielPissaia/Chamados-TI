# Chamados TI

Sistema de chamados que desenvolvi para organizar o suporte de TI da SOPAL. A ideia é reunir os pedidos dos funcionários, as conversas durante o atendimento e a solução de cada problema em um só lugar.

O projeto faz parte da minha rotina na TI. Tem uma área para o funcionário que precisa de suporte e outra para administrar os atendimentos.

## Telas do sistema

![Área da TI com mensagem do solicitante, imagem anexada e resposta registrada](docs/imagens/ti/02-conversa-e-atendimento.png)

Na tela de atendimento, a TI consulta a solicitação, responde ao funcionário e gerencia o chamado.

[Ver as telas do solicitante e da TI](docs/telas.md)

## Como funciona

O funcionário entra com sua conta, informa o problema e pode anexar imagens. Depois, acompanha seus chamados, responde às mensagens da TI e consulta a solução registrada.

No painel da TI, é possível consultar os chamados, pesquisar por informações do atendimento, aplicar filtros, ajustar a prioridade e responder ao solicitante.

No gerenciamento do atendimento, as opções de alteração de status são **Aberto**, **Em atendimento** e **Concluído**. Ao salvar um chamado como Em atendimento, o sistema vincula o responsável pela conta conectada. Para concluir, é necessário registrar a solução.

## Recursos implementados

- Login com e-mail e senha e telas diferentes para solicitante e administrador.
- Abertura de chamados com título, descrição, setor, categoria e prioridade.
- Protocolo para identificar cada solicitação.
- Mensagens e envio de imagens na abertura e nas respostas.
- Histórico de alterações e consulta aos atendimentos concluídos.
- Pesquisa e filtros nas listas de chamados.
- Atualização de chamados e mensagens em tempo real.
- Notificações dentro do sistema para acompanhar as novidades dos atendimentos.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| HTML, CSS e JavaScript | Telas, formulários e comportamento da interface |
| Supabase Auth | Autenticação dos usuários |
| PostgreSQL e RLS | Dados dos chamados e permissões de acesso |
| Supabase Storage | Armazenamento das imagens |
| Supabase Realtime | Atualização das informações entre as sessões |
| Ubuntu Server e Nginx | Hospedagem do front-end com HTTPS |

## Algumas decisões do projeto

Como o atendimento é feito por uma pessoa na TI, simplifiquei a mudança de status e retirei a necessidade de assumir o chamado em um botão separado. O responsável é definido quando o atendimento começa.

As permissões também são verificadas no banco. O solicitante consulta seus próprios chamados, enquanto a TI tem acesso aos atendimentos que precisa administrar. As imagens ficam em um bucket privado.

Outro cuidado foi o tratamento de alterações feitas em telas desatualizadas: se o chamado mudou desde a última consulta, o sistema pede uma nova consulta antes de salvar a edição.

## Documentação

- [Telas do solicitante e da TI](docs/telas.md)
- [Arquitetura e organização dos dados](docs/arquitetura.md)
- [Fluxo de atendimento e permissões](docs/fluxo-de-atendimento.md)

## Publicação e acesso

O front-end foi publicado em uma máquina virtual com Ubuntu Server e Nginx. A autenticação, o banco de dados e as imagens ficam no Supabase.

O sistema é de uso interno da empresa, com acesso por contas cadastradas. Este repositório reúne a apresentação, a documentação e as capturas de tela. A aplicação em uso permanece no ambiente interno.

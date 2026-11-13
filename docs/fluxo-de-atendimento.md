# Fluxo de atendimento

## Abertura

O funcionário acessa sua conta e informa título, descrição, setor, categoria e prioridade. Também pode enviar imagens para explicar o problema. Ao gravar a solicitação, o sistema exibe o protocolo do chamado.

## Acompanhamento

O solicitante consulta seus chamados e conversa com a TI pela própria tela de atendimento. As respostas podem incluir imagens. A TI acompanha as solicitações pelo painel administrativo, com pesquisa e filtros.

O Realtime acompanha alterações para atualizar as informações entre as sessões. Os avisos dentro do sistema ajudam a acompanhar as novidades dos atendimentos.

## Status usados pela TI

| Status exibido | Código no banco | Uso |
| --- | --- | --- |
| Aberto | `open` | Solicitação registrada, ainda sem atendimento iniciado |
| Em atendimento | `in_progress` | A TI iniciou o atendimento |
| Concluído | `resolved` | A solução foi registrada e o atendimento foi concluído |

Ao selecionar **Em atendimento** e salvar, o responsável é vinculado à conta da TI autenticada na mesma gravação. Essa mudança substituiu o botão separado de assumir chamado.

Para concluir, é necessário preencher a solução e salvar com **Concluído** ou usar o botão **Concluir chamado**. O sistema também permite concluir diretamente um chamado aberto, desde que a solução seja informada.

## Acesso por perfil

| Operação | Solicitante | TI |
| --- | --- | --- |
| Consultar chamados | Somente os próprios | Todos os disponíveis ao atendimento |
| Responder e enviar imagens | Nos próprios chamados, conforme o estado do atendimento | Nos chamados atendidos, conforme o estado do atendimento |
| Alterar prioridade e status | Não pelo painel administrativo | Sim |
| Registrar a solução | Não | Sim |

## Histórico

As mensagens, alterações e soluções ficam associadas ao chamado. O histórico permite consultar o que aconteceu durante o atendimento, inclusive quando o chamado volta de Concluído para Em atendimento.

[Voltar à apresentação](../README.md)

# Etapa 4 — Calendário e planejamento

## O que foi adicionado
- Calendário mensal com navegação entre meses.
- Seleção de um dia e visualização das tarefas que possuem prazo naquela data.
- Indicadores nos dias que possuem tarefas com vencimento.
- Atalho para voltar ao dia atual.
- Meta diária configurável de tarefas concluídas, calculada a partir das tarefas com prazo no dia selecionado.
- Nova seção na navegação principal.

## Como os dados funcionam
O calendário reutiliza `dueDate` das tarefas existentes. Não cria cópias das tarefas e não altera o armazenamento atual. A meta diária é uma configuração local do componente e reinicia ao recarregar a página nesta etapa.

## Como executar
Na pasta que contém `package.json`:

```bash
npm.cmd install
npm.cmd run dev
```

Abra http://localhost:3000.

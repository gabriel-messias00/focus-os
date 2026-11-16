# FOCUS//OS — Etapa 2: Gerenciador de missões avançado

## O que entrou
- Categorias: Trabalho, Estudo, Pessoal e Outra.
- Prazo opcional para cada missão e indicação visual de prazo vencido.
- Edição de missão sem precisar excluir e criar novamente.
- Busca pelo título.
- Filtros por status e categoria.
- Ordenação por mais recentes, mais antigas, prioridade e prazo.
- Migração compatível com tarefas antigas salvas no localStorage: tarefas existentes recebem a categoria "Outra" e continuam disponíveis.

## Como executar
Abra a pasta que contém `package.json` no VS Code e rode:

```powershell
npm.cmd install
npm.cmd run dev
```

Acesse http://localhost:3000.

## Arquivos principais para estudar
- `src/types/index.ts`: tipos de prioridade, categoria, filtro e tarefa.
- `src/hooks/useTasks.ts`: criação, edição, conclusão, exclusão, filtros e ordenação.
- `src/lib/storage.ts`: leitura e gravação local, incluindo compatibilidade com dados antigos.
- `src/components/TaskManager.tsx`: formulário, busca e controles de filtro.
- `src/components/TaskCard.tsx`: exibição e edição de cada missão.
- `src/app/globals.css`: estilos responsivos dos novos controles.

Os dados continuam no navegador (`localStorage`); ainda não há conta, nuvem ou sincronização entre dispositivos.

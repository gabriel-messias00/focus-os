# Etapa 7 — Design, desempenho e release

Versão 2.6.0.

## Experiência visual

- Refinamento do tema escuro, hierarquia, superfícies, espaçamento e responsividade.
- Foco visível, estados de carregamento, movimento reduzido e áreas de toque mais confortáveis.
- Fallback visual quando calendário e analytics ainda estão sendo carregados.

## Desempenho

- Calendário e analytics divididos em chunks e montados quando próximos da viewport.
- Relógio do topo atualizado a cada minuto, não a cada segundo.
- Timer alinhado a um prazo real, com atualização visual no máximo uma vez por segundo.
- Analytics agregado em uma passagem pelas sessões.
- Contagens do calendário pré-computadas por data.
- Componentes de apresentação memoizados onde props estáveis permitem evitar renderizações adicionais.
- Dia local renovado à meia-noite no analytics e no calendário.

## Qualidade e segurança

- Cabeçalho HSTS somente em produção; não é enviado no servidor de desenvolvimento.
- Compressão habilitada e source maps de navegador desabilitados na configuração de produção.
- Revisão de dados locais separados por usuário, formulários de edição e tratamento de erros.
- Checklist de release para build, RLS, isolamento de contas, responsividade, acessibilidade e Lighthouse.

## Limitação de validação

A rede para `registry.npmjs.org` retornou `EAI_AGAIN` durante esta sessão. Assim, não foi possível instalar as dependências para executar typecheck, ESLint, Vitest ou build de produção neste ambiente. Os arquivos passaram pela verificação sintática com o TypeScript disponível e a estrutura do pacote será conferida antes da entrega. A validação completa deve ser feita com `npm.cmd run check` no computador do proprietário e com as credenciais reais do Supabase.

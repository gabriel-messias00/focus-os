# Etapa 6 — Qualidade, segurança e preparação para publicação

## O que foi incluído
- Migração do Next.js 15 para Next.js 16.4.6 e atualização do ponto de entrada `middleware.ts` para `src/proxy.ts`, conforme a convenção atual.
- ESLint 10 com configuração flat nativa do `eslint-config-next` 16.
- Correção do alias `@/` no Vitest para que os testes encontrem os módulos do projeto.
- Isolamento dos caches do navegador por usuário, limpeza do cache da conta após logout confirmado e migração legada reivindicada por uma única conta. Se a primeira migração falhar, outra conta não pode assumir os dados antigos por acidente.
- Validação defensiva de categorias, prioridades, títulos e datas na camada de tarefas.
- Confirmação antes de excluir missões, mensagens claras de falha ao ativar notificações e nomes acessíveis para os dias do calendário.
- Contagem diária de ciclos do Pomodoro derivada do histórico sincronizado, sem reiniciar simplesmente ao atualizar a página.
- Callback de autenticação com allowlist de destinos internos, bloqueando redirecionamentos externos arbitrários.
- Novas rotas de carregamento e página não encontrada.
- Página informativa de privacidade, com limites explicitados (não é parecer jurídico).
- Cabeçalhos básicos de segurança, `no-store` para respostas autenticadas, Error Boundaries e suporte a movimento reduzido / foco visível.
- Pomodoro com sessão associada a uma missão, foco, pausa curta, pausa longa após quatro focos e notificações autorizadas pelo navegador.
- Documentação de deploy e checklist de testes.

## Versões
- Next.js 16.4.6
- React / React DOM 19.3.1
- Supabase JS 2.119.0 e `@supabase/ssr` 0.12.7
- Lucide React 1.73.0
- ESLint 10.15.0
- Vitest 5.1.x

## Importante sobre validação
A inspeção de sintaxe e a revisão estática não substituem `npm install`, typecheck, lint, testes e build com as dependências instaladas. O ambiente de geração não conseguiu completar uma instalação do registry npm, então estes comandos precisam ser executados localmente antes do deploy. A integração real ainda depende das credenciais e das URLs configuradas no projeto Supabase do proprietário.

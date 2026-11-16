# Etapa 5 — Backend, autenticação e sincronização

## O que mudou
- Supabase Auth para cadastro, login, persistência de sessão e logout.
- PostgreSQL para tarefas, sessões concluídas e meta diária.
- Row Level Security em todas as tabelas para isolar os dados pelo `auth.uid()`.
- Migração única do `localStorage` antigo na primeira conta conectada.
- Realtime para tarefas, sessões e meta diária.
- Atualização robusta do cronômetro usando um horário final, para evitar deriva quando a aba fica ocupada ou em segundo plano.
- Cabeçalhos `private, no-store` nas respostas com sessão, evitando cache público de conteúdo autenticado.
- Dependências do Next.js/React atualizadas para releases estáveis recentes.
- Estado visual de sincronização e mensagens de erro.

## Configuração obrigatória
Siga `README.md`. Em resumo: preencha `.env.local`, execute `supabase/setup.sql` no SQL Editor e configure `http://localhost:3000` em Authentication → URL Configuration.

## Segurança
O cliente só recebe Project URL + Publishable key. O Proxy de Next.js (a partir da Etapa 6) atualiza os tokens de sessão e impede cache público das respostas autenticadas. Não colocar `service_role` ou Secret key no navegador. A autorização efetiva é feita no banco por RLS, não por esconder botões na interface.


## Validação desta entrega
Os 20 arquivos TypeScript/TSX foram verificados quanto à sintaxe. A instalação das dependências e o build de produção não puderam ser executados neste ambiente porque o acesso ao registro npm expirou; por isso, a integração precisa ser confirmada no computador local depois de configurar as credenciais do Supabase.

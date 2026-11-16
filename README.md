# FOCUS//OS — Final Release

Versão **2.6.0**. Aplicação de produtividade com Next.js 16, React 19, TypeScript e Supabase. Reúne tarefas, calendário, metas diárias, Pomodoro, histórico, analytics e sincronização por conta.

## Requisitos

- Node.js **20.19+** (ou 22.13+; recomendado: Node.js 22 LTS ou superior compatível).
- npm.
- Um projeto Supabase para autenticação e armazenamento em nuvem.

## Instalação local (Windows / PowerShell)

1. Extraia o ZIP e abra no VS Code a pasta principal, aquela que contém `package.json`.
2. Confirme `node -v`. Se a versão for antiga, instale uma versão LTS compatível do Node.js.
3. Instale as dependências: `npm.cmd install`.
4. Copie o arquivo de ambiente: `Copy-Item .env.example .env.local`.
5. Preencha as duas variáveis do Supabase descritas abaixo.
6. Execute `supabase/setup.sql` no SQL Editor do seu projeto Supabase.
7. Configure as URLs de autenticação no Supabase.
8. Inicie o desenvolvimento: `npm.cmd run dev`.
9. Abra `http://localhost:3000`.

O `package-lock.json` é criado no primeiro `npm install`. Depois de criado, mantenha-o no Git e prefira `npm ci` em ambientes de CI para reproduzir as versões instaladas.

## Variáveis de ambiente

Crie `.env.local` com os valores do seu projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use somente a chave **Publishable** no navegador. Nunca inclua `service_role`, chave secreta, senha do banco ou token privado em variáveis `NEXT_PUBLIC_*`, no Git ou no código do cliente. O arquivo `.env.local` já é ignorado pelo `.gitignore`.

## Configurar Supabase Auth

No Dashboard → Authentication → URL Configuration:

- Site URL local: `http://localhost:3000`
- Redirect URL local: `http://localhost:3000/auth/callback`
- Em produção, adicione o domínio real e `https://SEU-DOMINIO/auth/callback`.

O cadastro e a recuperação de senha usam o callback PKCE `/auth/callback`. Para uso público, mantenha a confirmação de e-mail habilitada e configure SMTP apropriado no Supabase. Faça os testes de confirmação e redefinição antes de divulgar o endereço do app.

## Banco de dados e segurança

Execute `supabase/setup.sql` no SQL Editor. O script cria tabelas, índices, trigger, políticas de RLS e habilita Realtime nas tabelas utilizadas. As políticas vinculam registros a `auth.uid()`. A aplicação não usa chave administrativa no frontend.

Se você já executou o SQL de uma etapa anterior, leia o arquivo atualizado antes de aplicar em um banco que tenha alterações próprias. O script foi preparado para ser repetido nas tabelas e políticas previstas pelo projeto, mas não substitui backup.

## Funcionalidades

- Cadastro, login, logout e recuperação de senha por e-mail.
- Tarefas com categoria, prioridade, prazo, edição, busca, filtros e ordenação.
- Calendário mensal, agenda por dia e meta diária.
- Pomodoro com foco, pausas curtas/longas, missão vinculada e notificação opcional.
- Histórico de sessões concluídas e análise diária/semanal.
- Sincronização Realtime e cache local separado por usuário.
- Migração controlada dos dados legados do navegador para a primeira conta que reivindicar a importação.
- Navegação por teclado, foco visível, preferência por movimento reduzido, estados de carregamento e telas de erro.

## O que mudou na versão 2.6.0

- Redesign com hierarquia visual mais clara, superfícies e bordas mais discretas, melhor contraste, melhor adaptação para celular e áreas de toque maiores.
- Calendário e analytics carregados sob demanda, quando se aproximam da área visível.
- Relógio do cabeçalho atualizado por minuto em vez de segundo.
- Cronômetro baseado em prazo final, atualizando a interface no máximo uma vez por segundo; o tempo não depende da quantidade de renders.
- Agregação do analytics em uma passagem pelos registros, sem filtros repetidos por dia.
- Contagem de tarefas do calendário pré-computada por data.
- Componentes de apresentação memoizados onde as props permitem evitar renders desnecessários.
- Atualização automática do dia local à meia-noite para calendário e estatísticas.
- Cabeçalho HSTS enviado apenas em produção HTTPS, evitando aplicá-lo ao servidor de desenvolvimento local.
- Fallback visual durante o carregamento dos módulos adiados.

Essas mudanças reduzem trabalho desnecessário e melhoram a experiência, mas não significam uma pontuação de performance garantida. Meça a versão de produção no dispositivo e na rede que serão usados.

## Cache e migração

Os caches novos são separados por `user_id`. Uma falha de rede não deve exibir o cache local de outra conta. A primeira conta que reivindicar a migração neste navegador poderá importar as antigas chaves locais não separadas por usuário. Se a tentativa falhar, somente a mesma conta poderá retomá-la. Em computador compartilhado, a primeira conexão deve ser feita com a conta que receberá os dados antigos.

O cache local é uma cópia de conveniência; o Supabase é a fonte principal. Após logout confirmado, o cache daquela conta é removido do navegador. Gravações dependem de conexão e são revertidas na interface quando o Supabase rejeita a operação.

## Verificações automatizadas

Execute na pasta que contém `package.json`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Ou tudo em sequência:

```powershell
npm.cmd run check
```

Os testes unitários não substituem a validação de ponta a ponta com um projeto Supabase real. Consulte `RELEASE-CHECKLIST.md` para a revisão manual antes de publicar.

## Publicação (Vercel)

1. Envie o código para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nas variáveis de ambiente do projeto.
4. Faça o deploy de produção.
5. Adicione o domínio definitivo e `/auth/callback` às Redirect URLs do Supabase.
6. Execute o checklist de lançamento em `RELEASE-CHECKLIST.md`.

## Limites conhecidos

- A conexão real de autenticação, RLS, Realtime, callbacks e SMTP depende das credenciais e configurações do projeto Supabase do proprietário.
- A aplicação não oferece gravação offline; alterações precisam de rede e são revertidas se a gravação remota falhar.
- O analytics trabalha com até 500 sessões recentes carregadas para manter o painel leve. Não apresenta esse recorte como um total histórico completo.
- Pontuação Lighthouse/Core Web Vitals ainda precisa ser medida no ambiente de produção; nenhum número é prometido por antecipação.
- Para uso público, configure backups, SMTP, limites de API, monitoramento e uma política de privacidade adequada ao público e à legislação aplicável.

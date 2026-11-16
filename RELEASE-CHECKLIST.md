# FOCUS//OS — Checklist de revisão final

Use este documento depois de instalar as dependências e conectar o seu próprio projeto Supabase. Não publique enquanto houver um item crítico falhando.

## 1. Instalação e configuração

- [ ] `node -v` mostra uma versão compatível (20.19+, 22.13+ ou superior suportada).
- [ ] `npm.cmd install` conclui sem erro.
- [ ] `.env.local` contém somente a Project URL e a Publishable key corretas.
- [ ] `.env.local` não está no Git.
- [ ] O SQL `supabase/setup.sql` foi aplicado ao projeto certo.
- [ ] Site URL e Redirect URLs locais/de produção estão corretas no Supabase.
- [ ] Confirmação de e-mail e SMTP foram testados.

## 2. Qualidade automatizada

Execute todos os comandos na raiz do projeto:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

- [ ] TypeScript sem erros.
- [ ] ESLint sem erros.
- [ ] Todos os testes Vitest aprovados.
- [ ] Build de produção concluído.
- [ ] `npm.cmd run start` inicia a build localmente.

## 3. Fluxos funcionais

- [ ] Criar uma conta com e-mail válido.
- [ ] Confirmar o e-mail e entrar.
- [ ] Sair e entrar novamente.
- [ ] Solicitar recuperação de senha e concluir o callback.
- [ ] Criar, editar, concluir, reabrir e excluir uma tarefa.
- [ ] Pesquisar, filtrar e ordenar tarefas.
- [ ] Atribuir categoria, prioridade e prazo.
- [ ] Navegar meses no calendário e selecionar datas.
- [ ] Alterar meta diária e conferir a persistência após recarregar.
- [ ] Iniciar, pausar, retomar e reiniciar o cronômetro.
- [ ] Concluir uma sessão curta de foco e conferir o histórico.
- [ ] Concluir quatro ciclos e conferir a pausa longa.
- [ ] Vincular uma sessão a uma tarefa.
- [ ] Ativar notificações somente após consentimento do navegador.
- [ ] Conferir analytics de hoje e da semana.

## 4. Segurança e sincronização

- [ ] Testar em duas sessões de navegador com a mesma conta: tarefas e preferências sincronizam.
- [ ] Testar com duas contas diferentes: nenhum registro de uma conta aparece na outra.
- [ ] Verificar as políticas RLS para `tasks`, `focus_sessions` e `user_preferences`.
- [ ] Confirmar que a chave `service_role`/secret nunca aparece no cliente, Git ou ZIP.
- [ ] Testar erro de rede: a interface informa a falha e não exibe dados de outra conta.
- [ ] Testar logout: cache local da conta desconectada é removido.
- [ ] Confirmar que o redirect de autenticação não aceita URL externa arbitrária.

## 5. Design, acessibilidade e responsividade

- [ ] Testar larguras de 360 px, 390 px, 768 px, 1024 px e desktop amplo.
- [ ] Confirmar que não existe rolagem horizontal acidental.
- [ ] Usar a aplicação inteira somente com teclado.
- [ ] Conferir os estados `focus-visible` em botões, links e campos.
- [ ] Testar com `prefers-reduced-motion: reduce`.
- [ ] Conferir contraste de textos, erros e indicadores de status.
- [ ] Confirmar que mensagens de erro e confirmação são anunciadas por leitores de tela.

## 6. Performance em produção

Faça a medição na build de produção, não no servidor de desenvolvimento:

```powershell
npm.cmd run build
npm.cmd run start
```

No Chrome/Edge, abra DevTools → Lighthouse e execute auditorias para Mobile e Desktop. Faça pelo menos três medições em condições semelhantes e use a mediana.

Registre os resultados reais:

| Métrica | Mobile | Desktop |
|---|---:|---:|
| Performance Lighthouse | — | — |
| Accessibility Lighthouse | — | — |
| Best Practices Lighthouse | — | — |
| SEO Lighthouse | — | — |
| LCP | — | — |
| INP | — | — |
| CLS | — | — |

- [ ] Investigar LCP alto e identificar o elemento principal.
- [ ] Investigar INP alto, especialmente ações de tarefas e cronômetro.
- [ ] Investigar CLS e garantir que as seções adiadas reservem espaço suficiente.
- [ ] Conferir o tamanho dos arquivos JS/CSS e os chunks carregados na primeira visita.
- [ ] Repetir Lighthouse após cada correção importante.

Uma pontuação depende de dispositivo, rede, cache, ambiente e dados reais. Não registre números antes de executar a medição.

## 7. Publicação e pós-lançamento

- [ ] Variáveis de ambiente Production configuradas na Vercel.
- [ ] Domínio de produção cadastrado no Supabase.
- [ ] Build e deploy de produção concluídos.
- [ ] Testar login, recuperação, tarefas e sincronização no domínio definitivo.
- [ ] Fazer backup do banco e confirmar como restaurá-lo.
- [ ] Configurar monitoramento de falhas e revisar logs.
- [ ] Publicar política de privacidade e canal de contato apropriados.

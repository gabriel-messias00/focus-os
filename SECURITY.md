# Segurança — FOCUS//OS

- Nunca envie `.env.local`, tokens ou chaves Supabase em prints, chats ou repositórios.
- Use somente a Publishable key no cliente. Não use service role/secret key em variáveis `NEXT_PUBLIC_*`.
- Mantenha RLS habilitado em todas as tabelas expostas.
- Configure as Redirect URLs do Supabase apenas para domínios de desenvolvimento/produção que você controla.
- Mantenha dependências atualizadas e execute `npm audit` antes de uma publicação.
- Para relatar uma falha, não publique dados pessoais ou credenciais em uma issue pública.


## Antes de publicar
- Atualize as dependências e confira os avisos de `npm audit` (revise transitive dependencies antes de aplicar correções automáticas).
- Ative confirmação de e-mail, configure SMTP e mantenha a allowlist de Redirect URLs restrita aos seus domínios.
- Confira as políticas RLS com duas contas de teste diferentes; uma conta nunca deve ler ou alterar registros da outra.
- Teste recuperação de senha, logout, troca de conta, falhas de rede e sincronização em duas janelas/dispositivos.
- Configure backups e monitoramento no projeto Supabase. A aplicação não faz backups por conta própria.

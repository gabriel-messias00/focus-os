# FOCUS//OS — Etapa 3: Analytics e histórico

## O que entrou
- Registro local de sessões de foco concluídas.
- Indicadores de foco hoje, nesta semana e acumulado.
- Gráfico semanal de minutos focados.
- Navegação para a seção de desempenho.
- Histórico limitado às últimas 500 sessões para evitar crescimento indefinido do armazenamento.

## Como funciona
Uma sessão só entra no histórico quando o cronômetro chega a zero. Pausar ou reiniciar não registra uma sessão concluída. Os dados ficam no localStorage deste navegador/dispositivo. Não existe sincronização em nuvem nesta etapa.

## Arquivos principais
- `src/types/index.ts`: tipo FocusSession.
- `src/lib/storage.ts`: leitura e gravação do histórico.
- `src/hooks/useFocusSessions.ts`: estado, cálculos diários e semanais.
- `src/components/AnalyticsPanel.tsx`: indicadores e gráfico.
- `src/components/FocusTimer.tsx`: integração ao concluir uma sessão.

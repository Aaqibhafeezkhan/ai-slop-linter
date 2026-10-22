# Nota de incidente: falha no processamento de pagamentos em 2026-05-07

## Resumo

No dia 7 de maio de 2026, o serviço `pagamentos-api` ficou instável e cerca de 1.340 pagamentos falharam. A equipe fez o rollback para a versão 2.18.4 às 14:31.

## Linha do tempo

| Horário (UTC-3) | Evento |
|---|---|
| 14:02 | Alerta de latência acima de 3 s no `pagamentos-api` |
| 14:09 | Plantonista Rafael Souza confirma erro 502 |
| 14:31 | Rollback da versão 2.19.0 para 2.18.4 |
| 14:47 | Taxa de erro volta a 0,2% |

## Causa raiz

A causa provável é uma migração de índice na tabela `transacoes`, que com tráfego alto sobrecarregou o pool de conexões (limite de 80). A mudança não tinha sido testada em um ambiente representativo.

## Impacto

Aproximadamente 1.340 pagamentos falharam durante 45 minutos. Nenhum valor foi cobrado em duplicidade.

## Próximos passos

- Adicionar teste de carga ao pipeline antes de cada deploy
- Aumentar o limite do pool para 120 conexões
- Revisar o runbook em https://wiki.example.com/runbooks/pagamentos

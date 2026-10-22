# Nota de incidente: falha no processamento de pagamentos em 2026-05-07

## Resumo

No dia 7 de maio de 2026, o `pagamentos-api` passou a devolver erro 502 e parte dos pagamentos falhou. A equipe reverteu o deploy e o serviço voltou ao normal em cerca de 45 minutos.

## Linha do tempo

| Horário (UTC-3) | Evento |
|---|---|
| 14:02 | Alerta de latência acima de 3 s no `pagamentos-api` |
| 14:09 | Plantonista Rafael Souza confirma erro 502 |
| 14:31 | Rollback da versão 2.19.0 para 2.18.4 |
| 14:47 | Taxa de erro volta a 0,2% |

## Causa raiz

Tudo indica que o problema veio de uma migração de índice na tabela `transacoes`. Com tráfego alto, ela esgotou o pool de conexões, que tem limite de 80. A mudança não foi testada em um ambiente parecido com o de produção.

## Impacto

Cerca de 1.340 pagamentos falharam ao longo de 45 minutos. Nenhum valor foi cobrado em duplicidade.

## Próximos passos

- Adicionar teste de carga ao pipeline antes de cada deploy
- Aumentar o limite do pool para 120 conexões
- Revisar o runbook em https://wiki.example.com/runbooks/pagamentos

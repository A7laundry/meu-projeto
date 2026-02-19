# EPIC E2 — Rastreio Operacional Core
**Synkra Laundry OS | Wave 1 — PRIORIDADE MÁXIMA**
**Status:** Draft
**Criado por:** @pm Morgan | 2026-02-18

## Objetivo
Rastreio completo do fluxo de produção em tempo real: desde a entrada da comanda até a expedição. Cada setor registra produção via tablet. Painel TV mostra status ao vivo.

## Fluxo Operacional Rastreado
```
Recebimento → Triagem → Lavagem → Secagem → Passadoria → Expedição
```

## User Stories (a criar pelo @sm)
- E2.1 — Criação de comanda digital (cliente, peças, tipo, receita, data promessa)
- E2.2 — Geração de etiqueta/QR Code por comanda
- E2.3 — Interface de setor (tablet): registrar entrada e saída de comanda
- E2.4 — Setor Triagem: classificação por tipo de peça, receita atribuída
- E2.5 — Setor Lavagem: registro de máquina usada, ciclo, hora início/fim
- E2.6 — Setor Secagem: registro de secadora, tempo, quantidade
- E2.7 — Setor Passadoria: registro de operador, quantidade, tipo
- E2.8 — Setor Expedição: confirmação de saída, vínculo com logística
- E2.9 — Painel Gestão à Vista (TV): fila por setor, em processo, alertas SLA
- E2.10 — Dashboard de produção: peças/hora por setor, volume do dia
- E2.11 — Alertas de SLA: comanda parada além do tempo esperado
- E2.12 — Histórico de produção: busca por comanda, cliente, data, setor

## KPIs Gerados por Este Epic
- Peças processadas por setor / por hora / por turno
- Tempo médio de ciclo por setor
- Volume diário por unidade (peças e kg)
- Comandas em atraso vs. no prazo

## Critérios de Conclusão
- [ ] Tablet em cada setor registrando entrada/saída
- [ ] Comanda rastreável do início ao fim sem papel
- [ ] Painel TV exibindo status em tempo real
- [ ] Alertas disparando para comandas em atraso
- [ ] Diretor e Gerente vendo volume do dia em tempo real

## Dependências
- E1 (Foundation) — completo

## Tipos de Peça Suportados (Wave 1)
- Roupa comum (cama, banho, uniforme)
- Fantasia
- Tênis
- Tapete
- Cortina
- Industrial (atendimento B2B)

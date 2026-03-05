# EPIC: MVP Operacional para Monetizacao

**ID:** EPIC-MVP
**Status:** In Progress
**Owner:** @pm (Morgan)
**Created:** 2026-03-04

---

## Objetivo

Transformar o Synkra Laundry OS de um projeto em desenvolvimento para um **SaaS pronto para monetizar**, com o fluxo completo da lavanderia funcionando end-to-end e um cerebro IA avaliando operacoes.

## Contexto

### O que JA existe (auditoria 2026-03-04):
- 50+ rotas/paginas, 200+ componentes, 180+ server actions
- Auth guards em 100% das actions criticas
- State machine de pedidos implementada com RPC atomica
- RLS policies corrigidas (migration 024)
- 9 roles de usuario com RBAC completo
- Dashboard executivo, producao por setor, PDV, portal cliente, app motorista

### O que FALTA para monetizar:
1. Setores de producao (secagem, passadoria, expedicao) com UX real
2. Fluxo de pagamento completo no PDV
3. App motorista com evidencia de entrega
4. Notificacao automatica ao cliente
5. Cerebro IA operacional
6. Onboarding multi-tenant
7. Gateway de pagamento (SaaS billing)

---

## Fases

### Fase 1: MVP Operacional (2 semanas)
> Fluxo completo da lavanderia end-to-end

| # | Story | Prioridade | Esforco |
|---|-------|-----------|---------|
| 1.1 | Fortalecer setores producao (secagem/passadoria/expedicao) | P1 | 3 dias |
| 1.2 | PDV com fluxo de pagamento completo | P1 | 2 dias |
| 1.3 | App motorista: evidencia de entrega (foto + assinatura) | P1 | 2 dias |
| 1.4 | Notificacao automatica ao cliente (email + portal) | P1 | 1 dia |
| 1.5 | SLA alerts automaticos por setor | P1 | 1 dia |
| 1.6 | Teste E2E do fluxo completo | P1 | 1 dia |

### Fase 2: Beta Controlado (2 semanas)
> Equipe testando com dados reais

| # | Story | Prioridade | Esforco |
|---|-------|-----------|---------|
| 2.1 | Seed realista (clientes, pedidos, equipamentos) | P2 | 1 dia |
| 2.2 | Onboarding de operadores (tutorial, first-run) | P2 | 2 dias |
| 2.3 | PWA offline queue funcional | P2 | 2 dias |
| 2.4 | Relatorios financeiros (DRE, cashflow por unidade) | P2 | 2 dias |
| 2.5 | CRM historico completo do cliente | P2 | 1 dia |
| 2.6 | Sprint de bugs do feedback da equipe | P2 | 2 dias |

### Fase 3: Monetizacao + IA Brain (3 semanas)
> SaaS pronto para vender

| # | Story | Prioridade | Esforco |
|---|-------|-----------|---------|
| 3.1 | Cerebro IA: analise automatica de KPIs e alertas proativos | P3 | 5 dias |
| 3.2 | Gateway de pagamento (Asaas/Stripe) para SaaS billing | P3 | 3 dias |
| 3.3 | Multi-tenant onboarding (nova lavanderia se cadastra) | P3 | 3 dias |
| 3.4 | Planos e pricing do SaaS | P3 | 2 dias |
| 3.5 | Landing page com conversao (signup -> trial) | P3 | 2 dias |

---

## Timeline

```
Semana 1-2:  Fase 1 (MVP Operacional)
Semana 3-4:  Fase 2 (Beta Controlado)
Semana 5-8:  Fase 3 (Monetizacao + IA)
-----------------------------------------
Total: ~8 semanas para primeiro cliente pagante
```

## Metricas de Sucesso

- [ ] Fluxo completo: pedido criado -> entregue ao cliente em < 5 min (teste)
- [ ] Equipe interna usando por 1 semana sem bloqueios criticos
- [ ] 3+ lavanderias externas no beta
- [ ] Primeiro pagamento recebido via plataforma

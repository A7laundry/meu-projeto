# PRD — Synkra Laundry OS
**Product Requirements Document v1.0**
**Data:** 2026-02-18
**Autor:** @pm (Morgan)
**Status:** Draft → Pending @po Validation

---

## 1. Visão do Produto

### 1.1 Problema
Rede de lavanderias industriais com 12 unidades, 37 funcionários e R$300k/mês de faturamento operando com **4+ sistemas desconectados** e **zero visibilidade operacional**. O Diretor não consegue responder: "quantas peças lavamos hoje?", "qual o custo por kg?", "qual setor está travado agora?".

### 1.2 Solução
**Synkra Laundry OS** — ERP vertical para lavanderias industriais com rastreio de produção em tempo real, gestão de insumos, logística integrada, financeiro próprio e dashboards de gestão à vista por setor.

### 1.3 Visão
Ser o sistema operacional da rede — unificando todos os dados em uma única plataforma, acessível via TV (gestão à vista), tablet (setor operacional) e mobile (gestão em campo), transformando dados operacionais em vantagem competitiva.

### 1.4 Métricas de Sucesso
- **MS-01:** 100% das comandas rastreadas em tempo real (do recebimento à entrega)
- **MS-02:** Custo por kg calculado automaticamente por unidade/dia
- **MS-03:** Tempo de ciclo por setor visível em tempo real (meta: redução de 15%)
- **MS-04:** Zero ruptura de entrega não identificada previamente
- **MS-05:** NPS coletado em 80%+ das entregas

---

## 2. Usuários e Perfis

| Perfil | Acesso | Dispositivo Principal |
|--------|--------|----------------------|
| **Diretor** | Todas as unidades, dados consolidados | Desktop + Mobile |
| **Gerente de Unidade** | Sua unidade, todos os setores | Desktop + Tablet |
| **Funcionário Operacional** | Seu setor específico | Tablet (fixo no setor) |
| **Motorista/Logística** | Roteiro do dia, romaneio | Mobile |
| **Loja (Cliente B2B)** | Suas comandas e pedidos | Portal Web + Mobile |
| **Cliente PF** | Suas peças e status | Portal Web + Mobile |

---

## 3. Requisitos Funcionais por Módulo

### RF-E1: Foundation (Infraestrutura)

| ID | Requisito |
|----|-----------|
| FR-E1-01 | Sistema multi-tenant: cada unidade é um tenant isolado com dados segregados |
| FR-E1-02 | Autenticação com perfis e permissões granulares por módulo |
| FR-E1-03 | Configuração de unidade: nome, endereço, equipamentos cadastrados, funcionários |
| FR-E1-04 | Auditoria de ações: log de quem fez o quê, quando |
| FR-E1-05 | Suporte a PWA (Progressive Web App) para tablets e celulares |

### RF-E2: Rastreio Operacional (WAVE 1 — MVP)

| ID | Requisito |
|----|-----------|
| FR-E2-01 | Criação de comanda digital com: cliente, tipo de peça, quantidade, receita de lavagem, data de promessa |
| FR-E2-02 | QR Code / etiqueta única por comanda para rastreio físico |
| FR-E2-03 | Registro de entrada/saída em cada setor via tablet (scan ou manual) |
| FR-E2-04 | Setores rastreados: Triagem → Lavagem → Secagem → Passadoria → Expedição |
| FR-E2-05 | Cada setor registra: operador, hora início, hora fim, quantidade processada |
| FR-E2-06 | Status em tempo real de cada comanda visível para todos os perfis autorizados |
| FR-E2-07 | Alertas de SLA: comanda com tempo excedido em setor dispara alerta |
| FR-E2-08 | Painel de gestão à vista por setor (TV): fila, em processo, concluído, alertas |
| FR-E2-09 | Suporte a variações de tipo de peça: roupa comum, fantasia, tênis, tapete, cortina |
| FR-E2-10 | Histórico completo de produção por turno/dia/semana/mês |

### RF-E3: Gestão de Equipamentos e Insumos

| ID | Requisito |
|----|-----------|
| FR-E3-01 | Cadastro de equipamentos: lavadoras, secadoras, passadeiras — por unidade |
| FR-E3-02 | Registro de uso por equipamento: hora ligado, ciclos realizados, kg processado |
| FR-E3-03 | Diário de bordo digital por equipamento: ocorrências, observações, operador |
| FR-E3-04 | Cronograma de manutenção preventiva com alertas automáticos |
| FR-E3-05 | Cadastro de insumos químicos: produto, fornecedor, unidade de medida |
| FR-E3-06 | Receitas de lavagem: tipo de peça → produtos utilizados + quantidade |
| FR-E3-07 | Consumo automático de insumo ao registrar lavagem (baixa de estoque) |
| FR-E3-08 | Alerta de estoque mínimo de insumos por unidade |
| FR-E3-09 | Relatório de consumo: produto por período, custo por lavagem, custo por kg |
| FR-E3-10 | Controle de embalagens: tipo, quantidade consumida por expedição |

### RF-E4: Logística

| ID | Requisito |
|----|-----------|
| FR-E4-01 | Cadastro de roteiros fixos por loja/cliente |
| FR-E4-02 | Geração de romaneio diário: coletas e entregas do dia |
| FR-E4-03 | Roteirização automática com sequência otimizada |
| FR-E4-04 | App do motorista: visualizar rota, confirmar coleta, confirmar entrega |
| FR-E4-05 | Coleta: registro de quantidade de peças, foto, assinatura digital |
| FR-E4-06 | Entrega: confirmação, foto, assinatura digital do recebedor |
| FR-E4-07 | Fechamento de dia logístico: relatório de entregas realizadas vs. planejadas |
| FR-E4-08 | Rastreio de ruptura: entrega não realizada — motivo obrigatório |

### RF-E5: Comercial e CRM

| ID | Requisito |
|----|-----------|
| FR-E5-01 | Cadastro de clientes: PJ (lojas) e PF, com histórico completo |
| FR-E5-02 | Tabela de preços por tipo de peça, por cliente/grupo |
| FR-E5-03 | Orçamento e aprovação de pedido |
| FR-E5-04 | Histórico de pedidos, frequência, ticket médio |
| FR-E5-05 | CRM: próximas ações, notas de atendimento, régua de relacionamento |
| FR-E5-06 | NPS: coleta automática pós-entrega via SMS/WhatsApp |
| FR-E5-07 | Portal do cliente: status das peças, histórico, nova solicitação |

### RF-E6: Financeiro

| ID | Requisito |
|----|-----------|
| FR-E6-01 | Contas a receber: geradas automaticamente por pedido entregue |
| FR-E6-02 | Contas a pagar: lançamento manual e recorrente |
| FR-E6-03 | Fluxo de caixa: diário, semanal, mensal |
| FR-E6-04 | Custo operacional por unidade: insumos + mão de obra + overhead |
| FR-E6-05 | Margem por unidade, por tipo de peça, por cliente |
| FR-E6-06 | DRE simplificado por unidade e consolidado |
| FR-E6-07 | Exportação para contabilidade (CSV/OFX) |

### RF-E7: Dashboard e KPIs

| ID | Requisito |
|----|-----------|
| FR-E7-01 | Dashboard do Diretor: visão consolidada de todas as unidades |
| FR-E7-02 | KPI: Volume diário por unidade (peças/kg) |
| FR-E7-03 | KPI: Custo por kg processado |
| FR-E7-04 | KPI: Peças por hora por setor |
| FR-E7-05 | KPI: Taxa de ruptura de entrega |
| FR-E7-06 | KPI: NPS por unidade |
| FR-E7-07 | KPI: Eficiência de equipamentos (tempo ligado vs. produção) |
| FR-E7-08 | KPI: Consumo de insumo por lavagem |
| FR-E7-09 | Gestão à vista (TV): painel por setor, atualiza em tempo real |
| FR-E7-10 | Alertas executivos: métricas fora do target disparam notificação |

---

## 4. Requisitos Não-Funcionais

| ID | Requisito |
|----|-----------|
| NFR-01 | **Performance:** Dashboards carregam em < 2s, atualizações em tempo real < 1s |
| NFR-02 | **Disponibilidade:** 99.5% uptime (operação crítica) |
| NFR-03 | **Offline:** Tablets operacionais funcionam offline com sync ao reconectar |
| NFR-04 | **Segurança:** Dados segregados por tenant, LGPD compliant |
| NFR-05 | **Escalabilidade:** Suporta crescimento de 12 para 50 unidades sem reengenharia |
| NFR-06 | **Mobile-First:** Todas as interfaces operacionais otimizadas para tablet 10" |
| NFR-07 | **Multi-device:** Mesma conta, múltiplos dispositivos simultâneos |
| NFR-08 | **Backup:** Dados replicados automaticamente, RPO < 1h |

---

## 5. Restrições e Constraints

| ID | Constraint |
|----|-----------|
| CON-01 | Sistema deve ser construído como produto proprietário (não usar SaaS de terceiros para core) |
| CON-02 | Módulo financeiro substituirá Conta Azul — migração de dados históricos necessária |
| CON-03 | Interface operacional (tablet/celular) deve ser utilizável sem treinamento extensivo |
| CON-04 | Suporte a 12 unidades simultâneas desde o dia 1 |
| CON-05 | Dados de insumos precisam de cadastro inicial antes de rastreio automático funcionar |

---

## 6. Stack Tecnológica

| Camada | Tecnologia | Decisão |
|--------|-----------|---------|
| Frontend Web | Next.js 14 + TypeScript | SSR, performance, SEO |
| UI Components | Shadcn/ui + Tailwind CSS | Velocidade de desenvolvimento |
| Mobile/Tablet | PWA (Next.js) | Um codebase, multi-device |
| Backend/DB | Supabase (PostgreSQL) | Multi-tenant, Realtime, Auth |
| Realtime | Supabase Realtime | Gestão à vista, status live |
| Storage | Supabase Storage | Fotos de coleta/entrega, documentos |
| Logística | Google Routes API | Roteirização |
| Notificações | Resend (email) + Twilio (SMS) | NPS, alertas |
| Deploy | Vercel + Supabase Cloud | Escala automática |

---

## 7. Plano de Epics e Waves

### Wave 1 — MVP Operacional (Foco Imediato)
**Objetivo:** Rastreio completo de produção em tempo real

| Epic | Nome | Prioridade |
|------|------|-----------|
| E1 | Foundation (Auth, Multi-tenant, PWA base) | CRÍTICO |
| E2 | Rastreio Operacional Core | CRÍTICO |
| E3-partial | Equipamentos básicos (cadastro + diário) | ALTO |

**Entregável:** Tablets nos setores registrando produção, painel TV ao vivo, KPIs básicos.

### Wave 2 — Insumos e Logística
| Epic | Nome |
|------|------|
| E3-complete | Gestão completa de insumos e receitas |
| E4 | Logística (roteirização, romaneio, motorista app) |

### Wave 3 — Comercial e Financeiro
| Epic | Nome |
|------|------|
| E5 | Comercial, CRM, Portal do Cliente |
| E6 | Financeiro próprio (substituição Conta Azul) |

### Wave 4 — Inteligência
| Epic | Nome |
|------|------|
| E7 | Dashboard executivo completo, KPIs avançados |
| E8 | Alertas, relatórios automatizados |

---

## 8. Critérios de Aceite do Produto (DoD)

- [ ] Todos os setores operacionais com tablet registrando entrada/saída
- [ ] Comanda rastreada 100% do ciclo sem papel
- [ ] Painel TV funcionando em tempo real em pelo menos 1 unidade piloto
- [ ] KPIs básicos (peças/hora, volume diário) visíveis ao Diretor
- [ ] Sistema funcionando nas 12 unidades (multi-tenant)
- [ ] Offline mode funcional para tablets operacionais

---

*Synkra Laundry OS PRD v1.0 — @pm Morgan | 2026-02-18*

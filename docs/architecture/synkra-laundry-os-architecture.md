# Arquitetura Técnica — Synkra Laundry OS
**Versão:** 1.0 | **Data:** 2026-02-18 | **Autor:** @architect (Aria)
**Status:** Draft

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     SYNKRA LAUNDRY OS                       │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│  Web App    │  PWA Tablet  │  PWA Mobile  │  TV Display     │
│  (Admin)    │  (Setor)     │  (Motorista) │  (Gestão Vista) │
│  Next.js    │  Next.js PWA │  Next.js PWA │  Next.js        │
└──────┬──────┴──────┬───────┴──────┬───────┴────────┬────────┘
       │             │              │                │
       └─────────────┴──────────────┴────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Next.js API     │
                    │   (App Router)    │
                    │   Route Handlers  │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────┐ ┌──────▼──────┐ ┌────▼──────────┐
    │   Supabase     │ │  Supabase   │ │  Supabase     │
    │   PostgreSQL   │ │  Realtime   │ │  Storage      │
    │   (multi-      │ │  (WebSocket)│ │  (fotos,      │
    │    tenant)     │ │             │ │   docs)       │
    └────────────────┘ └─────────────┘ └───────────────┘
```

---

## 2. Decisões Arquiteturais Chave

### ADR-01: Monolito Modular (não microserviços)
**Decisão:** Next.js App Router com módulos bem separados, Supabase como backend.
**Motivo:** Equipe pequena, 12 unidades, complexidade operacional baixa vs. ganho. Microserviços adicionariam overhead desnecessário. Modularidade interna preserva possibilidade de extração futura.

### ADR-02: Multi-Tenant via Row Level Security (RLS)
**Decisão:** Todos os dados em um único banco PostgreSQL, isolados por `unit_id` via RLS do Supabase.
**Motivo:** Simplicidade operacional. Queries consolidadas para o Diretor (cross-tenant) simples com bypass de RLS autenticado. Custo único de infraestrutura.

### ADR-03: PWA ao invés de App Nativo
**Decisão:** Progressive Web App (Next.js) para todos os dispositivos.
**Motivo:** Um único codebase. Deploy instantâneo de atualizações. Funciona em qualquer tablet/celular sem App Store. Offline via Service Worker. Experiência próxima ao nativo.

### ADR-04: Realtime via Supabase Realtime (WebSocket)
**Decisão:** Supabase Realtime para atualizações ao vivo nos painéis TV e status de comandas.
**Motivo:** Zero infraestrutura adicional. Integrado ao banco. Subscription por tabela/linha com filtros.

### ADR-05: Server Components + Server Actions (Next.js 14)
**Decisão:** Usar React Server Components para dados e Server Actions para mutações.
**Motivo:** Menos JavaScript no cliente. Sem API layer explícito para operações simples. Formulários funcionam offline com Progressive Enhancement.

---

## 3. Estrutura do Projeto

```
synkra-laundry-os/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas públicas (login)
│   ├── (director)/               # Dashboard Diretor (cross-tenant)
│   ├── (unit)/[unitId]/          # Dashboard por Unidade
│   │   ├── dashboard/
│   │   ├── production/           # Rastreio Operacional
│   │   ├── equipment/            # Equipamentos
│   │   ├── logistics/            # Logística
│   │   ├── commercial/           # Comercial
│   │   └── financial/            # Financeiro
│   ├── (sector)/                 # Interfaces de Setor (Tablet)
│   │   ├── sorting/              # Triagem
│   │   ├── washing/              # Lavagem
│   │   ├── drying/               # Secagem
│   │   ├── ironing/              # Passadoria
│   │   └── shipping/             # Expedição
│   ├── (driver)/                 # App Motorista (Mobile)
│   ├── (tv)/[unitId]/            # Painel TV (fullscreen)
│   ├── (client)/                 # Portal do Cliente
│   └── api/                      # Route Handlers (webhooks, exports)
│
├── components/
│   ├── ui/                       # Shadcn/ui base components
│   ├── domain/                   # Componentes de domínio
│   │   ├── order/                # Comanda components
│   │   ├── production/           # Setores e fluxo
│   │   ├── equipment/
│   │   ├── logistics/
│   │   └── kpi/                  # KPI cards e charts
│   └── layout/                   # Layouts compartilhados
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   ├── server.ts             # Supabase server client
│   │   └── admin.ts              # Supabase admin (bypass RLS)
│   ├── auth/                     # Auth helpers e middleware
│   ├── realtime/                 # Realtime subscriptions
│   ├── offline/                  # Service Worker + sync queue
│   └── utils/                    # Helpers gerais
│
├── hooks/                        # React hooks (realtime, offline)
├── actions/                      # Server Actions (mutações)
├── types/                        # TypeScript types do domínio
└── public/
    ├── manifest.json             # PWA manifest
    └── sw.js                     # Service Worker
```

---

## 4. Modelo de Dados — Alto Nível

> Schema detalhado: delegado a @data-engineer

### Entidades Core

```
units (unidades da rede)
  └── users (funcionários por unidade)
  └── equipment (máquinas por unidade)
  └── chemical_products (insumos por unidade)

clients (lojas B2B e PF)
  └── orders (pedidos/comandas)
       └── order_items (peças por comanda)
       └── order_events (rastreio por setor)

production_records (registro por setor)
  ├── sorting_records     (Triagem)
  ├── washing_records     (Lavagem → equipment_id, recipe_id)
  ├── drying_records      (Secagem → equipment_id)
  ├── ironing_records     (Passadoria)
  └── shipping_records    (Expedição)

recipes (receitas de lavagem por tipo de peça)
  └── recipe_items (produto químico → quantidade)

chemical_inventory (estoque de insumos por unidade)
  └── chemical_movements (entradas e consumos)

logistics_routes (roteiros fixos)
  └── route_stops (paradas)
  └── daily_manifests (romaneios diários)
       └── manifest_items (coletas/entregas)

equipment_logs (diário de bordo)
maintenance_schedules (cronograma preventivo)
```

### Estratégia Multi-Tenant RLS

```sql
-- Todas as tabelas operacionais têm unit_id
-- RLS Policy padrão:
CREATE POLICY "unit_isolation" ON orders
  USING (unit_id = auth.jwt() ->> 'unit_id');

-- Diretor: JWT sem unit_id → acesso cross-tenant via função admin
-- Gerente: JWT com unit_id → RLS restringe à sua unidade
-- Funcionário: JWT com unit_id + sector → acesso restrito ao setor
```

---

## 5. Arquitetura de Autenticação e Permissões

```
Supabase Auth
  │
  ├── JWT Claims customizados:
  │     user_id, unit_id, role, sector
  │
  └── Roles:
        director    → cross-tenant, todos módulos
        unit_manager → unit_id específico, todos módulos da unidade
        operator    → unit_id + sector específico
        driver      → unit_id, módulo logística
        store       → client_id, portal cliente
        customer    → client_id, portal cliente (PF)
```

### Middleware de Proteção de Rotas

```typescript
// middleware.ts
matcher: [
  '/(director)/:path*',     → role: director
  '/(unit)/:path*',         → role: director | unit_manager
  '/(sector)/:path*',       → role: operator (+ sector match)
  '/(driver)/:path*',       → role: driver
  '/(client)/:path*',       → role: store | customer
]
```

---

## 6. Arquitetura Realtime (Gestão à Vista)

```typescript
// Painel TV — subscription por unidade
const channel = supabase
  .channel(`unit:${unitId}:production`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'order_events',
    filter: `unit_id=eq.${unitId}`
  }, (payload) => updateTVPanel(payload))
  .subscribe()

// Painel por Setor — subscription filtrada por setor
const sectorChannel = supabase
  .channel(`unit:${unitId}:sector:${sector}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'order_events',
    filter: `unit_id=eq.${unitId}&sector=eq.${sector}`
  }, handleNewOrder)
  .subscribe()
```

### TV Display Architecture
```
TV (navegador fullscreen) → Next.js /tv/[unitId]
  - Polling de fallback: 30s se WebSocket cair
  - Sem autenticação de usuário (token de display dedicado)
  - Layout CSS Grid: fila | em processo | concluído | alertas
  - Auto-refresh completo a cada 6h (limpeza de memória)
```

---

## 7. Arquitetura PWA e Offline

### Service Worker Strategy

```
Operação Online:
  tablet → API → Supabase → resposta imediata

Operação Offline (tablet sem sinal):
  tablet → Service Worker (intercepta) → IndexedDB (queue)

Reconexão:
  Service Worker detecta online → drena queue → sync com Supabase
  Conflitos: last-write-wins com timestamp do evento (não do sync)
```

### Dados com Cache Offline Obrigatório
- Lista de comandas em aberto na unidade
- Receitas de lavagem (read-only)
- Cadastro de equipamentos
- Funcionários da unidade

### Dados Sem Suporte Offline
- Dashboard do Diretor (cross-tenant)
- Relatórios financeiros
- Roteirização em tempo real

---

## 8. Arquitetura de KPIs — Cálculo

```
Estratégia: Computed em query (não materialized view) para Wave 1
Migração: Materialized Views + cron refresh quando volume justificar

KPIs calculados:
  peças/hora = COUNT(items) / EXTRACT(hours, fim - início) GROUP BY sector, shift
  custo/kg   = SUM(chemical_cost) / SUM(weight_kg) GROUP BY unit, day
  custo/peça = SUM(chemical_cost) / COUNT(items) GROUP BY unit, recipe
  ruptura     = COUNT(delivered_late) / COUNT(total_deliveries) GROUP BY unit, day
```

---

## 9. Stack Completa e Versões

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 14.x (App Router) | Frontend + API |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 3.x | Styling |
| Shadcn/ui | latest | UI Components |
| Recharts | 2.x | Gráficos de KPI |
| Supabase JS | 2.x | Database + Auth + Realtime |
| Zustand | 4.x | Estado global leve (offline queue) |
| React Hook Form | 7.x | Formulários de setor |
| Zod | 3.x | Validação de schema |
| next-pwa | 5.x | Service Worker |
| idb | 8.x | IndexedDB (offline queue) |
| date-fns | 3.x | Manipulação de datas |
| Vercel | — | Deploy |
| Supabase Cloud | — | Backend |

---

## 10. Infraestrutura e Deploy

```
Vercel (Frontend)
  ├── Production: app.synkra.com.br
  ├── Preview: deploy automático por PR
  └── Edge Functions: middleware de auth

Supabase Cloud (Backend)
  ├── Database: PostgreSQL 15
  ├── Auth: JWT + RLS
  ├── Realtime: WebSocket
  └── Storage: fotos de coleta/entrega

Domínios:
  app.synkra.com.br       → Web App (admin)
  tv.synkra.com.br        → TV Display (público por unidade)
  cliente.synkra.com.br   → Portal do Cliente
```

### Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # apenas server-side

# Notificações (Wave 2+)
RESEND_API_KEY=                  # emails
TWILIO_ACCOUNT_SID=              # SMS NPS

# Logística (Wave 2+)
GOOGLE_ROUTES_API_KEY=
```

---

## 11. Padrões de Desenvolvimento

### Server Actions (mutações)
```typescript
// actions/production/record-sector.ts
'use server'
export async function recordSectorEntry(
  orderId: string,
  sector: Sector,
  operatorId: string
): Promise<ActionResult> {
  const supabase = createServerClient()
  // validação → inserção → broadcast realtime
}
```

### Componentes de Setor (tablet)
```typescript
// Padrão: grande, touch-friendly, alta legibilidade
// Fonte mínima: 18px
// Botões: mínimo 48px altura
// Contraste: WCAG AA para ambiente industrial
```

### Tratamento de Erros
```typescript
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code: string }
```

---

## 12. Fases de Implementação (Wave 1)

### Sprint 1 — Foundation (E1)
1. Setup Next.js 14 + Supabase + Shadcn/ui + Tailwind
2. Sistema de autenticação com todos os perfis
3. Multi-tenant: unit_id nos JWTs, RLS básico
4. Cadastro de unidades, funcionários, equipamentos
5. PWA manifest + Service Worker básico

### Sprint 2 — Rastreio Core (E2 parte 1)
1. Schema de comandas e order_events
2. Criação de comanda + etiqueta QR
3. Interface tablet: Triagem (setor 1)
4. Interface tablet: Lavagem (setor 2) — com equipamento
5. Status em tempo real via Supabase Realtime

### Sprint 3 — Rastreio Core (E2 parte 2)
1. Interface tablet: Secagem + Passadoria + Expedição
2. Painel TV (gestão à vista)
3. Alertas de SLA
4. Dashboard básico: volume do dia, peças/hora por setor
5. Histórico e busca de comandas

---

*Synkra Laundry OS Architecture v1.0 — @architect Aria | 2026-02-18*

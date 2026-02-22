# A7x TecNologia - OS.

Sistema Operacional Inteligente para redes de lavanderias industriais — rastreio de produção em tempo real, gestão de KPIs, logística e financeiro integrados.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS v4 + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Deploy:** Vercel

## Pré-requisitos

- Node.js 18+
- Conta Supabase (gratuita em supabase.com)
- npm 9+

## Setup Local

### 1. Clonar e instalar dependências
```bash
git clone <repo-url>
cd meu-projeto/web
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite `.env.local` com suas credenciais do Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave anônima pública
- `SUPABASE_SERVICE_ROLE_KEY` — chave de serviço (secreta, apenas server-side)

### 3. Executar em desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Verificação de código (ESLint) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |

## Estrutura do Projeto

```
app/
  (auth)/           # Rotas públicas (login)
  (director)/       # Dashboard do Diretor (cross-tenant)
  (unit)/[unitId]/  # Dashboard por Unidade
  (sector)/         # Interfaces de Setor (tablet fullscreen)
  (driver)/         # App do Motorista (mobile)
  (tv)/[unitId]/    # Painel Gestão à Vista (TV)
  (client)/         # Portal do Cliente
components/
  ui/               # Componentes Shadcn/ui
  domain/           # Componentes de domínio (order, production, kpi)
  layout/           # Layouts compartilhados
lib/
  supabase/         # Clientes Supabase (browser, server, admin)
actions/            # Server Actions (mutações)
types/              # Tipos TypeScript do domínio
hooks/              # React hooks customizados
```

## Perfis de Usuário

| Role | Acesso | Dispositivo |
|------|--------|-------------|
| `director` | Cross-tenant (todas as unidades) | Desktop |
| `unit_manager` | Sua unidade | Desktop + Tablet |
| `operator` | Setor específico | Tablet |
| `driver` | Módulo logística | Mobile |
| `store` | Portal cliente B2B | Web + Mobile |
| `customer` | Portal cliente PF | Web + Mobile |
| `sdr` | Módulo comercial (prospecção) | Desktop |
| `closer` | Módulo comercial (fechamento) | Desktop |

## Documentação

- PRD: `../../docs/prd/`
- Arquitetura: `../../docs/architecture/`
- Histórias: `../../docs/stories/`

-- =========================================================
-- Migration: 024_security_fixes.sql
-- Criado: 2026-02-27 | @data-engineer (Dara) — Auditoria de Segurança
--
-- Corrige 4 problemas identificados na auditoria:
-- A) Habilita RLS nas tabelas comerciais (leads, lead_activities, campaigns)
-- B) Corrige policies que usam 'manager' → 'unit_manager'
-- C) Corrige policies NPS que usam 'admin'/'staff' → roles válidos
-- D) Adiciona coluna unit_price em order_items para preservar preço histórico
-- =========================================================

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  A) HABILITAR RLS NAS TABELAS COMERCIAIS                         ║
-- ║  (017_crm_commercial.sql criou com RLS DISABLED)                  ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- 1. leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Director: acesso total a todos os leads
CREATE POLICY "leads_director_all" ON leads
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

-- Unit Manager: acesso total aos leads da sua unidade
CREATE POLICY "leads_unit_manager_all" ON leads
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'unit_manager'
    AND unit_id = (auth.jwt() ->> 'unit_id')::uuid
  );

-- SDR: leitura e escrita nos leads atribuídos a ele ou da sua unidade
CREATE POLICY "leads_sdr_select" ON leads
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'sdr'
    AND (
      assigned_to = auth.uid()
      OR unit_id = (auth.jwt() ->> 'unit_id')::uuid
    )
  );

CREATE POLICY "leads_sdr_insert" ON leads
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'sdr'
    AND unit_id = (auth.jwt() ->> 'unit_id')::uuid
  );

CREATE POLICY "leads_sdr_update" ON leads
  FOR UPDATE USING (
    auth.jwt() ->> 'user_role' = 'sdr'
    AND (
      assigned_to = auth.uid()
      OR unit_id = (auth.jwt() ->> 'unit_id')::uuid
    )
  );

-- Closer: leitura e atualização nos leads da unidade (para conversão)
CREATE POLICY "leads_closer_select" ON leads
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'closer'
    AND unit_id = (auth.jwt() ->> 'unit_id')::uuid
  );

CREATE POLICY "leads_closer_update" ON leads
  FOR UPDATE USING (
    auth.jwt() ->> 'user_role' = 'closer'
    AND unit_id = (auth.jwt() ->> 'unit_id')::uuid
  );

-- 2. lead_activities
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Director: acesso total
CREATE POLICY "lead_activities_director_all" ON lead_activities
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

-- Unit Manager: acesso via join com leads da unidade
CREATE POLICY "lead_activities_unit_manager_all" ON lead_activities
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'unit_manager'
    AND EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
        AND l.unit_id = (auth.jwt() ->> 'unit_id')::uuid
    )
  );

-- SDR: leitura e escrita nas atividades dos leads acessíveis
CREATE POLICY "lead_activities_sdr_select" ON lead_activities
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'sdr'
    AND EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
        AND (l.assigned_to = auth.uid() OR l.unit_id = (auth.jwt() ->> 'unit_id')::uuid)
    )
  );

CREATE POLICY "lead_activities_sdr_insert" ON lead_activities
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'sdr'
    AND user_id = auth.uid()
  );

-- Closer: leitura e escrita nas atividades dos leads da unidade
CREATE POLICY "lead_activities_closer_select" ON lead_activities
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'closer'
    AND EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_activities.lead_id
        AND l.unit_id = (auth.jwt() ->> 'unit_id')::uuid
    )
  );

CREATE POLICY "lead_activities_closer_insert" ON lead_activities
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'closer'
    AND user_id = auth.uid()
  );

-- 3. campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Director: acesso total
CREATE POLICY "campaigns_director_all" ON campaigns
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

-- Unit Manager: acesso total às campanhas da unidade
CREATE POLICY "campaigns_unit_manager_all" ON campaigns
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'unit_manager'
    AND unit_id = (auth.jwt() ->> 'unit_id')::uuid
  );

-- SDR/Closer: leitura das campanhas da unidade
CREATE POLICY "campaigns_commercial_select" ON campaigns
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') IN ('sdr', 'closer')
    AND unit_id = (auth.jwt() ->> 'unit_id')::uuid
  );


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  B) CORRIGIR POLICIES COM ROLE 'manager' → 'unit_manager'         ║
-- ║  Tabelas afetadas: clients, logistics_routes, route_stops,        ║
-- ║  daily_manifests, manifest_stops, price_table, client_prices,     ║
-- ║  quotes, receivables, payables, crm_notes                         ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- ── clients (010_logistics.sql) ─────────────────────────────────────

DROP POLICY IF EXISTS "clients_unit_insert" ON clients;
CREATE POLICY "clients_unit_insert" ON clients
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

DROP POLICY IF EXISTS "clients_unit_update" ON clients;
CREATE POLICY "clients_unit_update" ON clients
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── logistics_routes (010_logistics.sql) ────────────────────────────

DROP POLICY IF EXISTS "routes_unit_write" ON logistics_routes;
CREATE POLICY "routes_unit_write" ON logistics_routes
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

DROP POLICY IF EXISTS "routes_unit_update" ON logistics_routes;
CREATE POLICY "routes_unit_update" ON logistics_routes
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── route_stops (010_logistics.sql) ─────────────────────────────────

DROP POLICY IF EXISTS "route_stops_unit_write" ON route_stops;
CREATE POLICY "route_stops_unit_write" ON route_stops
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM logistics_routes r
      WHERE r.id = route_stops.route_id
        AND r.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
        AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
    )
  );

DROP POLICY IF EXISTS "route_stops_unit_delete" ON route_stops;
CREATE POLICY "route_stops_unit_delete" ON route_stops
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM logistics_routes r
      WHERE r.id = route_stops.route_id
        AND r.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
        AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
    )
  );

-- ── daily_manifests (011_manifests.sql) ─────────────────────────────

DROP POLICY IF EXISTS "manifests_unit_write" ON daily_manifests;
CREATE POLICY "manifests_unit_write" ON daily_manifests
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

DROP POLICY IF EXISTS "manifests_unit_update" ON daily_manifests;
CREATE POLICY "manifests_unit_update" ON daily_manifests
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── manifest_stops (011_manifests.sql) ──────────────────────────────

DROP POLICY IF EXISTS "manifest_stops_unit_write" ON manifest_stops;
CREATE POLICY "manifest_stops_unit_write" ON manifest_stops
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_manifests m
      WHERE m.id = manifest_stops.manifest_id
        AND m.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
        AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
    )
  );

-- ── price_table (012_pricing.sql) ───────────────────────────────────

DROP POLICY IF EXISTS "price_table_unit_write" ON price_table;
CREATE POLICY "price_table_unit_write" ON price_table
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── client_prices (012_pricing.sql) ─────────────────────────────────

DROP POLICY IF EXISTS "client_prices_unit_all" ON client_prices;
CREATE POLICY "client_prices_unit_all" ON client_prices
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── quotes (012_pricing.sql) ────────────────────────────────────────

DROP POLICY IF EXISTS "quotes_unit_write" ON quotes;
CREATE POLICY "quotes_unit_write" ON quotes
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── receivables (014_financial.sql) ─────────────────────────────────

DROP POLICY IF EXISTS "receivables_unit_all" ON receivables;
CREATE POLICY "receivables_unit_all" ON receivables
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── payables (014_financial.sql) ────────────────────────────────────

DROP POLICY IF EXISTS "payables_unit_all" ON payables;
CREATE POLICY "payables_unit_all" ON payables
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );

-- ── crm_notes (013_crm_notes.sql) ──────────────────────────────────

DROP POLICY IF EXISTS "crm_notes_unit_write" ON crm_notes;
CREATE POLICY "crm_notes_unit_write" ON crm_notes
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
  );


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  C) CORRIGIR POLICIES NPS COM ROLES INVÁLIDOS                     ║
-- ║  'admin' e 'staff' não existem — usar roles reais                 ║
-- ║  admin → director | staff → unit_manager + operator               ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- nps_surveys

DROP POLICY IF EXISTS "nps_surveys_read" ON nps_surveys;
CREATE POLICY "nps_surveys_read" ON nps_surveys
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'director'
    OR (
      (auth.jwt() ->> 'user_role') IN ('unit_manager', 'operator')
      AND unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    )
  );

DROP POLICY IF EXISTS "nps_surveys_insert_admin" ON nps_surveys;
CREATE POLICY "nps_surveys_insert_staff" ON nps_surveys
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_role') IN ('director', 'unit_manager', 'operator')
  );

-- nps_responses

DROP POLICY IF EXISTS "nps_responses_read" ON nps_responses;
CREATE POLICY "nps_responses_read" ON nps_responses
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') IN ('director', 'unit_manager', 'operator')
  );

-- Manter: nps_responses_insert_public (INSERT público) — correto, é link de pesquisa


-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  D) ADICIONAR unit_price EM order_items                           ║
-- ║  Preserva preço no momento da criação da comanda para KPIs        ║
-- ║  históricos não serem afetados por alterações na tabela de preços ║
-- ╚════════════════════════════════════════════════════════════════════╝

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2);

-- Adicionar coluna subtotal calculado para facilitar queries de receita
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2)
    GENERATED ALWAYS AS (quantity * COALESCE(unit_price, 0)) STORED;

-- Comentários explicativos
COMMENT ON COLUMN order_items.unit_price IS
  'Preço unitário capturado no momento da criação da comanda. Se NULL, o preço não foi registrado (dados legados).';

COMMENT ON COLUMN order_items.subtotal IS
  'quantity * unit_price — calculado automaticamente. NULL se unit_price é NULL.';

-- Índice para queries de faturamento por período
CREATE INDEX IF NOT EXISTS idx_order_items_unit_price
  ON order_items(order_id) WHERE unit_price IS NOT NULL;

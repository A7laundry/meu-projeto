-- Migration: 022_maintenance_requests
-- Criado: 2026-02-23 | Overhaul setores Triagem & Lavagem

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  operator_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description  TEXT NOT NULL,
  urgency      TEXT NOT NULL CHECK (urgency IN ('low','medium','high')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);

ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "director_maint_all" ON maintenance_requests FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "unit_maint_own" ON maintenance_requests FOR ALL
  USING (unit_id = (auth.jwt() ->> 'unit_id')::uuid);

CREATE INDEX IF NOT EXISTS maintenance_requests_unit_id_idx ON maintenance_requests(unit_id);
CREATE INDEX IF NOT EXISTS maintenance_requests_equipment_id_idx ON maintenance_requests(equipment_id);
CREATE INDEX IF NOT EXISTS maintenance_requests_status_idx ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS maintenance_requests_created_at_idx ON maintenance_requests(created_at DESC);

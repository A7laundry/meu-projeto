-- Migration: 008_equipment_logs
-- Criado: 2026-02-19 | @dev E3.2

CREATE TABLE IF NOT EXISTS equipment_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id  UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  unit_id       UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  operator_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operator_name TEXT,
  log_type      TEXT NOT NULL CHECK (log_type IN ('use','maintenance','incident','repair_completed')),
  cycles        INTEGER,
  notes         TEXT NOT NULL DEFAULT '',
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment_logs ENABLE ROW LEVEL SECURITY;

-- Diretor: acesso total
CREATE POLICY "director_logs_all" ON equipment_logs FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');

-- Gerente/Operador: apenas logs da sua unidade
CREATE POLICY "unit_logs_own" ON equipment_logs FOR ALL
  USING (unit_id = (auth.jwt() ->> 'unit_id')::uuid);

CREATE INDEX IF NOT EXISTS equipment_logs_equipment_id_idx ON equipment_logs(equipment_id);
CREATE INDEX IF NOT EXISTS equipment_logs_unit_id_idx ON equipment_logs(unit_id);
CREATE INDEX IF NOT EXISTS equipment_logs_occurred_at_idx ON equipment_logs(occurred_at DESC);

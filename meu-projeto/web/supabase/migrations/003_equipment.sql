-- Migration: 003_equipment
-- Criado: 2026-02-18 | @dev E1.4

CREATE TABLE IF NOT EXISTS equipment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id       UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('washer','dryer','iron','other')),
  brand         TEXT,
  model         TEXT,
  serial_number TEXT,
  capacity_kg   NUMERIC(6,2),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','maintenance','inactive')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Diretor: acesso total a todos os equipamentos
CREATE POLICY "director_all" ON equipment FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');

-- Gerente/Operador: apenas equipamentos da sua unidade
CREATE POLICY "unit_own" ON equipment FOR ALL
  USING (unit_id = (auth.jwt() ->> 'unit_id')::uuid);

-- Índice para queries por unidade (frequentes)
CREATE INDEX IF NOT EXISTS equipment_unit_id_idx ON equipment(unit_id);
CREATE INDEX IF NOT EXISTS equipment_unit_type_idx ON equipment(unit_id, type);

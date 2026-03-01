-- Migration 033: Adicionar campos de coleta ao manifest_stops
-- FR-E4-05: Registro de quantidade de peças na coleta

ALTER TABLE manifest_stops
  ADD COLUMN IF NOT EXISTS pickup_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS skip_reason TEXT;

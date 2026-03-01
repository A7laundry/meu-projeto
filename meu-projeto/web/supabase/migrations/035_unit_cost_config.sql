-- Migration 035: Configuração de custos operacionais por unidade
-- FR-E6-04/05: Custo operacional completo + margem

ALTER TABLE units
  ADD COLUMN IF NOT EXISTS labor_cost_monthly NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overhead_monthly NUMERIC(12,2) DEFAULT 0;

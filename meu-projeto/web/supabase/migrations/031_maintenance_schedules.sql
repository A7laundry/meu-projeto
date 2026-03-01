-- ================================================
-- 031: Agendamento de manutenção preventiva
-- ================================================

CREATE TABLE maintenance_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  equipment_id    UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  schedule_type   TEXT NOT NULL CHECK (schedule_type IN ('cycles', 'days')),
  -- Para 'cycles': manutenção a cada N ciclos
  cycle_interval  INTEGER CHECK (cycle_interval > 0),
  -- Para 'days': manutenção a cada N dias
  day_interval    INTEGER CHECK (day_interval > 0),
  description     TEXT NOT NULL DEFAULT 'Manutenção preventiva',
  last_maintenance_at TIMESTAMPTZ,
  last_maintenance_cycles INTEGER DEFAULT 0,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_schedule CHECK (
    (schedule_type = 'cycles' AND cycle_interval IS NOT NULL) OR
    (schedule_type = 'days' AND day_interval IS NOT NULL)
  )
);

CREATE INDEX idx_maintenance_schedules_unit ON maintenance_schedules(unit_id) WHERE active = TRUE;
CREATE INDEX idx_maintenance_schedules_equipment ON maintenance_schedules(equipment_id);

-- RLS
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_schedules_unit_select" ON maintenance_schedules
  FOR SELECT USING (
    unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director')
  );

CREATE POLICY "maintenance_schedules_unit_manage" ON maintenance_schedules
  FOR ALL USING (
    unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND role IN ('unit_manager', 'director'))
  );

-- 011_manifests.sql
-- Tabelas: daily_manifests, manifest_stops

CREATE TABLE daily_manifests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id    UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  route_id   UUID NOT NULL REFERENCES logistics_routes(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  driver_id  UUID REFERENCES staff(id) ON DELETE SET NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, date)
);

CREATE INDEX idx_daily_manifests_unit_date ON daily_manifests(unit_id, date DESC);
CREATE INDEX idx_daily_manifests_route ON daily_manifests(route_id);

CREATE TABLE manifest_stops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id UUID NOT NULL REFERENCES daily_manifests(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'visited', 'skipped')),
  notes       TEXT,
  visited_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_manifest_stops_manifest ON manifest_stops(manifest_id);

-- Updated_at trigger (reutiliza função criada em 010)
CREATE TRIGGER daily_manifests_updated_at
  BEFORE UPDATE ON daily_manifests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE daily_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manifests_director_all" ON daily_manifests
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "manifests_unit_select" ON daily_manifests
  FOR SELECT USING (unit_id::TEXT = (auth.jwt() ->> 'unit_id'));

CREATE POLICY "manifests_unit_write" ON daily_manifests
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

CREATE POLICY "manifests_unit_update" ON daily_manifests
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

CREATE POLICY "manifest_stops_director_all" ON manifest_stops
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "manifest_stops_unit_select" ON manifest_stops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_manifests m
      WHERE m.id = manifest_stops.manifest_id
        AND m.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    )
  );

CREATE POLICY "manifest_stops_unit_write" ON manifest_stops
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_manifests m
      WHERE m.id = manifest_stops.manifest_id
        AND m.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
        AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
    )
  );

CREATE POLICY "manifest_stops_unit_update" ON manifest_stops
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM daily_manifests m
      WHERE m.id = manifest_stops.manifest_id
        AND m.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    )
  );

-- 010_logistics.sql
-- Tabelas: clients, logistics_routes, route_stops

-- Clients (clientes B2B e PF da unidade)
CREATE TABLE clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id       UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('pf', 'pj')),
  document      TEXT,                          -- CPF ou CNPJ
  phone         TEXT,
  email         TEXT,
  address_street     TEXT,
  address_number     TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city       TEXT,
  address_state      TEXT,
  address_zip        TEXT,
  notes         TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_unit_id ON clients(unit_id);
CREATE INDEX idx_clients_active ON clients(unit_id, active);

-- Logistics routes (rotas fixas de coleta/entrega)
CREATE TABLE logistics_routes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id    UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  shift      TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'evening')),
  weekdays   INTEGER[] NOT NULL DEFAULT '{}',  -- 0=Dom, 1=Seg, ..., 6=Sáb
  driver_id  UUID REFERENCES staff(id) ON DELETE SET NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logistics_routes_unit_id ON logistics_routes(unit_id);

-- Route stops (paradas em sequência numa rota)
CREATE TABLE route_stops (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id   UUID NOT NULL REFERENCES logistics_routes(id) ON DELETE CASCADE,
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL,                 -- Ordem na rota (1, 2, 3...)
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, position),
  UNIQUE(route_id, client_id)
);

CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_client_id ON route_stops(client_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER logistics_routes_updated_at
  BEFORE UPDATE ON logistics_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- Clients RLS
CREATE POLICY "clients_director_all" ON clients
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'director'
  );

CREATE POLICY "clients_unit_select" ON clients
  FOR SELECT USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
  );

CREATE POLICY "clients_unit_insert" ON clients
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

CREATE POLICY "clients_unit_update" ON clients
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

-- Logistics routes RLS
CREATE POLICY "routes_director_all" ON logistics_routes
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'director'
  );

CREATE POLICY "routes_unit_select" ON logistics_routes
  FOR SELECT USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
  );

CREATE POLICY "routes_unit_write" ON logistics_routes
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

CREATE POLICY "routes_unit_update" ON logistics_routes
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

-- Route stops RLS (via route's unit_id)
CREATE POLICY "route_stops_director_all" ON route_stops
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'director'
  );

CREATE POLICY "route_stops_unit_select" ON route_stops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM logistics_routes r
      WHERE r.id = route_stops.route_id
        AND r.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    )
  );

CREATE POLICY "route_stops_unit_write" ON route_stops
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM logistics_routes r
      WHERE r.id = route_stops.route_id
        AND r.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
        AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
    )
  );

CREATE POLICY "route_stops_unit_delete" ON route_stops
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM logistics_routes r
      WHERE r.id = route_stops.route_id
        AND r.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
        AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
    )
  );

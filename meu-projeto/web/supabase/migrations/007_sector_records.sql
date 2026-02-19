-- Registros específicos por setor (linked a order_events)

-- Lavagem
CREATE TABLE washing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_event_id UUID NOT NULL REFERENCES order_events(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id),
  cycles INTEGER DEFAULT 1,
  weight_kg NUMERIC(8,2),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  chemical_usage JSONB DEFAULT '[]'::jsonb,
  UNIQUE(order_event_id)
);

-- Secagem
CREATE TABLE drying_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_event_id UUID NOT NULL REFERENCES order_events(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id),
  temperature_level TEXT CHECK (temperature_level IN ('low','medium','high')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  UNIQUE(order_event_id)
);

-- Passadoria
CREATE TABLE ironing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_event_id UUID NOT NULL REFERENCES order_events(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id),
  pieces_by_type JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  UNIQUE(order_event_id)
);

-- Expedição
CREATE TABLE shipping_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_event_id UUID NOT NULL REFERENCES order_events(id) ON DELETE CASCADE,
  packaging_type TEXT CHECK (packaging_type IN ('bag','box','hanger','other')),
  packaging_quantity INTEGER DEFAULT 1,
  manifest_id UUID, -- futuro: referência ao romaneio (E4)
  UNIQUE(order_event_id)
);

-- RLS (herdado via order_event que já tem unit_id)
ALTER TABLE washing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE drying_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ironing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_records ENABLE ROW LEVEL SECURITY;

-- Políticas: acesso via join com order_events (simplificado — service role para writes)
CREATE POLICY "unit_washing_records" ON washing_records FOR SELECT
  USING (order_event_id IN (
    SELECT id FROM order_events
    WHERE unit_id = (auth.jwt() ->> 'unit_id')::uuid
       OR auth.jwt() ->> 'user_role' = 'director'
  ));

CREATE POLICY "unit_drying_records" ON drying_records FOR SELECT
  USING (order_event_id IN (
    SELECT id FROM order_events
    WHERE unit_id = (auth.jwt() ->> 'unit_id')::uuid
       OR auth.jwt() ->> 'user_role' = 'director'
  ));

CREATE POLICY "unit_ironing_records" ON ironing_records FOR SELECT
  USING (order_event_id IN (
    SELECT id FROM order_events
    WHERE unit_id = (auth.jwt() ->> 'unit_id')::uuid
       OR auth.jwt() ->> 'user_role' = 'director'
  ));

CREATE POLICY "unit_shipping_records" ON shipping_records FOR SELECT
  USING (order_event_id IN (
    SELECT id FROM order_events
    WHERE unit_id = (auth.jwt() ->> 'unit_id')::uuid
       OR auth.jwt() ->> 'user_role' = 'director'
  ));

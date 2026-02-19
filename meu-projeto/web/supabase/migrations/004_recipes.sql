-- Tabela de receitas de lavagem (placeholder — populada na E3)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id),
  name TEXT NOT NULL,
  piece_type TEXT NOT NULL CHECK (piece_type IN (
    'clothing','costume','sneaker','rug','curtain','industrial','other'
  )),
  description TEXT,
  temperature_celsius INTEGER,
  duration_minutes INTEGER,
  chemical_notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unit_recipes" ON recipes FOR ALL
  USING (
    unit_id = (auth.jwt() ->> 'unit_id')::uuid
    OR auth.jwt() ->> 'user_role' = 'director'
  );

CREATE INDEX idx_recipes_unit_id ON recipes(unit_id);
CREATE INDEX idx_recipes_piece_type ON recipes(piece_type);

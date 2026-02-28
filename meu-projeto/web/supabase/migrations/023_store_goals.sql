-- Store daily revenue goals
CREATE TABLE store_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue_goal NUMERIC(10,2) NOT NULL CHECK (revenue_goal > 0),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(unit_id, date)
);

CREATE INDEX idx_store_goals_unit_date ON store_goals(unit_id, date);

-- RLS
ALTER TABLE store_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_goals_unit_access" ON store_goals
  FOR ALL USING (
    unit_id IN (
      SELECT unit_id FROM profiles WHERE id = auth.uid()
    )
  );

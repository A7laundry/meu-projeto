-- 014_financial.sql
-- Contas a receber e a pagar

CREATE TABLE receivables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_id     UUID REFERENCES quotes(id) ON DELETE SET NULL,
  description  TEXT NOT NULL,
  amount       NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  due_date     DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at      TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receivables_unit ON receivables(unit_id);
CREATE INDEX idx_receivables_due ON receivables(unit_id, due_date);

CREATE TABLE payables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  supplier     TEXT,
  amount       NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  due_date     DATE NOT NULL,
  category     TEXT NOT NULL DEFAULT 'other' CHECK (
    category IN ('supplies', 'equipment', 'payroll', 'utilities', 'rent', 'other')
  ),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at      TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payables_unit ON payables(unit_id);
CREATE INDEX idx_payables_due ON payables(unit_id, due_date);

-- Triggers
CREATE TRIGGER receivables_updated_at
  BEFORE UPDATE ON receivables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payables_updated_at
  BEFORE UPDATE ON payables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receivables_director_all" ON receivables
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "receivables_unit_all" ON receivables
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

CREATE POLICY "payables_director_all" ON payables
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "payables_unit_all" ON payables
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

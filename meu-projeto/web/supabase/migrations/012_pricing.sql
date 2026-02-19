-- 012_pricing.sql
-- Tabelas: price_table, client_prices, quotes, quote_items

-- Tabela de preços base por unidade e tipo de peça
CREATE TABLE price_table (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  piece_type   TEXT NOT NULL,  -- mesmo enum de orders: clothing, costume, sneaker, rug, curtain, industrial, other
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  unit_label   TEXT NOT NULL DEFAULT 'peça' CHECK (unit_label IN ('peça', 'kg', 'par')),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(unit_id, piece_type)
);

CREATE INDEX idx_price_table_unit ON price_table(unit_id);

-- Preços especiais por cliente (override)
CREATE TABLE client_prices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  piece_type   TEXT NOT NULL,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, piece_type)
);

CREATE INDEX idx_client_prices_unit ON client_prices(unit_id);
CREATE INDEX idx_client_prices_client ON client_prices(client_id);

-- Orçamentos
CREATE TABLE quotes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  notes        TEXT,
  total        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  order_id     UUID REFERENCES orders(id) ON DELETE SET NULL,  -- comanda gerada ao aprovar
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_unit ON quotes(unit_id);
CREATE INDEX idx_quotes_client ON quotes(client_id);

-- Itens do orçamento
CREATE TABLE quote_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id     UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  piece_type   TEXT NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal     NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);

-- Triggers updated_at
CREATE TRIGGER price_table_updated_at
  BEFORE UPDATE ON price_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE price_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Price table RLS
CREATE POLICY "price_table_director_all" ON price_table
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "price_table_unit_select" ON price_table
  FOR SELECT USING (unit_id::TEXT = (auth.jwt() ->> 'unit_id'));

CREATE POLICY "price_table_unit_write" ON price_table
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

-- Client prices RLS
CREATE POLICY "client_prices_director_all" ON client_prices
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "client_prices_unit_all" ON client_prices
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

-- Quotes RLS
CREATE POLICY "quotes_director_all" ON quotes
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "quotes_unit_select" ON quotes
  FOR SELECT USING (unit_id::TEXT = (auth.jwt() ->> 'unit_id'));

CREATE POLICY "quotes_unit_write" ON quotes
  FOR ALL USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

-- Quote items RLS
CREATE POLICY "quote_items_director_all" ON quote_items
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "quote_items_unit_all" ON quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_items.quote_id
        AND q.unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    )
  );

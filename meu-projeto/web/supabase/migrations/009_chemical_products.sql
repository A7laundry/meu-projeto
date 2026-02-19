-- Migration: 009_chemical_products
-- Criado: 2026-02-19 | @dev E3.3

CREATE TABLE IF NOT EXISTS chemical_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('detergent','bleach','softener','starch','other')),
  measure_unit    TEXT NOT NULL CHECK (measure_unit IN ('ml','g','unit')),
  cost_per_unit   NUMERIC(10,4),
  minimum_stock   NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier        TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chemical_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES chemical_products(id) ON DELETE CASCADE,
  unit_id         UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  movement_type   TEXT NOT NULL CHECK (movement_type IN ('in','out')),
  quantity        NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  notes           TEXT,
  operator_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vínculo receita ↔ produtos químicos
CREATE TABLE IF NOT EXISTS recipe_chemicals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES chemical_products(id) ON DELETE CASCADE,
  quantity_per_cycle NUMERIC(10,2) NOT NULL,
  UNIQUE(recipe_id, product_id)
);

ALTER TABLE chemical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemical_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_chemicals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "director_chemicals_all" ON chemical_products FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');
CREATE POLICY "unit_chemicals_own" ON chemical_products FOR ALL
  USING (unit_id = (auth.jwt() ->> 'unit_id')::uuid);

CREATE POLICY "director_movements_all" ON chemical_movements FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');
CREATE POLICY "unit_movements_own" ON chemical_movements FOR ALL
  USING (unit_id = (auth.jwt() ->> 'unit_id')::uuid);

CREATE POLICY "director_recipe_chemicals_all" ON recipe_chemicals FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');
CREATE POLICY "unit_recipe_chemicals_own" ON recipe_chemicals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_id
        AND r.unit_id = (auth.jwt() ->> 'unit_id')::uuid
    )
  );

CREATE INDEX IF NOT EXISTS chemical_products_unit_id_idx ON chemical_products(unit_id);
CREATE INDEX IF NOT EXISTS chemical_movements_product_id_idx ON chemical_movements(product_id);
CREATE INDEX IF NOT EXISTS chemical_movements_unit_id_idx ON chemical_movements(unit_id);

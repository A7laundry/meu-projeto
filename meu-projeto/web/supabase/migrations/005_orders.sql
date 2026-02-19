-- Comandas digitais
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id),
  client_id UUID, -- FK adicionada em 006_clients.sql após criação da tabela clients
  client_name TEXT NOT NULL,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN (
    'received','sorting','washing','drying','ironing','ready','shipped','delivered'
  )),
  promised_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, order_number)
);

-- Itens da comanda
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  piece_type TEXT NOT NULL CHECK (piece_type IN (
    'clothing','costume','sneaker','rug','curtain','industrial','other'
  )),
  piece_type_label TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  recipe_id UUID REFERENCES recipes(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos de rastreio por setor
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  sector TEXT NOT NULL CHECK (sector IN (
    'sorting','washing','drying','ironing','shipping','received'
  )),
  event_type TEXT NOT NULL CHECK (event_type IN ('entry','exit','alert')),
  operator_id UUID REFERENCES profiles(id),
  equipment_id UUID REFERENCES equipment(id),
  quantity_processed INTEGER,
  notes TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unit_orders" ON orders FOR ALL
  USING (
    unit_id = (auth.jwt() ->> 'unit_id')::uuid
    OR auth.jwt() ->> 'user_role' = 'director'
  );

CREATE POLICY "unit_order_items" ON order_items FOR ALL
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE unit_id = (auth.jwt() ->> 'unit_id')::uuid
        OR auth.jwt() ->> 'user_role' = 'director'
    )
  );

CREATE POLICY "unit_order_events" ON order_events FOR ALL
  USING (
    unit_id = (auth.jwt() ->> 'unit_id')::uuid
    OR auth.jwt() ->> 'user_role' = 'director'
  );

-- Índices para performance
CREATE INDEX idx_orders_unit_id ON orders(unit_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_client_name ON orders USING gin(to_tsvector('portuguese', client_name));
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_events_order_id ON order_events(order_id);
CREATE INDEX idx_order_events_unit_id ON order_events(unit_id);

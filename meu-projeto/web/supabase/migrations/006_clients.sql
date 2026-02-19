-- Clientes (simplificado — CRM completo vem no E5)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id),
  name TEXT NOT NULL,
  document TEXT,       -- CPF ou CNPJ (sem formatação)
  phone TEXT,
  email TEXT,
  type TEXT DEFAULT 'individual' CHECK (type IN ('individual','business')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unit_clients" ON clients FOR ALL
  USING (
    unit_id = (auth.jwt() ->> 'unit_id')::uuid
    OR auth.jwt() ->> 'user_role' = 'director'
  );

CREATE INDEX idx_clients_unit_id ON clients(unit_id);
CREATE INDEX idx_clients_name ON clients USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_clients_document ON clients(document) WHERE document IS NOT NULL;

-- Agora adicionamos a FK de orders -> clients
-- (orders foi criado na migration anterior)
ALTER TABLE orders ADD CONSTRAINT fk_orders_client_id
  FOREIGN KEY (client_id) REFERENCES clients(id);

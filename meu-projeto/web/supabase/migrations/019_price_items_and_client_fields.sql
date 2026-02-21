-- 019_price_items_and_client_fields.sql
-- Tabela de preços: suporte a itens nomeados por família (ex: Camisa Social, Calça Jeans)
-- Clientes: campo de aniversário e canal de aquisição para marketing

-- ── price_table ──────────────────────────────────────────────────────────────
-- Adiciona item_name (nome específico do item dentro da família) e fabric_type (tecido/material)
-- item_name = '' significa preço genérico da família (retrocompatível)
-- item_name = 'Camisa Social M/L' significa item específico dentro de clothing

ALTER TABLE price_table
  ADD COLUMN IF NOT EXISTS item_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fabric_type TEXT;

-- Remove constraint antiga (unit_id, piece_type) e adiciona nova com item_name
ALTER TABLE price_table DROP CONSTRAINT IF EXISTS price_table_unit_id_piece_type_key;
ALTER TABLE price_table ADD CONSTRAINT price_table_unit_piece_item_key UNIQUE (unit_id, piece_type, item_name);

-- ── clients ──────────────────────────────────────────────────────────────────
-- Adiciona data de aniversário (para campanhas) e canal de aquisição (métricas de marketing)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS acquisition_channel TEXT;
-- Valores possíveis para acquisition_channel: instagram | google | referral | whatsapp | facebook | other

-- Índice para buscar aniversariantes do dia
CREATE INDEX IF NOT EXISTS idx_clients_birthday_mmdd
  ON clients (EXTRACT(MONTH FROM birthday), EXTRACT(DAY FROM birthday))
  WHERE birthday IS NOT NULL;

-- Migration 036: FK order_id na receivables para idempotência
-- Corrige geração duplicada de contas a receber

ALTER TABLE receivables
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Unique: uma receivable por order (evita duplicatas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_receivables_order_unique
  ON receivables(order_id) WHERE order_id IS NOT NULL;

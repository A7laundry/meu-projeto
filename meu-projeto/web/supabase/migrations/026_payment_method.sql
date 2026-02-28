-- Adicionar coluna payment_method na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Comentário explicativo
COMMENT ON COLUMN orders.payment_method IS 'Método de pagamento: cash, credit_card, debit_card, pix';

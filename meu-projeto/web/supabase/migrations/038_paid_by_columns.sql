-- Adicionar coluna paid_by nas tabelas receivables e payables
-- Registra qual usuário efetuou a baixa do título

ALTER TABLE receivables ADD COLUMN IF NOT EXISTS paid_by UUID REFERENCES auth.users(id);
ALTER TABLE payables ADD COLUMN IF NOT EXISTS paid_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN receivables.paid_by IS 'Usuário que registrou o pagamento';
COMMENT ON COLUMN payables.paid_by IS 'Usuário que registrou o pagamento';

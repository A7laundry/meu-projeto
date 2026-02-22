-- Migration 020: Corrige o CHECK constraint de clients.type
-- O app usa 'pf'/'pj' mas o DB tinha 'individual'/'business'
-- Dados existentes com 'b2b'/'b2c'/'business' são mapeados para 'pj'

-- 1. Remove o constraint antigo
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_type_check;

-- 2. Atualiza registros existentes para os novos valores
UPDATE clients SET type = 'pf'
  WHERE type IN ('individual', 'person', 'b2c', 'pf');

UPDATE clients SET type = 'pj'
  WHERE type IN ('business', 'b2b', 'company', 'pj');

-- Qualquer valor restante não reconhecido → 'pf' (fallback seguro)
UPDATE clients SET type = 'pf'
  WHERE type NOT IN ('pf', 'pj');

-- 3. Adiciona novo constraint com os valores corretos
ALTER TABLE clients
  ADD CONSTRAINT clients_type_check CHECK (type IN ('pf', 'pj'));

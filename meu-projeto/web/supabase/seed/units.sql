-- Seed: 12 Unidades da Rede Synkra
-- ATENÇÃO: Atualize os dados reais (nome, cidade, endereço, telefone) antes de usar em produção
-- Criado: 2026-02-18 | @dev E1.3

INSERT INTO units (name, slug, address, city, state, phone, active) VALUES
  ('Synkra - Unidade 01',  'unidade-01',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 02',  'unidade-02',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 03',  'unidade-03',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 04',  'unidade-04',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 05',  'unidade-05',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 06',  'unidade-06',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 07',  'unidade-07',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 08',  'unidade-08',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 09',  'unidade-09',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 10',  'unidade-10',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 11',  'unidade-11',  NULL, 'São Paulo',        'SP', NULL, true),
  ('Synkra - Unidade 12',  'unidade-12',  NULL, 'São Paulo',        'SP', NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- TODO: Substitua os valores acima pelos dados reais de cada unidade:
-- name    → nome real da unidade (ex: 'Synkra - Paulista')
-- slug    → identificador URL (ex: 'paulista') — sem espaços, sem acentos
-- address → endereço completo
-- city    → cidade
-- state   → UF (2 letras)
-- phone   → telefone com DDD

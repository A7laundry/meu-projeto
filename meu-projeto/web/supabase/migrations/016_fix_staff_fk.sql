-- 016_fix_staff_fk.sql
-- Cria VIEW staff → profiles para resolver FKs das migrations 010/011/013
-- que referenciavam tabela 'staff' inexistente.

-- View que expõe profiles como 'staff' (funcionários)
CREATE OR REPLACE VIEW staff AS
  SELECT
    id,
    full_name,
    role,
    unit_id,
    sector,
    active,
    created_at
  FROM profiles;

-- Conceder acesso à view via service role
GRANT SELECT ON staff TO service_role;
GRANT SELECT ON staff TO authenticated;
GRANT SELECT ON staff TO anon;

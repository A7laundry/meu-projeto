-- Migration: 002_units
-- Criado: 2026-02-18 | @dev E1.3

-- Tabela de unidades da rede
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state CHAR(2) NOT NULL,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Diretor: acesso total
CREATE POLICY "director_all" ON units FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'director');

-- Demais usuários: apenas sua própria unidade
CREATE POLICY "unit_own" ON units FOR SELECT
  USING (id = (auth.jwt() ->> 'unit_id')::uuid);

-- Adicionar FK em profiles → units (migration 001 criou sem FK)
ALTER TABLE profiles
  ADD CONSTRAINT profiles_unit_id_fkey
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
  NOT VALID; -- NOT VALID para não travar em dados existentes

-- Validar constraint após seed
-- ALTER TABLE profiles VALIDATE CONSTRAINT profiles_unit_id_fkey;

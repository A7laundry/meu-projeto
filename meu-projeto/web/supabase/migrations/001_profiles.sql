-- Migration: 001_profiles
-- Criado: 2026-02-18 | @dev E1.2

-- Tabela de perfis de usuário (estende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'director','unit_manager','operator','driver','store','customer'
  )),
  unit_id UUID, -- REFERENCES units(id) — será adicionado na migration 002
  sector TEXT CHECK (sector IN (
    'sorting','washing','drying','ironing','shipping'
  )),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: usuário lê apenas seu próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Diretor lê todos os perfis (necessário para gestão de usuários)
CREATE POLICY "director_read_all" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'director'
    )
  );

-- Trigger: criar profile automaticamente ao criar usuário via convite
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, unit_id, sector)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    (NEW.raw_user_meta_data->>'unit_id')::uuid,
    NEW.raw_user_meta_data->>'sector'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- IMPORTANTE: Auth Hook (JWT customizado)
-- Execute no Supabase Dashboard → Authentication → Hooks
-- Cole a função abaixo e ative o hook "Custom Access Token"
-- ============================================================

-- Função do Auth Hook (executar manualmente no SQL Editor):
-- CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
-- RETURNS jsonb LANGUAGE plpgsql AS $$
-- DECLARE
--   claims jsonb;
--   user_role text;
--   user_unit_id uuid;
--   user_sector text;
-- BEGIN
--   SELECT role, unit_id, sector INTO user_role, user_unit_id, user_sector
--   FROM profiles WHERE id = (event->>'user_id')::uuid;
--
--   claims := event->'claims';
--   IF user_role IS NOT NULL THEN
--     claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
--   END IF;
--   IF user_unit_id IS NOT NULL THEN
--     claims := jsonb_set(claims, '{unit_id}', to_jsonb(user_unit_id::text));
--   END IF;
--   IF user_sector IS NOT NULL THEN
--     claims := jsonb_set(claims, '{sector}', to_jsonb(user_sector));
--   END IF;
--   RETURN jsonb_set(event, '{claims}', claims);
-- END;
-- $$;
--
-- GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;
-- REVOKE EXECUTE ON FUNCTION custom_access_token_hook FROM PUBLIC, authenticated, anon;

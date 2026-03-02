-- =============================================================================
-- UAT Seed Accounts — 8 contas de teste para validação operacional
-- =============================================================================
-- INSTRUÇÕES:
-- 1. Execute este SQL no SQL Editor do Supabase Dashboard (produção)
-- 2. Requer pelo menos 1 unidade ativa no banco (para unit_id dos profiles)
-- 3. Senha padrão para todos: A7teste@2026
-- 4. Após os testes, desative as contas setando active = false nos profiles
-- =============================================================================

DO $$
DECLARE
  v_unit_id uuid;
  v_user_id uuid;
BEGIN
  -- Pega a primeira unidade ativa
  SELECT id INTO v_unit_id FROM units WHERE active = true ORDER BY name LIMIT 1;

  IF v_unit_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma unidade ativa encontrada. Crie pelo menos uma unidade antes de rodar este seed.';
  END IF;

  RAISE NOTICE 'Usando unidade: %', v_unit_id;

  -- ─── 1. Diretor ───────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'diretor@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Diretor UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'diretor@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Diretor UAT', 'director', v_unit_id, NULL, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 2. Gerente ───────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'gerente@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Gerente UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'gerente@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Gerente UAT', 'unit_manager', v_unit_id, NULL, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 3. Triagem ──────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'triagem@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Triagem UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'triagem@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Triagem UAT', 'operator', v_unit_id, 'sorting', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 4. Lavagem ──────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'lavagem@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Lavagem UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'lavagem@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Lavagem UAT', 'operator', v_unit_id, 'washing', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 5. Secagem ──────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'secagem@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Secagem UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'secagem@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Secagem UAT', 'operator', v_unit_id, 'drying', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 6. Passadoria ───────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'passadoria@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Passadoria UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'passadoria@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Passadoria UAT', 'operator', v_unit_id, 'ironing', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 7. Expedição ────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'expedicao@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Expedição UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'expedicao@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Expedição UAT', 'operator', v_unit_id, 'shipping', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ─── 8. Motorista ────────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), 'authenticated', 'authenticated',
    'motorista@a7lavanderia.com.br',
    crypt('A7teste@2026', gen_salt('bf')),
    now(), now(), now(), '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Motorista UAT"}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, jsonb_build_object('sub', v_user_id, 'email', 'motorista@a7lavanderia.com.br'), 'email', v_user_id::text, now(), now(), now());

    INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
    VALUES (v_user_id, 'Motorista UAT', 'driver', v_unit_id, NULL, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RAISE NOTICE '✅ 8 contas UAT criadas com sucesso na unidade %', v_unit_id;
END $$;

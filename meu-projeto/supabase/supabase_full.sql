


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."client_prices_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE c_unit uuid;
BEGIN
  SELECT unit_id INTO c_unit
  FROM public.clients
  WHERE id = NEW.client_id;

  IF c_unit IS NULL THEN
    RAISE EXCEPTION 'Client % not found or has no unit_id', NEW.client_id;
  END IF;

  NEW.unit_id := c_unit;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."client_prices_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid" DEFAULT NULL::"uuid", "p_equipment_id" "uuid" DEFAULT NULL::"uuid", "p_notes" "text" DEFAULT NULL::"text", "p_sector_data" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_current_status  TEXT;
  v_expected_status TEXT;
  v_next_status     TEXT;
  v_event_id        UUID;
  v_order_number    TEXT;
BEGIN
  -- ================================================================
  -- 1. Mapear transições válidas de setor
  -- ================================================================
  CASE p_sector
    WHEN 'washing'  THEN v_expected_status := 'sorting';  v_next_status := 'drying';
    WHEN 'drying'   THEN v_expected_status := 'washing';  v_next_status := 'ironing';
    WHEN 'ironing'  THEN v_expected_status := 'drying';   v_next_status := 'ready';
    WHEN 'shipping' THEN v_expected_status := 'ready';    v_next_status := 'shipped';
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Setor inválido: %s. Valores aceitos: washing, drying, ironing, shipping.', p_sector)
      );
  END CASE;

  -- ================================================================
  -- 2. Verificar e atualizar status da order (SELECT FOR UPDATE para lock)
  -- ================================================================
  SELECT status, order_number
    INTO v_current_status, v_order_number
    FROM orders
   WHERE id = p_order_id
     AND unit_id = p_unit_id
     FOR UPDATE;  -- Lock da row para evitar race condition

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Comanda %s não encontrada na unidade informada.', p_order_id)
    );
  END IF;

  -- Verificar se o status atual é o esperado para esta transição
  -- Permitimos também que o status já seja o do setor atual (ex: washing → drying)
  IF v_current_status <> v_expected_status AND v_current_status <> p_sector THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format(
        'Status atual da comanda (%s) não permite transição pelo setor %s. Esperado: %s ou %s.',
        v_current_status, p_sector, v_expected_status, p_sector
      )
    );
  END IF;

  -- Atualizar status
  UPDATE orders
     SET status = v_next_status
   WHERE id = p_order_id
     AND unit_id = p_unit_id;

  -- ================================================================
  -- 3. Inserir order_event (saída do setor)
  -- ================================================================
  INSERT INTO order_events (
    order_id, unit_id, sector, event_type,
    operator_id, equipment_id, notes
  ) VALUES (
    p_order_id, p_unit_id, p_sector, 'exit',
    p_operator_id, p_equipment_id, p_notes
  )
  RETURNING id INTO v_event_id;

  -- ================================================================
  -- 4. Inserir record específico do setor
  -- ================================================================
  CASE p_sector
    WHEN 'washing' THEN
      INSERT INTO washing_records (
        order_event_id,
        equipment_id,
        cycles,
        weight_kg,
        started_at,
        finished_at,
        chemical_usage
      ) VALUES (
        v_event_id,
        p_equipment_id,
        COALESCE((p_sector_data->>'cycles')::integer, 1),
        (p_sector_data->>'weight_kg')::numeric,
        (p_sector_data->>'started_at')::timestamptz,
        NOW(),
        COALESCE(p_sector_data->'chemical_usage', '[]'::jsonb)
      );

    WHEN 'drying' THEN
      INSERT INTO drying_records (
        order_event_id,
        equipment_id,
        temperature_level,
        finished_at
      ) VALUES (
        v_event_id,
        p_equipment_id,
        COALESCE(p_sector_data->>'temperature_level', 'medium'),
        NOW()
      );

    WHEN 'ironing' THEN
      INSERT INTO ironing_records (
        order_event_id,
        equipment_id,
        pieces_by_type,
        finished_at
      ) VALUES (
        v_event_id,
        p_equipment_id,
        COALESCE(p_sector_data->'pieces_by_type', '[]'::jsonb),
        NOW()
      );

    WHEN 'shipping' THEN
      INSERT INTO shipping_records (
        order_event_id,
        packaging_type,
        packaging_quantity
      ) VALUES (
        v_event_id,
        COALESCE(p_sector_data->>'packaging_type', 'bag'),
        COALESCE((p_sector_data->>'packaging_quantity')::integer, 1)
      );
  END CASE;

  -- ================================================================
  -- 5. Registrar uso de equipamento (se fornecido)
  -- ================================================================
  IF p_equipment_id IS NOT NULL AND p_sector IN ('washing', 'drying') THEN
    INSERT INTO equipment_logs (
      equipment_id,
      unit_id,
      operator_id,
      log_type,
      cycles,
      notes,
      occurred_at
    ) VALUES (
      p_equipment_id,
      p_unit_id,
      p_operator_id,
      'use',
      CASE WHEN p_sector = 'washing'
        THEN COALESCE((p_sector_data->>'cycles')::integer, 1)
        ELSE 1
      END,
      format('%s comanda %s', initcap(p_sector), v_order_number),
      NOW()
    );
  END IF;

  -- ================================================================
  -- 6. Retornar sucesso com dados do evento criado
  -- ================================================================
  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'order_id', p_order_id,
    'previous_status', v_current_status,
    'new_status', v_next_status,
    'sector', p_sector
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Qualquer erro não tratado → rollback implícito + retorno do erro
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Erro interno: %s', SQLERRM)
    );
END;
$$;


ALTER FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid", "p_equipment_id" "uuid", "p_notes" "text", "p_sector_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid", "p_equipment_id" "uuid", "p_notes" "text", "p_sector_data" "jsonb") IS 'Completa um setor de produção atomicamente: atualiza status da order, registra evento de saída, insere record específico do setor e log de equipamento. Tudo em uma transação.';



CREATE OR REPLACE FUNCTION "public"."crm_notes_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE c_unit uuid;
BEGIN
  SELECT unit_id INTO c_unit
  FROM public.clients
  WHERE id = NEW.client_id;

  IF c_unit IS NULL THEN
    RAISE EXCEPTION 'Client % not found or has no unit_id', NEW.client_id;
  END IF;

  NEW.unit_id := c_unit;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."crm_notes_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  claims jsonb;
  base_role text;
  is_copywriter boolean;
begin

  -- Role base do sistema principal
  select role
  into base_role
  from public.profiles
  where id = (event->>'user_id')::uuid;

  if base_role is null then
    base_role := 'staff';
  end if;

  -- Verifica se é copywriter
  select exists(
    select 1
    from public.copywriter_profiles
    where id = (event->>'user_id')::uuid
  ) into is_copywriter;

  claims := event->'claims';

  claims := jsonb_set(claims, '{app_role}', to_jsonb(base_role), true);
  claims := jsonb_set(claims, '{is_copywriter}', to_jsonb(is_copywriter), true);

  return jsonb_set(event, '{claims}', claims, true);

end;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."daily_manifests_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE r_unit uuid;
BEGIN
  SELECT unit_id INTO r_unit
  FROM public.logistics_routes
  WHERE id = NEW.route_id;

  IF r_unit IS NULL THEN
    RAISE EXCEPTION 'Route % not found or has no unit_id', NEW.route_id;
  END IF;

  -- força consistência
  NEW.unit_id := r_unit;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."daily_manifests_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."equipment_logs_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  eq_unit uuid;
BEGIN
  SELECT unit_id INTO eq_unit
  FROM public.equipment
  WHERE id = NEW.equipment_id;

  IF eq_unit IS NULL THEN
    RAISE EXCEPTION 'Equipment % not found or has no unit_id', NEW.equipment_id;
  END IF;

  -- força a consistência
  NEW.unit_id := eq_unit;

  -- opcional: preencher operator_name automaticamente se faltar
  IF NEW.operator_name IS NULL AND NEW.operator_id IS NOT NULL THEN
    SELECT full_name INTO NEW.operator_name
    FROM public.profiles
    WHERE id = NEW.operator_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."equipment_logs_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_custom_claims"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update auth.users
  set raw_user_meta_data =
    coalesce(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object(
        'user_role', new.role,
        'unit_id', new.unit_id
       )
  where id = new.id;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_custom_claims"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, unit_id, sector)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE
      WHEN NULLIF(NEW.raw_user_meta_data->>'unit_id','') IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'unit_id')::uuid
      ELSE NULL
    END,
    NULLIF(NEW.raw_user_meta_data->>'sector','')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."nps_surveys_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE c_unit uuid;
BEGIN
  IF NEW.client_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT unit_id INTO c_unit
  FROM public.clients
  WHERE id = NEW.client_id;

  IF c_unit IS NULL THEN
    RAISE EXCEPTION 'Client % not found or has no unit_id', NEW.client_id;
  END IF;

  NEW.unit_id := c_unit;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."nps_surveys_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."quote_items_after_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalc_quote_total(OLD.quote_id);
  ELSE
    PERFORM public.recalc_quote_total(NEW.quote_id);
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."quote_items_after_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."quotes_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE c_unit uuid;
BEGIN
  SELECT unit_id INTO c_unit
  FROM public.clients
  WHERE id = NEW.client_id;

  IF c_unit IS NULL THEN
    RAISE EXCEPTION 'Client % not found or has no unit_id', NEW.client_id;
  END IF;

  NEW.unit_id := c_unit;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."quotes_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalc_quote_total"("p_quote_id" "uuid") RETURNS "void"
    LANGUAGE "sql"
    AS $$
  UPDATE public.quotes q
  SET total = COALESCE((
    SELECT SUM(subtotal)::numeric(10,2)
    FROM public.quote_items qi
    WHERE qi.quote_id = q.id
  ), 0)
  WHERE q.id = p_quote_id;
$$;


ALTER FUNCTION "public"."recalc_quote_total"("p_quote_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."receivables_enforce_unit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE c_unit uuid;
DECLARE q_unit uuid;
BEGIN
  -- Se client_id existe, pega unidade do cliente
  IF NEW.client_id IS NOT NULL THEN
    SELECT unit_id INTO c_unit
    FROM public.clients
    WHERE id = NEW.client_id;

    IF c_unit IS NULL THEN
      RAISE EXCEPTION 'Client % not found or has no unit_id', NEW.client_id;
    END IF;
  END IF;

  -- Se quote_id existe, pega unidade do quote
  IF NEW.quote_id IS NOT NULL THEN
    SELECT unit_id INTO q_unit
    FROM public.quotes
    WHERE id = NEW.quote_id;

    IF q_unit IS NULL THEN
      RAISE EXCEPTION 'Quote % not found or has no unit_id', NEW.quote_id;
    END IF;
  END IF;

  -- Se ambos existem, precisam ser da mesma unidade
  IF c_unit IS NOT NULL AND q_unit IS NOT NULL AND c_unit <> q_unit THEN
    RAISE EXCEPTION 'Client unit (%) differs from Quote unit (%)', c_unit, q_unit;
  END IF;

  -- Decide unit_id: prioridade quote, senão client, senão mantém o informado
  IF q_unit IS NOT NULL THEN
    NEW.unit_id := q_unit;
  ELSIF c_unit IS NOT NULL THEN
    NEW.unit_id := c_unit;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."receivables_enforce_unit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_leads_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_leads_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."badge_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "icon" "text" DEFAULT '🏅'::"text" NOT NULL,
    "rarity" "text" NOT NULL,
    "category" "text" NOT NULL,
    "condition" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "badge_definitions_category_check" CHECK (("category" = ANY (ARRAY['milestone'::"text", 'quality'::"text", 'streak'::"text", 'speed'::"text", 'xp'::"text"]))),
    CONSTRAINT "badge_definitions_rarity_check" CHECK (("rarity" = ANY (ARRAY['common'::"text", 'rare'::"text", 'epic'::"text", 'legendary'::"text"])))
);


ALTER TABLE "public"."badge_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."briefings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "content_type" "text" NOT NULL,
    "difficulty" "text" NOT NULL,
    "xp_reward" integer DEFAULT 50 NOT NULL,
    "max_writers" integer DEFAULT 1 NOT NULL,
    "word_limit" integer,
    "deadline" timestamp with time zone,
    "reference_links" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "briefings_content_type_check" CHECK (("content_type" = ANY (ARRAY['blog'::"text", 'social'::"text", 'email'::"text", 'ad'::"text", 'landing'::"text", 'video_script'::"text", 'press'::"text", 'other'::"text"]))),
    CONSTRAINT "briefings_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text", 'expert'::"text"]))),
    CONSTRAINT "briefings_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."briefings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid",
    "name" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "objective" "text" DEFAULT 'leads'::"text",
    "budget" numeric DEFAULT 0,
    "spent" numeric DEFAULT 0,
    "leads_generated" integer DEFAULT 0,
    "conversions" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "starts_at" "date" NOT NULL,
    "ends_at" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chemical_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "movement_type" "text" NOT NULL,
    "quantity" numeric(10,2) NOT NULL,
    "notes" "text",
    "operator_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chemical_movements_movement_type_check" CHECK (("movement_type" = ANY (ARRAY['in'::"text", 'out'::"text"]))),
    CONSTRAINT "chemical_movements_quantity_check" CHECK (("quantity" > (0)::numeric))
);


ALTER TABLE "public"."chemical_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chemical_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "measure_unit" "text" NOT NULL,
    "cost_per_unit" numeric(10,4),
    "minimum_stock" numeric(10,2) DEFAULT 0 NOT NULL,
    "supplier" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chemical_products_category_check" CHECK (("category" = ANY (ARRAY['detergent'::"text", 'bleach'::"text", 'softener'::"text", 'starch'::"text", 'other'::"text"]))),
    CONSTRAINT "chemical_products_measure_unit_check" CHECK (("measure_unit" = ANY (ARRAY['ml'::"text", 'g'::"text", 'unit'::"text"])))
);


ALTER TABLE "public"."chemical_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_prices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "piece_type" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "client_prices_piece_type_check" CHECK (("piece_type" = ANY (ARRAY['clothing'::"text", 'costume'::"text", 'sneaker'::"text", 'rug'::"text", 'curtain'::"text", 'industrial'::"text", 'other'::"text"]))),
    CONSTRAINT "client_prices_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."client_prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "type" "text" DEFAULT 'b2c'::"text",
    "notes" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "document" "text",
    "person_type" "text",
    "address_street" "text",
    "address_number" "text",
    "address_complement" "text",
    "address_neighborhood" "text",
    "address_city" "text",
    "address_state" "text",
    "address_zip" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "birthday" "date",
    "acquisition_channel" "text",
    "profile_id" "uuid",
    CONSTRAINT "clients_person_type_check" CHECK ((("person_type" IS NULL) OR ("person_type" = ANY (ARRAY['pf'::"text", 'pj'::"text"])))),
    CONSTRAINT "clients_type_check" CHECK (("type" = ANY (ARRAY['pf'::"text", 'pj'::"text"])))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."copywriter_profiles" (
    "id" "uuid" NOT NULL,
    "bio" "text" DEFAULT ''::"text",
    "specialties" "text"[] DEFAULT '{}'::"text"[],
    "total_xp" integer DEFAULT 0 NOT NULL,
    "current_streak" integer DEFAULT 0 NOT NULL,
    "best_streak" integer DEFAULT 0 NOT NULL,
    "missions_done" integer DEFAULT 0 NOT NULL,
    "avg_score" numeric(4,1) DEFAULT 0 NOT NULL,
    "last_submission" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."copywriter_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crm_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "category" "text" DEFAULT 'other'::"text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "crm_notes_category_check" CHECK (("category" = ANY (ARRAY['visit'::"text", 'call'::"text", 'email'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."crm_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_manifests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "route_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "driver_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "daily_manifests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."daily_manifests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drying_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_event_id" "uuid" NOT NULL,
    "equipment_id" "uuid",
    "temperature_level" "text",
    "started_at" timestamp with time zone,
    "finished_at" timestamp with time zone,
    CONSTRAINT "drying_records_temperature_level_check" CHECK (("temperature_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."drying_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "brand" "text",
    "model" "text",
    "serial_number" "text",
    "capacity_kg" numeric(6,2),
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "equipment_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'maintenance'::"text", 'inactive'::"text"]))),
    CONSTRAINT "equipment_type_check" CHECK (("type" = ANY (ARRAY['washer'::"text", 'dryer'::"text", 'iron'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."equipment_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "equipment_id" "uuid" NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "operator_id" "uuid",
    "operator_name" "text",
    "log_type" "text" NOT NULL,
    "cycles" integer,
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "equipment_logs_cycles_check" CHECK ((("cycles" IS NULL) OR ("cycles" >= 0))),
    CONSTRAINT "equipment_logs_log_type_check" CHECK (("log_type" = ANY (ARRAY['use'::"text", 'maintenance'::"text", 'incident'::"text", 'repair_completed'::"text"]))),
    CONSTRAINT "equipment_logs_unit_matches_equipment" CHECK (("unit_id" IS NOT NULL))
);


ALTER TABLE "public"."equipment_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ironing_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_event_id" "uuid" NOT NULL,
    "equipment_id" "uuid",
    "pieces_by_type" "jsonb" DEFAULT '[]'::"jsonb",
    "started_at" timestamp with time zone,
    "finished_at" timestamp with time zone
);


ALTER TABLE "public"."ironing_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid",
    "name" "text" NOT NULL,
    "company" "text",
    "email" "text",
    "phone" "text",
    "type" "text" DEFAULT 'business'::"text",
    "source" "text" DEFAULT 'manual'::"text",
    "stage" "text" DEFAULT 'prospect'::"text",
    "assigned_to" "uuid",
    "estimated_monthly_value" numeric DEFAULT 0,
    "notes" "text",
    "lost_reason" "text",
    "converted_client_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."logistics_routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "shift" "text" NOT NULL,
    "weekdays" integer[] DEFAULT '{}'::integer[] NOT NULL,
    "driver_id" "uuid",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "logistics_routes_shift_check" CHECK (("shift" = ANY (ARRAY['morning'::"text", 'afternoon'::"text", 'evening'::"text"])))
);


ALTER TABLE "public"."logistics_routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "equipment_id" "uuid",
    "operator_id" "uuid",
    "description" "text" NOT NULL,
    "urgency" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    CONSTRAINT "maintenance_requests_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'resolved'::"text"]))),
    CONSTRAINT "maintenance_requests_urgency_check" CHECK (("urgency" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."maintenance_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."manifest_stops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "manifest_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "notes" "text",
    "visited_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "manifest_stops_position_check" CHECK (("position" > 0)),
    CONSTRAINT "manifest_stops_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'visited'::"text", 'skipped'::"text"])))
);


ALTER TABLE "public"."manifest_stops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nps_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid" NOT NULL,
    "score" smallint NOT NULL,
    "comment" "text",
    "answered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "nps_responses_score_check" CHECK ((("score" >= 0) AND ("score" <= 10)))
);


ALTER TABLE "public"."nps_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nps_surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."nps_surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "sector" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "operator_id" "uuid",
    "equipment_id" "uuid",
    "quantity_processed" integer,
    "notes" "text",
    "occurred_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "order_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['entry'::"text", 'exit'::"text", 'alert'::"text"]))),
    CONSTRAINT "order_events_sector_check" CHECK (("sector" = ANY (ARRAY['sorting'::"text", 'washing'::"text", 'drying'::"text", 'ironing'::"text", 'shipping'::"text", 'received'::"text"])))
);


ALTER TABLE "public"."order_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "piece_type" "text" NOT NULL,
    "piece_type_label" "text",
    "quantity" integer NOT NULL,
    "recipe_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "unit_price" numeric(10,2),
    "subtotal" numeric(10,2) GENERATED ALWAYS AS ((("quantity")::numeric * COALESCE("unit_price", (0)::numeric))) STORED,
    CONSTRAINT "order_items_piece_type_check" CHECK (("piece_type" = ANY (ARRAY['clothing'::"text", 'costume'::"text", 'sneaker'::"text", 'rug'::"text", 'curtain'::"text", 'industrial'::"text", 'other'::"text"]))),
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."order_items"."unit_price" IS 'Preço unitário capturado no momento da criação da comanda. Se NULL, o preço não foi registrado (dados legados).';



COMMENT ON COLUMN "public"."order_items"."subtotal" IS 'quantity * unit_price — calculado automaticamente. NULL se unit_price é NULL.';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "client_name" "text" NOT NULL,
    "order_number" "text" NOT NULL,
    "status" "text" DEFAULT 'received'::"text",
    "promised_at" timestamp with time zone NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "payment_method" "text",
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['received'::"text", 'sorting'::"text", 'washing'::"text", 'drying'::"text", 'ironing'::"text", 'ready'::"text", 'shipped'::"text", 'delivered'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."orders"."payment_method" IS 'Método de pagamento: cash, credit_card, debit_card, pix';



CREATE TABLE IF NOT EXISTS "public"."payables" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "supplier" "text",
    "amount" numeric(10,2) NOT NULL,
    "due_date" "date" NOT NULL,
    "category" "text" DEFAULT 'other'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "paid_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payables_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payables_category_check" CHECK (("category" = ANY (ARRAY['supplies'::"text", 'equipment'::"text", 'payroll'::"text", 'utilities'::"text", 'rent'::"text", 'other'::"text"]))),
    CONSTRAINT "payables_paid_requires_paid_at" CHECK ((("status" <> 'paid'::"text") OR ("paid_at" IS NOT NULL))),
    CONSTRAINT "payables_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'overdue'::"text"])))
);


ALTER TABLE "public"."payables" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_table" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "piece_type" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "unit_label" "text" DEFAULT 'peça'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "item_name" "text" DEFAULT ''::"text" NOT NULL,
    "fabric_type" "text",
    CONSTRAINT "price_table_piece_type_check" CHECK (("piece_type" = ANY (ARRAY['clothing'::"text", 'costume'::"text", 'sneaker'::"text", 'rug'::"text", 'curtain'::"text", 'industrial'::"text", 'other'::"text"]))),
    CONSTRAINT "price_table_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "price_table_unit_label_check" CHECK (("unit_label" = ANY (ARRAY['peça'::"text", 'kg'::"text", 'par'::"text"])))
);


ALTER TABLE "public"."price_table" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "unit_id" "uuid",
    "sector" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text", 'operator'::"text", 'driver'::"text", 'store'::"text", 'customer'::"text", 'sdr'::"text", 'closer'::"text", 'copywriter'::"text"]))),
    CONSTRAINT "profiles_sector_check" CHECK (("sector" = ANY (ARRAY['sorting'::"text", 'washing'::"text", 'drying'::"text", 'ironing'::"text", 'shipping'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quote_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quote_id" "uuid" NOT NULL,
    "piece_type" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "subtotal" numeric(10,2) GENERATED ALWAYS AS ((("quantity")::numeric * "unit_price")) STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "quote_items_piece_type_check" CHECK (("piece_type" = ANY (ARRAY['clothing'::"text", 'costume'::"text", 'sneaker'::"text", 'rug'::"text", 'curtain'::"text", 'industrial'::"text", 'other'::"text"]))),
    CONSTRAINT "quote_items_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "quote_items_unit_price_check" CHECK (("unit_price" >= (0)::numeric))
);


ALTER TABLE "public"."quote_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "notes" "text",
    "total" numeric(10,2) DEFAULT 0 NOT NULL,
    "order_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "quotes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "quotes_total_check" CHECK (("total" >= (0)::numeric))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."receivables" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "quote_id" "uuid",
    "description" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "due_date" "date" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "paid_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "receivables_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "receivables_paid_requires_paid_at" CHECK ((("status" <> 'paid'::"text") OR ("paid_at" IS NOT NULL))),
    CONSTRAINT "receivables_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'overdue'::"text"])))
);


ALTER TABLE "public"."receivables" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_chemicals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity_per_cycle" numeric(10,2) NOT NULL
);


ALTER TABLE "public"."recipe_chemicals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "piece_type" "text" NOT NULL,
    "description" "text",
    "temperature_celsius" integer,
    "duration_minutes" integer,
    "chemical_notes" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recipes_piece_type_check" CHECK (("piece_type" = ANY (ARRAY['clothing'::"text", 'costume'::"text", 'sneaker'::"text", 'rug'::"text", 'curtain'::"text", 'industrial'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."recipes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."route_stops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "route_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "route_stops_position_check" CHECK (("position" > 0))
);


ALTER TABLE "public"."route_stops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shipping_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_event_id" "uuid" NOT NULL,
    "packaging_type" "text",
    "packaging_quantity" integer DEFAULT 1,
    "manifest_id" "uuid",
    CONSTRAINT "shipping_records_packaging_type_check" CHECK (("packaging_type" = ANY (ARRAY['bag'::"text", 'box'::"text", 'hanger'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."shipping_records" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."staff" AS
 SELECT "id",
    "full_name",
    "role",
    "unit_id",
    "sector",
    "active",
    "created_at"
   FROM "public"."profiles";


ALTER VIEW "public"."staff" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "revenue_goal" numeric(10,2) NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "store_goals_revenue_goal_check" CHECK (("revenue_goal" > (0)::numeric))
);


ALTER TABLE "public"."store_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submission_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."submission_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "briefing_id" "uuid" NOT NULL,
    "writer_id" "uuid" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "word_count" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'claimed'::"text" NOT NULL,
    "score" integer,
    "reviewer_id" "uuid",
    "reviewed_at" timestamp with time zone,
    "submitted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "submissions_score_check" CHECK ((("score" >= 0) AND ("score" <= 100))),
    CONSTRAINT "submissions_status_check" CHECK (("status" = ANY (ARRAY['claimed'::"text", 'submitted'::"text", 'revision'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "address" "text",
    "city" "text" NOT NULL,
    "state" character(2) NOT NULL,
    "phone" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."washing_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_event_id" "uuid" NOT NULL,
    "equipment_id" "uuid",
    "cycles" integer DEFAULT 1,
    "weight_kg" numeric(8,2),
    "started_at" timestamp with time zone,
    "finished_at" timestamp with time zone,
    "chemical_usage" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."washing_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."writer_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "writer_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "awarded_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."writer_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."writer_xp_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "writer_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "reason" "text" NOT NULL,
    "source_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."writer_xp_log" OWNER TO "postgres";


ALTER TABLE ONLY "public"."badge_definitions"
    ADD CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badge_definitions"
    ADD CONSTRAINT "badge_definitions_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."briefings"
    ADD CONSTRAINT "briefings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chemical_movements"
    ADD CONSTRAINT "chemical_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chemical_products"
    ADD CONSTRAINT "chemical_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_prices"
    ADD CONSTRAINT "client_prices_client_id_piece_type_key" UNIQUE ("client_id", "piece_type");



ALTER TABLE ONLY "public"."client_prices"
    ADD CONSTRAINT "client_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."copywriter_profiles"
    ADD CONSTRAINT "copywriter_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crm_notes"
    ADD CONSTRAINT "crm_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_manifests"
    ADD CONSTRAINT "daily_manifests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_manifests"
    ADD CONSTRAINT "daily_manifests_route_id_date_key" UNIQUE ("route_id", "date");



ALTER TABLE ONLY "public"."drying_records"
    ADD CONSTRAINT "drying_records_order_event_id_key" UNIQUE ("order_event_id");



ALTER TABLE ONLY "public"."drying_records"
    ADD CONSTRAINT "drying_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment_logs"
    ADD CONSTRAINT "equipment_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ironing_records"
    ADD CONSTRAINT "ironing_records_order_event_id_key" UNIQUE ("order_event_id");



ALTER TABLE ONLY "public"."ironing_records"
    ADD CONSTRAINT "ironing_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."logistics_routes"
    ADD CONSTRAINT "logistics_routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_requests"
    ADD CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."manifest_stops"
    ADD CONSTRAINT "manifest_stops_manifest_id_client_id_key" UNIQUE ("manifest_id", "client_id");



ALTER TABLE ONLY "public"."manifest_stops"
    ADD CONSTRAINT "manifest_stops_manifest_id_position_key" UNIQUE ("manifest_id", "position");



ALTER TABLE ONLY "public"."manifest_stops"
    ADD CONSTRAINT "manifest_stops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nps_responses"
    ADD CONSTRAINT "nps_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nps_responses"
    ADD CONSTRAINT "nps_responses_survey_id_key" UNIQUE ("survey_id");



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_unit_id_order_number_key" UNIQUE ("unit_id", "order_number");



ALTER TABLE ONLY "public"."payables"
    ADD CONSTRAINT "payables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_table"
    ADD CONSTRAINT "price_table_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_table"
    ADD CONSTRAINT "price_table_unit_piece_item_key" UNIQUE ("unit_id", "piece_type", "item_name");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."receivables"
    ADD CONSTRAINT "receivables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_chemicals"
    ADD CONSTRAINT "recipe_chemicals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_chemicals"
    ADD CONSTRAINT "recipe_chemicals_recipe_id_product_id_key" UNIQUE ("recipe_id", "product_id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."route_stops"
    ADD CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."route_stops"
    ADD CONSTRAINT "route_stops_route_id_client_id_key" UNIQUE ("route_id", "client_id");



ALTER TABLE ONLY "public"."route_stops"
    ADD CONSTRAINT "route_stops_route_id_position_key" UNIQUE ("route_id", "position");



ALTER TABLE ONLY "public"."shipping_records"
    ADD CONSTRAINT "shipping_records_order_event_id_key" UNIQUE ("order_event_id");



ALTER TABLE ONLY "public"."shipping_records"
    ADD CONSTRAINT "shipping_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_goals"
    ADD CONSTRAINT "store_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_goals"
    ADD CONSTRAINT "store_goals_unit_id_date_key" UNIQUE ("unit_id", "date");



ALTER TABLE ONLY "public"."submission_comments"
    ADD CONSTRAINT "submission_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_briefing_id_writer_id_key" UNIQUE ("briefing_id", "writer_id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."units"
    ADD CONSTRAINT "units_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."washing_records"
    ADD CONSTRAINT "washing_records_order_event_id_key" UNIQUE ("order_event_id");



ALTER TABLE ONLY "public"."washing_records"
    ADD CONSTRAINT "washing_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."writer_badges"
    ADD CONSTRAINT "writer_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."writer_badges"
    ADD CONSTRAINT "writer_badges_writer_id_badge_id_key" UNIQUE ("writer_id", "badge_id");



ALTER TABLE ONLY "public"."writer_xp_log"
    ADD CONSTRAINT "writer_xp_log_pkey" PRIMARY KEY ("id");



CREATE INDEX "campaigns_status_idx" ON "public"."campaigns" USING "btree" ("status");



CREATE INDEX "campaigns_unit_id_idx" ON "public"."campaigns" USING "btree" ("unit_id");



CREATE INDEX "chemical_movements_product_id_idx" ON "public"."chemical_movements" USING "btree" ("product_id");



CREATE INDEX "chemical_movements_unit_id_idx" ON "public"."chemical_movements" USING "btree" ("unit_id");



CREATE INDEX "chemical_products_unit_id_idx" ON "public"."chemical_products" USING "btree" ("unit_id");



CREATE INDEX "equipment_logs_equipment_id_idx" ON "public"."equipment_logs" USING "btree" ("equipment_id");



CREATE INDEX "equipment_logs_unit_occurred_at_idx" ON "public"."equipment_logs" USING "btree" ("unit_id", "occurred_at" DESC);



CREATE INDEX "equipment_logs_unit_type_idx" ON "public"."equipment_logs" USING "btree" ("unit_id", "log_type");



CREATE INDEX "equipment_unit_id_idx" ON "public"."equipment" USING "btree" ("unit_id");



CREATE INDEX "equipment_unit_type_idx" ON "public"."equipment" USING "btree" ("unit_id", "type");



CREATE INDEX "idx_briefings_created_by" ON "public"."briefings" USING "btree" ("created_by");



CREATE INDEX "idx_briefings_status" ON "public"."briefings" USING "btree" ("status");



CREATE INDEX "idx_client_prices_client" ON "public"."client_prices" USING "btree" ("client_id");



CREATE INDEX "idx_client_prices_unit" ON "public"."client_prices" USING "btree" ("unit_id");



CREATE INDEX "idx_client_prices_unit_active" ON "public"."client_prices" USING "btree" ("unit_id", "active");



CREATE INDEX "idx_clients_birthday_mmdd" ON "public"."clients" USING "btree" (EXTRACT(month FROM "birthday"), EXTRACT(day FROM "birthday")) WHERE ("birthday" IS NOT NULL);



CREATE INDEX "idx_clients_document" ON "public"."clients" USING "btree" ("document") WHERE ("document" IS NOT NULL);



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("email");



CREATE INDEX "idx_clients_name" ON "public"."clients" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "name"));



CREATE INDEX "idx_clients_phone" ON "public"."clients" USING "btree" ("phone");



CREATE INDEX "idx_clients_profile_id" ON "public"."clients" USING "btree" ("profile_id") WHERE ("profile_id" IS NOT NULL);



CREATE INDEX "idx_clients_unit_active" ON "public"."clients" USING "btree" ("unit_id", "active");



CREATE INDEX "idx_clients_unit_id" ON "public"."clients" USING "btree" ("unit_id");



CREATE INDEX "idx_crm_notes_client" ON "public"."crm_notes" USING "btree" ("client_id");



CREATE INDEX "idx_crm_notes_unit" ON "public"."crm_notes" USING "btree" ("unit_id");



CREATE INDEX "idx_crm_notes_unit_created_at" ON "public"."crm_notes" USING "btree" ("unit_id", "created_at" DESC);



CREATE INDEX "idx_daily_manifests_route" ON "public"."daily_manifests" USING "btree" ("route_id");



CREATE INDEX "idx_daily_manifests_status" ON "public"."daily_manifests" USING "btree" ("status");



CREATE INDEX "idx_daily_manifests_unit_date" ON "public"."daily_manifests" USING "btree" ("unit_id", "date" DESC);



CREATE INDEX "idx_drying_records_event_id" ON "public"."drying_records" USING "btree" ("order_event_id");



CREATE INDEX "idx_ironing_records_event_id" ON "public"."ironing_records" USING "btree" ("order_event_id");



CREATE INDEX "idx_logistics_routes_unit_active" ON "public"."logistics_routes" USING "btree" ("unit_id", "active");



CREATE INDEX "idx_logistics_routes_unit_id" ON "public"."logistics_routes" USING "btree" ("unit_id");



CREATE INDEX "idx_manifest_stops_manifest" ON "public"."manifest_stops" USING "btree" ("manifest_id");



CREATE INDEX "idx_manifest_stops_status" ON "public"."manifest_stops" USING "btree" ("status");



CREATE INDEX "idx_nps_responses_survey_id" ON "public"."nps_responses" USING "btree" ("survey_id");



CREATE INDEX "idx_nps_surveys_client_id" ON "public"."nps_surveys" USING "btree" ("client_id");



CREATE INDEX "idx_nps_surveys_sent_at" ON "public"."nps_surveys" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_nps_surveys_unit_id" ON "public"."nps_surveys" USING "btree" ("unit_id");



CREATE INDEX "idx_order_events_order_id" ON "public"."order_events" USING "btree" ("order_id");



CREATE INDEX "idx_order_events_unit_id" ON "public"."order_events" USING "btree" ("unit_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_unit_price" ON "public"."order_items" USING "btree" ("order_id") WHERE ("unit_price" IS NOT NULL);



CREATE INDEX "idx_orders_client_name" ON "public"."orders" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "client_name"));



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_orders_unit_id" ON "public"."orders" USING "btree" ("unit_id");



CREATE INDEX "idx_payables_due" ON "public"."payables" USING "btree" ("unit_id", "due_date");



CREATE INDEX "idx_payables_status" ON "public"."payables" USING "btree" ("unit_id", "status");



CREATE INDEX "idx_payables_unit" ON "public"."payables" USING "btree" ("unit_id");



CREATE INDEX "idx_price_table_unit" ON "public"."price_table" USING "btree" ("unit_id");



CREATE INDEX "idx_price_table_unit_active" ON "public"."price_table" USING "btree" ("unit_id", "active");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_unit_id" ON "public"."profiles" USING "btree" ("unit_id");



CREATE INDEX "idx_quote_items_quote" ON "public"."quote_items" USING "btree" ("quote_id");



CREATE INDEX "idx_quotes_client" ON "public"."quotes" USING "btree" ("client_id");



CREATE INDEX "idx_quotes_status" ON "public"."quotes" USING "btree" ("unit_id", "status");



CREATE INDEX "idx_quotes_unit" ON "public"."quotes" USING "btree" ("unit_id");



CREATE INDEX "idx_receivables_due" ON "public"."receivables" USING "btree" ("unit_id", "due_date");



CREATE INDEX "idx_receivables_status" ON "public"."receivables" USING "btree" ("unit_id", "status");



CREATE INDEX "idx_receivables_unit" ON "public"."receivables" USING "btree" ("unit_id");



CREATE INDEX "idx_recipes_piece_type" ON "public"."recipes" USING "btree" ("piece_type");



CREATE INDEX "idx_recipes_unit_id" ON "public"."recipes" USING "btree" ("unit_id");



CREATE INDEX "idx_route_stops_client_id" ON "public"."route_stops" USING "btree" ("client_id");



CREATE INDEX "idx_route_stops_route_id" ON "public"."route_stops" USING "btree" ("route_id");



CREATE INDEX "idx_shipping_records_event_id" ON "public"."shipping_records" USING "btree" ("order_event_id");



CREATE INDEX "idx_store_goals_unit_date" ON "public"."store_goals" USING "btree" ("unit_id", "date");



CREATE INDEX "idx_submission_comments_sub" ON "public"."submission_comments" USING "btree" ("submission_id");



CREATE INDEX "idx_submissions_briefing" ON "public"."submissions" USING "btree" ("briefing_id");



CREATE INDEX "idx_submissions_status" ON "public"."submissions" USING "btree" ("status");



CREATE INDEX "idx_submissions_writer" ON "public"."submissions" USING "btree" ("writer_id");



CREATE INDEX "idx_washing_records_event_id" ON "public"."washing_records" USING "btree" ("order_event_id");



CREATE INDEX "idx_writer_badges_writer" ON "public"."writer_badges" USING "btree" ("writer_id");



CREATE INDEX "idx_writer_xp_log_writer" ON "public"."writer_xp_log" USING "btree" ("writer_id");



CREATE INDEX "lead_activities_lead_id_idx" ON "public"."lead_activities" USING "btree" ("lead_id");



CREATE INDEX "leads_assigned_to_idx" ON "public"."leads" USING "btree" ("assigned_to");



CREATE INDEX "leads_stage_idx" ON "public"."leads" USING "btree" ("stage");



CREATE INDEX "leads_unit_id_idx" ON "public"."leads" USING "btree" ("unit_id");



CREATE INDEX "maintenance_requests_created_at_idx" ON "public"."maintenance_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "maintenance_requests_equipment_id_idx" ON "public"."maintenance_requests" USING "btree" ("equipment_id");



CREATE INDEX "maintenance_requests_status_idx" ON "public"."maintenance_requests" USING "btree" ("status");



CREATE INDEX "maintenance_requests_unit_id_idx" ON "public"."maintenance_requests" USING "btree" ("unit_id");



CREATE OR REPLACE TRIGGER "leads_updated_at_trigger" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."update_leads_updated_at"();



CREATE OR REPLACE TRIGGER "on_profile_update" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_custom_claims"();



CREATE OR REPLACE TRIGGER "trg_client_prices_enforce_unit" BEFORE INSERT OR UPDATE OF "client_id" ON "public"."client_prices" FOR EACH ROW EXECUTE FUNCTION "public"."client_prices_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_client_prices_updated_at" BEFORE UPDATE ON "public"."client_prices" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_clients_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_crm_notes_enforce_unit" BEFORE INSERT OR UPDATE OF "client_id" ON "public"."crm_notes" FOR EACH ROW EXECUTE FUNCTION "public"."crm_notes_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_daily_manifests_enforce_unit" BEFORE INSERT OR UPDATE OF "route_id" ON "public"."daily_manifests" FOR EACH ROW EXECUTE FUNCTION "public"."daily_manifests_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_daily_manifests_updated_at" BEFORE UPDATE ON "public"."daily_manifests" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_equipment_logs_enforce_unit" BEFORE INSERT OR UPDATE OF "equipment_id", "operator_id", "operator_name" ON "public"."equipment_logs" FOR EACH ROW EXECUTE FUNCTION "public"."equipment_logs_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_logistics_routes_updated_at" BEFORE UPDATE ON "public"."logistics_routes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_nps_surveys_enforce_unit" BEFORE INSERT OR UPDATE OF "client_id" ON "public"."nps_surveys" FOR EACH ROW EXECUTE FUNCTION "public"."nps_surveys_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_payables_updated_at" BEFORE UPDATE ON "public"."payables" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_price_table_updated_at" BEFORE UPDATE ON "public"."price_table" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_quote_items_after_change_del" AFTER DELETE ON "public"."quote_items" FOR EACH ROW EXECUTE FUNCTION "public"."quote_items_after_change"();



CREATE OR REPLACE TRIGGER "trg_quote_items_after_change_ins" AFTER INSERT OR UPDATE ON "public"."quote_items" FOR EACH ROW EXECUTE FUNCTION "public"."quote_items_after_change"();



CREATE OR REPLACE TRIGGER "trg_quotes_enforce_unit" BEFORE INSERT OR UPDATE OF "client_id" ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."quotes_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_quotes_updated_at" BEFORE UPDATE ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_receivables_enforce_unit" BEFORE INSERT OR UPDATE OF "client_id", "quote_id" ON "public"."receivables" FOR EACH ROW EXECUTE FUNCTION "public"."receivables_enforce_unit"();



CREATE OR REPLACE TRIGGER "trg_receivables_updated_at" BEFORE UPDATE ON "public"."receivables" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."briefings"
    ADD CONSTRAINT "briefings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."chemical_movements"
    ADD CONSTRAINT "chemical_movements_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chemical_movements"
    ADD CONSTRAINT "chemical_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."chemical_products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chemical_movements"
    ADD CONSTRAINT "chemical_movements_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chemical_products"
    ADD CONSTRAINT "chemical_products_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_prices"
    ADD CONSTRAINT "client_prices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_prices"
    ADD CONSTRAINT "client_prices_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."copywriter_profiles"
    ADD CONSTRAINT "copywriter_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crm_notes"
    ADD CONSTRAINT "crm_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."crm_notes"
    ADD CONSTRAINT "crm_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crm_notes"
    ADD CONSTRAINT "crm_notes_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_manifests"
    ADD CONSTRAINT "daily_manifests_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."daily_manifests"
    ADD CONSTRAINT "daily_manifests_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."logistics_routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_manifests"
    ADD CONSTRAINT "daily_manifests_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drying_records"
    ADD CONSTRAINT "drying_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id");



ALTER TABLE ONLY "public"."drying_records"
    ADD CONSTRAINT "drying_records_order_event_id_fkey" FOREIGN KEY ("order_event_id") REFERENCES "public"."order_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."equipment_logs"
    ADD CONSTRAINT "equipment_logs_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."equipment_logs"
    ADD CONSTRAINT "equipment_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."equipment_logs"
    ADD CONSTRAINT "equipment_logs_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."equipment"
    ADD CONSTRAINT "equipment_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ironing_records"
    ADD CONSTRAINT "ironing_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id");



ALTER TABLE ONLY "public"."ironing_records"
    ADD CONSTRAINT "ironing_records_order_event_id_fkey" FOREIGN KEY ("order_event_id") REFERENCES "public"."order_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_activities"
    ADD CONSTRAINT "lead_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_converted_client_id_fkey" FOREIGN KEY ("converted_client_id") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."logistics_routes"
    ADD CONSTRAINT "logistics_routes_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."logistics_routes"
    ADD CONSTRAINT "logistics_routes_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_requests"
    ADD CONSTRAINT "maintenance_requests_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_requests"
    ADD CONSTRAINT "maintenance_requests_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_requests"
    ADD CONSTRAINT "maintenance_requests_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."manifest_stops"
    ADD CONSTRAINT "manifest_stops_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."manifest_stops"
    ADD CONSTRAINT "manifest_stops_manifest_id_fkey" FOREIGN KEY ("manifest_id") REFERENCES "public"."daily_manifests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nps_responses"
    ADD CONSTRAINT "nps_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."nps_surveys"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id");



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."order_events"
    ADD CONSTRAINT "order_events_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."payables"
    ADD CONSTRAINT "payables_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."price_table"
    ADD CONSTRAINT "price_table_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE SET NULL NOT VALID;



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receivables"
    ADD CONSTRAINT "receivables_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."receivables"
    ADD CONSTRAINT "receivables_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."receivables"
    ADD CONSTRAINT "receivables_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_chemicals"
    ADD CONSTRAINT "recipe_chemicals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."chemical_products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_chemicals"
    ADD CONSTRAINT "recipe_chemicals_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id");



ALTER TABLE ONLY "public"."route_stops"
    ADD CONSTRAINT "route_stops_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."route_stops"
    ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."logistics_routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shipping_records"
    ADD CONSTRAINT "shipping_records_order_event_id_fkey" FOREIGN KEY ("order_event_id") REFERENCES "public"."order_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_goals"
    ADD CONSTRAINT "store_goals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."store_goals"
    ADD CONSTRAINT "store_goals_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submission_comments"
    ADD CONSTRAINT "submission_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."submission_comments"
    ADD CONSTRAINT "submission_comments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_briefing_id_fkey" FOREIGN KEY ("briefing_id") REFERENCES "public"."briefings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."washing_records"
    ADD CONSTRAINT "washing_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id");



ALTER TABLE ONLY "public"."washing_records"
    ADD CONSTRAINT "washing_records_order_event_id_fkey" FOREIGN KEY ("order_event_id") REFERENCES "public"."order_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."writer_badges"
    ADD CONSTRAINT "writer_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id");



ALTER TABLE ONLY "public"."writer_badges"
    ADD CONSTRAINT "writer_badges_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."writer_xp_log"
    ADD CONSTRAINT "writer_xp_log_writer_id_fkey" FOREIGN KEY ("writer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE "public"."badge_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "badge_definitions_read" ON "public"."badge_definitions" FOR SELECT USING (true);



CREATE POLICY "badges_read" ON "public"."writer_badges" FOR SELECT USING (true);



ALTER TABLE "public"."briefings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "briefings_insert_admin" ON "public"."briefings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"]))))));



CREATE POLICY "briefings_read_admin" ON "public"."briefings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"]))))));



CREATE POLICY "briefings_read_writer" ON "public"."briefings" FOR SELECT USING ((("status" <> 'draft'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'copywriter'::"text"))))));



CREATE POLICY "briefings_update_admin" ON "public"."briefings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"]))))));



ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "campaigns_commercial_select" ON "public"."campaigns" FOR SELECT USING (((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['sdr'::"text", 'closer'::"text"])) AND ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



CREATE POLICY "campaigns_director_all" ON "public"."campaigns" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "campaigns_unit_manager_all" ON "public"."campaigns" USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'unit_manager'::"text") AND ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



ALTER TABLE "public"."chemical_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chemical_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_prices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "client_prices_director_all" ON "public"."client_prices" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "client_prices_unit_all" ON "public"."client_prices" USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "client_prices_unit_delete" ON "public"."client_prices" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "client_prices_unit_insert" ON "public"."client_prices" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "client_prices_unit_select" ON "public"."client_prices" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "client_prices_unit_update" ON "public"."client_prices" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clients_director_all" ON "public"."clients" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "clients_unit_insert" ON "public"."clients" FOR INSERT WITH CHECK (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "clients_unit_select" ON "public"."clients" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "clients_unit_update" ON "public"."clients" FOR UPDATE USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "comments_insert" ON "public"."submission_comments" FOR INSERT WITH CHECK (("author_id" = "auth"."uid"()));



CREATE POLICY "comments_read" ON "public"."submission_comments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."submissions" "s"
  WHERE (("s"."id" = "submission_comments"."submission_id") AND (("s"."writer_id" = "auth"."uid"()) OR ("s"."reviewer_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"])))))));



ALTER TABLE "public"."copywriter_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cp_read" ON "public"."copywriter_profiles" FOR SELECT USING (true);



CREATE POLICY "cp_update_own" ON "public"."copywriter_profiles" FOR UPDATE USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."crm_notes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "crm_notes_director_all" ON "public"."crm_notes" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "crm_notes_unit_delete" ON "public"."crm_notes" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "crm_notes_unit_insert" ON "public"."crm_notes" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "crm_notes_unit_select" ON "public"."crm_notes" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "crm_notes_unit_update" ON "public"."crm_notes" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "crm_notes_unit_write" ON "public"."crm_notes" FOR INSERT WITH CHECK (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."daily_manifests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "director_all" ON "public"."equipment" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_all" ON "public"."recipes" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_all" ON "public"."units" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_chemicals_all" ON "public"."chemical_products" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_logs_delete" ON "public"."equipment_logs" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_logs_select" ON "public"."equipment_logs" FOR SELECT USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_logs_update" ON "public"."equipment_logs" FOR UPDATE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_logs_write" ON "public"."equipment_logs" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_maint_all" ON "public"."maintenance_requests" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_movements_all" ON "public"."chemical_movements" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "director_read_all" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'director'::"text")))));



CREATE POLICY "director_recipe_chemicals_all" ON "public"."recipe_chemicals" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



ALTER TABLE "public"."drying_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."equipment_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ironing_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_activities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lead_activities_closer_insert" ON "public"."lead_activities" FOR INSERT WITH CHECK (((("auth"."jwt"() ->> 'user_role'::"text") = 'closer'::"text") AND ("user_id" = "auth"."uid"())));



CREATE POLICY "lead_activities_closer_select" ON "public"."lead_activities" FOR SELECT USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'closer'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id" = "lead_activities"."lead_id") AND ("l"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"))))));



CREATE POLICY "lead_activities_director_all" ON "public"."lead_activities" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "lead_activities_sdr_insert" ON "public"."lead_activities" FOR INSERT WITH CHECK (((("auth"."jwt"() ->> 'user_role'::"text") = 'sdr'::"text") AND ("user_id" = "auth"."uid"())));



CREATE POLICY "lead_activities_sdr_select" ON "public"."lead_activities" FOR SELECT USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'sdr'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id" = "lead_activities"."lead_id") AND (("l"."assigned_to" = "auth"."uid"()) OR ("l"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")))))));



CREATE POLICY "lead_activities_unit_manager_all" ON "public"."lead_activities" USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'unit_manager'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."leads" "l"
  WHERE (("l"."id" = "lead_activities"."lead_id") AND ("l"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"))))));



ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_closer_select" ON "public"."leads" FOR SELECT USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'closer'::"text") AND ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



CREATE POLICY "leads_closer_update" ON "public"."leads" FOR UPDATE USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'closer'::"text") AND ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



CREATE POLICY "leads_director_all" ON "public"."leads" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "leads_sdr_insert" ON "public"."leads" FOR INSERT WITH CHECK (((("auth"."jwt"() ->> 'user_role'::"text") = 'sdr'::"text") AND ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



CREATE POLICY "leads_sdr_select" ON "public"."leads" FOR SELECT USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'sdr'::"text") AND (("assigned_to" = "auth"."uid"()) OR ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"))));



CREATE POLICY "leads_sdr_update" ON "public"."leads" FOR UPDATE USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'sdr'::"text") AND (("assigned_to" = "auth"."uid"()) OR ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"))));



CREATE POLICY "leads_unit_manager_all" ON "public"."leads" USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'unit_manager'::"text") AND ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



ALTER TABLE "public"."logistics_routes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manifest_stops" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "manifest_stops_director_all" ON "public"."manifest_stops" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "manifest_stops_unit_delete" ON "public"."manifest_stops" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "manifest_stops_unit_insert" ON "public"."manifest_stops" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."daily_manifests" "m"
  WHERE (("m"."id" = "manifest_stops"."manifest_id") AND ("m"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "manifest_stops_unit_select" ON "public"."manifest_stops" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."daily_manifests" "m"
  WHERE (("m"."id" = "manifest_stops"."manifest_id") AND (("m"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "manifest_stops_unit_update" ON "public"."manifest_stops" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."daily_manifests" "m"
  WHERE (("m"."id" = "manifest_stops"."manifest_id") AND ("m"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."daily_manifests" "m"
  WHERE (("m"."id" = "manifest_stops"."manifest_id") AND ("m"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "manifest_stops_unit_write" ON "public"."manifest_stops" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."daily_manifests" "m"
  WHERE (("m"."id" = "manifest_stops"."manifest_id") AND (("m"."unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "manifests_director_all" ON "public"."daily_manifests" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "manifests_unit_delete" ON "public"."daily_manifests" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "manifests_unit_insert" ON "public"."daily_manifests" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "manifests_unit_select" ON "public"."daily_manifests" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "manifests_unit_update" ON "public"."daily_manifests" FOR UPDATE USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "manifests_unit_write" ON "public"."daily_manifests" FOR INSERT WITH CHECK (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."nps_responses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "nps_responses_public_insert" ON "public"."nps_responses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."nps_surveys" "s"
  WHERE ("s"."id" = "nps_responses"."survey_id"))));



CREATE POLICY "nps_responses_read" ON "public"."nps_responses" FOR SELECT USING ((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['director'::"text", 'unit_manager'::"text", 'operator'::"text"])));



CREATE POLICY "nps_responses_unit_read" ON "public"."nps_responses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."nps_surveys" "s"
  WHERE (("s"."id" = "nps_responses"."survey_id") AND (("s"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



ALTER TABLE "public"."nps_surveys" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "nps_surveys_director_all" ON "public"."nps_surveys" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "nps_surveys_insert_staff" ON "public"."nps_surveys" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['director'::"text", 'unit_manager'::"text", 'operator'::"text"])));



CREATE POLICY "nps_surveys_read" ON "public"."nps_surveys" FOR SELECT USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text") OR ((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"])) AND (("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")))));



CREATE POLICY "nps_surveys_unit_delete" ON "public"."nps_surveys" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "nps_surveys_unit_insert" ON "public"."nps_surveys" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "nps_surveys_unit_read" ON "public"."nps_surveys" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "nps_surveys_unit_update" ON "public"."nps_surveys" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."order_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payables" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payables_director_all" ON "public"."payables" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "payables_unit_all" ON "public"."payables" USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "payables_unit_delete" ON "public"."payables" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "payables_unit_insert" ON "public"."payables" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "payables_unit_select" ON "public"."payables" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "payables_unit_update" ON "public"."payables" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."price_table" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "price_table_director_all" ON "public"."price_table" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "price_table_unit_delete" ON "public"."price_table" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "price_table_unit_insert" ON "public"."price_table" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "price_table_unit_select" ON "public"."price_table" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "price_table_unit_update" ON "public"."price_table" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "price_table_unit_write" ON "public"."price_table" USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."quote_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quote_items_director_all" ON "public"."quote_items" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "quote_items_unit_delete" ON "public"."quote_items" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "quote_items_unit_insert" ON "public"."quote_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."quotes" "q"
  WHERE (("q"."id" = "quote_items"."quote_id") AND ("q"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "quote_items_unit_select" ON "public"."quote_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."quotes" "q"
  WHERE (("q"."id" = "quote_items"."quote_id") AND (("q"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "quote_items_unit_update" ON "public"."quote_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."quotes" "q"
  WHERE (("q"."id" = "quote_items"."quote_id") AND ("q"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."quotes" "q"
  WHERE (("q"."id" = "quote_items"."quote_id") AND ("q"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))))));



ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "quotes_director_all" ON "public"."quotes" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "quotes_unit_delete" ON "public"."quotes" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "quotes_unit_insert" ON "public"."quotes" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "quotes_unit_select" ON "public"."quotes" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "quotes_unit_update" ON "public"."quotes" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "quotes_unit_write" ON "public"."quotes" USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "read own profile" ON "public"."profiles" FOR SELECT USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."receivables" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "receivables_director_all" ON "public"."receivables" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "receivables_unit_all" ON "public"."receivables" USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "receivables_unit_delete" ON "public"."receivables" FOR DELETE USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "receivables_unit_insert" ON "public"."receivables" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "receivables_unit_select" ON "public"."receivables" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "receivables_unit_update" ON "public"."receivables" FOR UPDATE USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))) WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



ALTER TABLE "public"."recipe_chemicals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."route_stops" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "route_stops_director_all" ON "public"."route_stops" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "route_stops_unit_delete" ON "public"."route_stops" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."logistics_routes" "r"
  WHERE (("r"."id" = "route_stops"."route_id") AND (("r"."unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "route_stops_unit_insert" ON "public"."route_stops" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."logistics_routes" "r"
  WHERE (("r"."id" = "route_stops"."route_id") AND ("r"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "route_stops_unit_select" ON "public"."route_stops" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."logistics_routes" "r"
  WHERE (("r"."id" = "route_stops"."route_id") AND (("r"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "route_stops_unit_update" ON "public"."route_stops" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."logistics_routes" "r"
  WHERE (("r"."id" = "route_stops"."route_id") AND ("r"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."logistics_routes" "r"
  WHERE (("r"."id" = "route_stops"."route_id") AND ("r"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "route_stops_unit_write" ON "public"."route_stops" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."logistics_routes" "r"
  WHERE (("r"."id" = "route_stops"."route_id") AND (("r"."unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))))));



CREATE POLICY "routes_director_all" ON "public"."logistics_routes" USING ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"));



CREATE POLICY "routes_unit_insert" ON "public"."logistics_routes" FOR INSERT WITH CHECK ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['manager'::"text", 'operator'::"text"]))));



CREATE POLICY "routes_unit_select" ON "public"."logistics_routes" FOR SELECT USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "routes_unit_update" ON "public"."logistics_routes" FOR UPDATE USING (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "routes_unit_write" ON "public"."logistics_routes" FOR INSERT WITH CHECK (((("unit_id")::"text" = ("auth"."jwt"() ->> 'unit_id'::"text")) AND (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['unit_manager'::"text", 'operator'::"text"]))));



CREATE POLICY "self_read" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."shipping_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "store_goals_unit_access" ON "public"."store_goals" USING (("unit_id" IN ( SELECT "profiles"."unit_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



ALTER TABLE "public"."submission_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submissions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "submissions_insert_writer" ON "public"."submissions" FOR INSERT WITH CHECK (("writer_id" = "auth"."uid"()));



CREATE POLICY "submissions_read_admin" ON "public"."submissions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"]))))));



CREATE POLICY "submissions_read_own" ON "public"."submissions" FOR SELECT USING (("writer_id" = "auth"."uid"()));



CREATE POLICY "submissions_update_admin" ON "public"."submissions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"]))))));



CREATE POLICY "submissions_update_own" ON "public"."submissions" FOR UPDATE USING (("writer_id" = "auth"."uid"()));



CREATE POLICY "unit_chemicals_own" ON "public"."chemical_products" USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_clients" ON "public"."clients" USING (((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text") OR ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"))) WITH CHECK (((("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text") OR ("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")));



CREATE POLICY "unit_drying_records" ON "public"."drying_records" FOR SELECT USING (("order_event_id" IN ( SELECT "order_events"."id"
   FROM "public"."order_events"
  WHERE (("order_events"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))));



CREATE POLICY "unit_drying_records_select" ON "public"."drying_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "drying_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_drying_records_update" ON "public"."drying_records" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "drying_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "drying_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_drying_records_write" ON "public"."drying_records" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "drying_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_ironing_records" ON "public"."ironing_records" FOR SELECT USING (("order_event_id" IN ( SELECT "order_events"."id"
   FROM "public"."order_events"
  WHERE (("order_events"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))));



CREATE POLICY "unit_ironing_records_select" ON "public"."ironing_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "ironing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_ironing_records_update" ON "public"."ironing_records" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "ironing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "ironing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_ironing_records_write" ON "public"."ironing_records" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "ironing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_logs_insert" ON "public"."equipment_logs" FOR INSERT WITH CHECK (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_logs_select" ON "public"."equipment_logs" FOR SELECT USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_logs_update" ON "public"."equipment_logs" FOR UPDATE USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")) WITH CHECK (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_maint_own" ON "public"."maintenance_requests" USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_movements_own" ON "public"."chemical_movements" USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_order_events" ON "public"."order_events" USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "unit_order_items" ON "public"."order_items" USING (("order_id" IN ( SELECT "orders"."id"
   FROM "public"."orders"
  WHERE (("orders"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))));



CREATE POLICY "unit_orders" ON "public"."orders" USING ((("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")));



CREATE POLICY "unit_own" ON "public"."equipment" USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_own" ON "public"."units" FOR SELECT USING (("id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_recipe_chemicals_own" ON "public"."recipe_chemicals" USING ((EXISTS ( SELECT 1
   FROM "public"."recipes" "r"
  WHERE (("r"."id" = "recipe_chemicals"."recipe_id") AND ("r"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")))));



CREATE POLICY "unit_recipes_all" ON "public"."recipes" USING (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid")) WITH CHECK (("unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid"));



CREATE POLICY "unit_shipping_records" ON "public"."shipping_records" FOR SELECT USING (("order_event_id" IN ( SELECT "order_events"."id"
   FROM "public"."order_events"
  WHERE (("order_events"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))));



CREATE POLICY "unit_shipping_records_select" ON "public"."shipping_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "shipping_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_shipping_records_update" ON "public"."shipping_records" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "shipping_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "shipping_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_shipping_records_write" ON "public"."shipping_records" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "shipping_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_washing_records" ON "public"."washing_records" FOR SELECT USING (("order_event_id" IN ( SELECT "order_events"."id"
   FROM "public"."order_events"
  WHERE (("order_events"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))));



CREATE POLICY "unit_washing_records_select" ON "public"."washing_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "washing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_washing_records_update" ON "public"."washing_records" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "washing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "washing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



CREATE POLICY "unit_washing_records_write" ON "public"."washing_records" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_events" "oe"
  WHERE (("oe"."id" = "washing_records"."order_event_id") AND (("oe"."unit_id" = (("auth"."jwt"() ->> 'unit_id'::"text"))::"uuid") OR (("auth"."jwt"() ->> 'user_role'::"text") = 'director'::"text"))))));



ALTER TABLE "public"."units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."washing_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."writer_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."writer_xp_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "xp_log_read_admin" ON "public"."writer_xp_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['director'::"text", 'unit_manager'::"text"]))))));



CREATE POLICY "xp_log_read_own" ON "public"."writer_xp_log" FOR SELECT USING (("writer_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."submissions";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";

























































































































































GRANT ALL ON FUNCTION "public"."client_prices_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."client_prices_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."client_prices_enforce_unit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid", "p_equipment_id" "uuid", "p_notes" "text", "p_sector_data" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid", "p_equipment_id" "uuid", "p_notes" "text", "p_sector_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid", "p_equipment_id" "uuid", "p_notes" "text", "p_sector_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_sector"("p_order_id" "uuid", "p_unit_id" "uuid", "p_sector" "text", "p_operator_id" "uuid", "p_equipment_id" "uuid", "p_notes" "text", "p_sector_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."crm_notes_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."crm_notes_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."crm_notes_enforce_unit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."daily_manifests_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."daily_manifests_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."daily_manifests_enforce_unit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."equipment_logs_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."equipment_logs_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."equipment_logs_enforce_unit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_custom_claims"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_custom_claims"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_custom_claims"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."nps_surveys_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."nps_surveys_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."nps_surveys_enforce_unit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."quote_items_after_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."quote_items_after_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."quote_items_after_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."quotes_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."quotes_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."quotes_enforce_unit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."recalc_quote_total"("p_quote_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."recalc_quote_total"("p_quote_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalc_quote_total"("p_quote_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."receivables_enforce_unit"() TO "anon";
GRANT ALL ON FUNCTION "public"."receivables_enforce_unit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."receivables_enforce_unit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_leads_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_leads_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_leads_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."badge_definitions" TO "anon";
GRANT ALL ON TABLE "public"."badge_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."badge_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."briefings" TO "anon";
GRANT ALL ON TABLE "public"."briefings" TO "authenticated";
GRANT ALL ON TABLE "public"."briefings" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."chemical_movements" TO "anon";
GRANT ALL ON TABLE "public"."chemical_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."chemical_movements" TO "service_role";



GRANT ALL ON TABLE "public"."chemical_products" TO "anon";
GRANT ALL ON TABLE "public"."chemical_products" TO "authenticated";
GRANT ALL ON TABLE "public"."chemical_products" TO "service_role";



GRANT ALL ON TABLE "public"."client_prices" TO "anon";
GRANT ALL ON TABLE "public"."client_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."client_prices" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."copywriter_profiles" TO "anon";
GRANT ALL ON TABLE "public"."copywriter_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."copywriter_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."crm_notes" TO "anon";
GRANT ALL ON TABLE "public"."crm_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."crm_notes" TO "service_role";



GRANT ALL ON TABLE "public"."daily_manifests" TO "anon";
GRANT ALL ON TABLE "public"."daily_manifests" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_manifests" TO "service_role";



GRANT ALL ON TABLE "public"."drying_records" TO "anon";
GRANT ALL ON TABLE "public"."drying_records" TO "authenticated";
GRANT ALL ON TABLE "public"."drying_records" TO "service_role";



GRANT ALL ON TABLE "public"."equipment" TO "anon";
GRANT ALL ON TABLE "public"."equipment" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment" TO "service_role";



GRANT ALL ON TABLE "public"."equipment_logs" TO "anon";
GRANT ALL ON TABLE "public"."equipment_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."equipment_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ironing_records" TO "anon";
GRANT ALL ON TABLE "public"."ironing_records" TO "authenticated";
GRANT ALL ON TABLE "public"."ironing_records" TO "service_role";



GRANT ALL ON TABLE "public"."lead_activities" TO "anon";
GRANT ALL ON TABLE "public"."lead_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_activities" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."logistics_routes" TO "anon";
GRANT ALL ON TABLE "public"."logistics_routes" TO "authenticated";
GRANT ALL ON TABLE "public"."logistics_routes" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_requests" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_requests" TO "service_role";



GRANT ALL ON TABLE "public"."manifest_stops" TO "anon";
GRANT ALL ON TABLE "public"."manifest_stops" TO "authenticated";
GRANT ALL ON TABLE "public"."manifest_stops" TO "service_role";



GRANT ALL ON TABLE "public"."nps_responses" TO "anon";
GRANT ALL ON TABLE "public"."nps_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."nps_responses" TO "service_role";



GRANT ALL ON TABLE "public"."nps_surveys" TO "anon";
GRANT ALL ON TABLE "public"."nps_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."nps_surveys" TO "service_role";



GRANT ALL ON TABLE "public"."order_events" TO "anon";
GRANT ALL ON TABLE "public"."order_events" TO "authenticated";
GRANT ALL ON TABLE "public"."order_events" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payables" TO "anon";
GRANT ALL ON TABLE "public"."payables" TO "authenticated";
GRANT ALL ON TABLE "public"."payables" TO "service_role";



GRANT ALL ON TABLE "public"."price_table" TO "anon";
GRANT ALL ON TABLE "public"."price_table" TO "authenticated";
GRANT ALL ON TABLE "public"."price_table" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quote_items" TO "anon";
GRANT ALL ON TABLE "public"."quote_items" TO "authenticated";
GRANT ALL ON TABLE "public"."quote_items" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."receivables" TO "anon";
GRANT ALL ON TABLE "public"."receivables" TO "authenticated";
GRANT ALL ON TABLE "public"."receivables" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_chemicals" TO "anon";
GRANT ALL ON TABLE "public"."recipe_chemicals" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_chemicals" TO "service_role";



GRANT ALL ON TABLE "public"."recipes" TO "anon";
GRANT ALL ON TABLE "public"."recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipes" TO "service_role";



GRANT ALL ON TABLE "public"."route_stops" TO "anon";
GRANT ALL ON TABLE "public"."route_stops" TO "authenticated";
GRANT ALL ON TABLE "public"."route_stops" TO "service_role";



GRANT ALL ON TABLE "public"."shipping_records" TO "anon";
GRANT ALL ON TABLE "public"."shipping_records" TO "authenticated";
GRANT ALL ON TABLE "public"."shipping_records" TO "service_role";



GRANT ALL ON TABLE "public"."staff" TO "anon";
GRANT ALL ON TABLE "public"."staff" TO "authenticated";
GRANT ALL ON TABLE "public"."staff" TO "service_role";



GRANT ALL ON TABLE "public"."store_goals" TO "anon";
GRANT ALL ON TABLE "public"."store_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."store_goals" TO "service_role";



GRANT ALL ON TABLE "public"."submission_comments" TO "anon";
GRANT ALL ON TABLE "public"."submission_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."submission_comments" TO "service_role";



GRANT ALL ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."submissions" TO "service_role";



GRANT ALL ON TABLE "public"."units" TO "anon";
GRANT ALL ON TABLE "public"."units" TO "authenticated";
GRANT ALL ON TABLE "public"."units" TO "service_role";



GRANT ALL ON TABLE "public"."washing_records" TO "anon";
GRANT ALL ON TABLE "public"."washing_records" TO "authenticated";
GRANT ALL ON TABLE "public"."washing_records" TO "service_role";



GRANT ALL ON TABLE "public"."writer_badges" TO "anon";
GRANT ALL ON TABLE "public"."writer_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."writer_badges" TO "service_role";



GRANT ALL ON TABLE "public"."writer_xp_log" TO "anon";
GRANT ALL ON TABLE "public"."writer_xp_log" TO "authenticated";
GRANT ALL ON TABLE "public"."writer_xp_log" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































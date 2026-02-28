-- =========================================================
-- Migration: 025_atomic_rpc.sql
-- Criado: 2026-02-27 | @data-engineer (Dara) — Auditoria de Segurança
--
-- RPC para completar setor atomicamente.
-- Substitui as 3+ queries separadas em complete-sector.ts
-- por uma única transação PostgreSQL.
-- =========================================================

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  complete_sector — Transição atômica de setor                     ║
-- ║                                                                    ║
-- ║  Garante que:                                                      ║
-- ║  1. O status da order é verificado antes de mudar                 ║
-- ║  2. O status é atualizado                                         ║
-- ║  3. O order_event de saída é registrado                           ║
-- ║  4. O record específico do setor é inserido                       ║
-- ║  5. O log de uso de equipamento é registrado (se aplicável)       ║
-- ║  Tudo em uma única transação — falha em qualquer passo = rollback ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION complete_sector(
  p_order_id       UUID,
  p_unit_id        UUID,
  p_sector         TEXT,           -- 'washing' | 'drying' | 'ironing' | 'shipping'
  p_operator_id    UUID DEFAULT NULL,
  p_equipment_id   UUID DEFAULT NULL,
  p_notes          TEXT DEFAULT NULL,
  p_sector_data    JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Permissões: apenas authenticated pode chamar
REVOKE ALL ON FUNCTION complete_sector FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_sector TO authenticated;
GRANT EXECUTE ON FUNCTION complete_sector TO service_role;

-- Comentário da função
COMMENT ON FUNCTION complete_sector IS
  'Completa um setor de produção atomicamente: atualiza status da order, registra evento de saída, insere record específico do setor e log de equipamento. Tudo em uma transação.';

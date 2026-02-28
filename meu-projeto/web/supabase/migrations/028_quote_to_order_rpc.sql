-- 028_quote_to_order_rpc.sql
-- RPC atômica para aprovação de orçamento com criação de comanda
-- Corrige: non-transactional quote-to-order (E5.1 QA concern)

CREATE OR REPLACE FUNCTION approve_quote_create_order(
  p_quote_id UUID,
  p_unit_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote RECORD;
  v_first_item RECORD;
  v_order_id UUID;
BEGIN
  -- Busca orçamento com validação
  SELECT q.id, q.status, q.client_id, c.name AS client_name
  INTO v_quote
  FROM quotes q
  JOIN clients c ON c.id = q.client_id
  WHERE q.id = p_quote_id
    AND q.unit_id = p_unit_id
    AND q.status = 'sent';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orçamento não encontrado ou não está no status "enviado"';
  END IF;

  -- Busca primeiro item do orçamento
  SELECT piece_type, quantity
  INTO v_first_item
  FROM quote_items
  WHERE quote_id = p_quote_id
  ORDER BY created_at
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orçamento sem itens';
  END IF;

  -- Cria comanda
  INSERT INTO orders (unit_id, client_name, piece_type, piece_count, status, notes)
  VALUES (
    p_unit_id,
    v_quote.client_name,
    v_first_item.piece_type,
    v_first_item.quantity,
    'received',
    'Gerado do orçamento #' || LEFT(p_quote_id::TEXT, 8)
  )
  RETURNING id INTO v_order_id;

  -- Atualiza orçamento atomicamente
  UPDATE quotes
  SET status = 'approved',
      order_id = v_order_id,
      updated_at = NOW()
  WHERE id = p_quote_id;

  RETURN v_order_id;
END;
$$;

-- Fix RLS: restringir DELETE em price_table para unit_manager/operator
-- Operator e manager não devem poder deletar preços, apenas inserir/atualizar

DROP POLICY IF EXISTS "price_table_unit_write" ON price_table;

CREATE POLICY "price_table_unit_insert" ON price_table
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager')
  );

CREATE POLICY "price_table_unit_update" ON price_table
  FOR UPDATE USING (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager')
  );

-- Nota: DELETE em price_table agora só é permitido via director (policy "price_table_director_all")
-- Operator não pode mais modificar price_table (apenas SELECT via "price_table_unit_select")

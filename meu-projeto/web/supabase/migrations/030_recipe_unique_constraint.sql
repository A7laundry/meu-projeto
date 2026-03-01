-- ================================================
-- 030: Unique constraint para receitas (nome + tipo por unidade)
-- ================================================

-- Remove duplicatas se existirem (mantém a mais recente)
DELETE FROM recipes a
USING recipes b
WHERE a.unit_id = b.unit_id
  AND a.name = b.name
  AND a.piece_type = b.piece_type
  AND a.created_at < b.created_at;

-- Adiciona constraint unique
ALTER TABLE recipes
  ADD CONSTRAINT recipes_unit_name_type_unique
  UNIQUE (unit_id, name, piece_type);

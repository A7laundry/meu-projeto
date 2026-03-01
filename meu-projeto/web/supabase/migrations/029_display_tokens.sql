-- ================================================
-- 029: Display tokens para acesso público TV
-- ================================================

CREATE TABLE display_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id    UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  label      TEXT DEFAULT 'TV Principal',
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Índice para lookup rápido por token
CREATE INDEX idx_display_tokens_token ON display_tokens(token) WHERE active = TRUE;

-- RLS
ALTER TABLE display_tokens ENABLE ROW LEVEL SECURITY;

-- Manager pode gerenciar tokens da sua unidade
CREATE POLICY "display_tokens_unit_select" ON display_tokens
  FOR SELECT USING (
    unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director')
  );

CREATE POLICY "display_tokens_unit_insert" ON display_tokens
  FOR INSERT WITH CHECK (
    unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND role IN ('unit_manager', 'director'))
  );

CREATE POLICY "display_tokens_unit_delete" ON display_tokens
  FOR DELETE USING (
    unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND role IN ('unit_manager', 'director'))
  );

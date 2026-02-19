-- 013_crm_notes.sql
-- Notas de atendimento CRM por cliente

CREATE TABLE crm_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES staff(id) ON DELETE SET NULL,
  category    TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('visit', 'call', 'email', 'other')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_notes_client ON crm_notes(client_id);
CREATE INDEX idx_crm_notes_unit ON crm_notes(unit_id);

-- RLS
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_notes_director_all" ON crm_notes
  FOR ALL USING (auth.jwt() ->> 'user_role' = 'director');

CREATE POLICY "crm_notes_unit_select" ON crm_notes
  FOR SELECT USING (unit_id::TEXT = (auth.jwt() ->> 'unit_id'));

CREATE POLICY "crm_notes_unit_write" ON crm_notes
  FOR INSERT WITH CHECK (
    unit_id::TEXT = (auth.jwt() ->> 'unit_id')
    AND (auth.jwt() ->> 'user_role') IN ('manager', 'operator')
  );

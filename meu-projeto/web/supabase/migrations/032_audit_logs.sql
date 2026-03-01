-- Migration 032: Audit Logs — FR-E1-04
-- Registro de quem fez o quê, quando

CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id     uuid REFERENCES units(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  user_name   text NOT NULL DEFAULT '',
  action      text NOT NULL,           -- ex: 'order.create', 'order.status_change', 'equipment.maintenance'
  entity_type text NOT NULL,           -- ex: 'order', 'equipment', 'client', 'recipe'
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',      -- dados adicionais (old_status, new_status, etc.)
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_logs_unit ON audit_logs(unit_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Directors: leem todos os logs
CREATE POLICY "audit_logs_director_select" ON audit_logs
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'director'
  );

-- Unit managers: leem logs da sua unidade
CREATE POLICY "audit_logs_manager_select" ON audit_logs
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'unit_manager'
    AND unit_id::text = (auth.jwt() ->> 'unit_id')
  );

-- Insert: qualquer usuário autenticado pode gerar log (via admin client)
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

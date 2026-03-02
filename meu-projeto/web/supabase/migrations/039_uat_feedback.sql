-- Tabela de feedback UAT para testadores reportarem bugs, melhorias e pontos positivos
-- Usado durante o período de testes com equipe operacional

CREATE TABLE IF NOT EXISTS uat_feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id),
  user_name     text NOT NULL,
  user_role     text NOT NULL,
  user_sector   text,
  category      text NOT NULL CHECK (category IN ('bug', 'improvement', 'missing_feature', 'positive')),
  severity      text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  page_section  text NOT NULL,
  description   text NOT NULL,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE uat_feedback IS 'Feedback de testadores UAT durante período de testes';
COMMENT ON COLUMN uat_feedback.category IS 'bug | improvement | missing_feature | positive';
COMMENT ON COLUMN uat_feedback.severity IS 'low | medium | high | critical (obrigatório apenas para bugs)';
COMMENT ON COLUMN uat_feedback.status IS 'open | in_progress | resolved | closed';

-- Índices para consultas frequentes
CREATE INDEX idx_uat_feedback_user_id ON uat_feedback(user_id);
CREATE INDEX idx_uat_feedback_status ON uat_feedback(status);
CREATE INDEX idx_uat_feedback_category ON uat_feedback(category);
CREATE INDEX idx_uat_feedback_created_at ON uat_feedback(created_at DESC);

-- RLS
ALTER TABLE uat_feedback ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode inserir feedback próprio
CREATE POLICY "Users can insert own feedback"
  ON uat_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários veem apenas seu próprio feedback
CREATE POLICY "Users can view own feedback"
  ON uat_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Diretores veem todos os feedbacks
CREATE POLICY "Directors can view all feedback"
  ON uat_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'director'
    )
  );

-- Diretores podem atualizar qualquer feedback (status, admin_notes)
CREATE POLICY "Directors can update any feedback"
  ON uat_feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'director'
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_uat_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_uat_feedback_updated_at
  BEFORE UPDATE ON uat_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_uat_feedback_updated_at();

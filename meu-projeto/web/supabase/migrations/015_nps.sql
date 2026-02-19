-- Migration 015: NPS (Net Promoter Score) por unidade
-- FR-E7-06

CREATE TABLE IF NOT EXISTS nps_surveys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id     UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nps_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   UUID NOT NULL REFERENCES nps_surveys(id) ON DELETE CASCADE,
  score       SMALLINT NOT NULL CHECK (score >= 0 AND score <= 10),
  comment     TEXT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (survey_id)  -- uma resposta por survey
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nps_surveys_unit_id ON nps_surveys(unit_id);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_sent_at ON nps_surveys(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_responses_survey_id ON nps_responses(survey_id);

-- RLS
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

-- Surveys: leitura para staff da unidade e director
CREATE POLICY "nps_surveys_read" ON nps_surveys
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') IN ('director', 'admin') OR
    ((auth.jwt() ->> 'user_role') = 'staff' AND unit_id::text = (auth.jwt() ->> 'unit_id'))
  );

CREATE POLICY "nps_surveys_insert_admin" ON nps_surveys
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_role') IN ('director', 'admin', 'staff')
  );

-- Responses: INSERT público (sem auth — link de pesquisa)
CREATE POLICY "nps_responses_insert_public" ON nps_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "nps_responses_read" ON nps_responses
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') IN ('director', 'admin', 'staff')
  );

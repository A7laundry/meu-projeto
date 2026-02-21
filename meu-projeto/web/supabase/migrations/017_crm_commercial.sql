-- =========================================================
-- 017_crm_commercial.sql
-- Módulo Comercial (CRM): Leads, Atividades, Campanhas
-- =========================================================

-- Leads (pipeline comercial)
CREATE TABLE IF NOT EXISTS leads (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id                 UUID REFERENCES units(id),
  name                    TEXT NOT NULL,
  company                 TEXT,
  email                   TEXT,
  phone                   TEXT,
  type                    TEXT DEFAULT 'business', -- business|personal
  source                  TEXT DEFAULT 'manual',   -- instagram|google|referral|cold_call|whatsapp|form|manual
  stage                   TEXT DEFAULT 'prospect', -- prospect|contacted|qualified|proposal|won|lost
  assigned_to             UUID REFERENCES profiles(id),
  estimated_monthly_value NUMERIC DEFAULT 0,
  notes                   TEXT,
  lost_reason             TEXT,
  converted_client_id     UUID REFERENCES clients(id),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Atividades do lead (timeline de interações)
CREATE TABLE IF NOT EXISTS lead_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id),
  type        TEXT NOT NULL, -- note|call|whatsapp|email|meeting|stage_change|proposal
  description TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campanhas de marketing
CREATE TABLE IF NOT EXISTS campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id          UUID REFERENCES units(id),
  name             TEXT NOT NULL,
  channel          TEXT NOT NULL, -- instagram|google|whatsapp|email|referral|offline
  objective        TEXT DEFAULT 'leads', -- leads|brand|retention
  budget           NUMERIC DEFAULT 0,
  spent            NUMERIC DEFAULT 0,
  leads_generated  INTEGER DEFAULT 0,
  conversions      INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active', -- active|paused|completed
  starts_at        DATE NOT NULL,
  ends_at          DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS leads_stage_idx       ON leads(stage);
CREATE INDEX IF NOT EXISTS leads_unit_id_idx     ON leads(unit_id);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS lead_activities_lead_id_idx ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS campaigns_unit_id_idx ON campaigns(unit_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx  ON campaigns(status);

-- Trigger: atualizar updated_at nos leads automaticamente
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at_trigger ON leads;
CREATE TRIGGER leads_updated_at_trigger
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();

-- RLS: desabilitar (acesso via service role key no backend)
ALTER TABLE leads           DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns       DISABLE ROW LEVEL SECURITY;

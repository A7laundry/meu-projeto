-- Migration 037: Tabela de alertas executivos persistidos
-- Evita re-disparo usando UNIQUE por day + category

CREATE TABLE IF NOT EXISTS executive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('warning', 'critical')),
  message TEXT NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Um alerta por categoria por dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_executive_alerts_day_cat
  ON executive_alerts(alert_date, category, level);

-- RLS
ALTER TABLE executive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directors can read all executive alerts"
  ON executive_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'director'
    )
  );

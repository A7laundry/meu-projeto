-- Migration 034: Campo de assinatura digital nas paradas
-- FR-E4-05/06: Assinatura digital na coleta/entrega

ALTER TABLE manifest_stops
  ADD COLUMN IF NOT EXISTS signature_url TEXT;

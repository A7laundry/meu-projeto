-- 021_client_portal_profile_link.sql
-- Liga um usuário (profile) ao seu registro de cliente no CRM
-- Necessário para o portal do cliente mostrar apenas as suas próprias comandas

-- Adiciona profile_id na tabela clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Índice para lookup rápido no portal
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON clients(profile_id) WHERE profile_id IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN clients.profile_id IS
  'Vincula o registro do cliente ao perfil de usuário (auth). Usado pelo portal do cliente para filtrar suas próprias comandas.';

-- 018_copywriter_portal.sql
-- Portal Gamificado — Squad de Copywriters
-- 7 tabelas + seed de badges + alteração de constraint de role

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  1. Alterar constraint de role em profiles para incluir copywriter ║
-- ╚════════════════════════════════════════════════════════════════════╝

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('director','unit_manager','operator','driver','store','customer','sdr','closer','copywriter'));

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  2. badge_definitions — catálogo estático de badges               ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE badge_definitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  icon        text NOT NULL DEFAULT '🏅',
  rarity      text NOT NULL CHECK (rarity IN ('common','rare','epic','legendary')),
  category    text NOT NULL CHECK (category IN ('milestone','quality','streak','speed','xp')),
  condition   jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  3. copywriter_profiles — perfil estendido do redator             ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE copywriter_profiles (
  id              uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio             text DEFAULT '',
  specialties     text[] DEFAULT '{}',
  total_xp        integer NOT NULL DEFAULT 0,
  current_streak  integer NOT NULL DEFAULT 0,
  best_streak     integer NOT NULL DEFAULT 0,
  missions_done   integer NOT NULL DEFAULT 0,
  avg_score       numeric(4,1) NOT NULL DEFAULT 0,
  last_submission  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  4. briefings — missões criadas pelo admin                        ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE briefings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text NOT NULL,
  content_type    text NOT NULL CHECK (content_type IN ('blog','social','email','ad','landing','video_script','press','other')),
  difficulty      text NOT NULL CHECK (difficulty IN ('easy','medium','hard','expert')),
  xp_reward       integer NOT NULL DEFAULT 50,
  max_writers     integer NOT NULL DEFAULT 1,
  word_limit      integer,
  deadline        timestamptz,
  reference_links text[] DEFAULT '{}',
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','in_progress','completed','cancelled')),
  created_by      uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  5. submissions — entregas dos redatores                          ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id     uuid NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
  writer_id       uuid NOT NULL REFERENCES profiles(id),
  content         text NOT NULL DEFAULT '',
  word_count      integer NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed','submitted','revision','approved','rejected')),
  score           integer CHECK (score >= 0 AND score <= 100),
  reviewer_id     uuid REFERENCES profiles(id),
  reviewed_at     timestamptz,
  submitted_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(briefing_id, writer_id)
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  6. submission_comments — thread de feedback                      ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE submission_comments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES profiles(id),
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  7. writer_xp_log — histórico de XP                              ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE writer_xp_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id       uuid NOT NULL REFERENCES profiles(id),
  amount          integer NOT NULL,
  reason          text NOT NULL,
  source_id       uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  8. writer_badges — badges conquistados                           ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE TABLE writer_badges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id       uuid NOT NULL REFERENCES profiles(id),
  badge_id        uuid NOT NULL REFERENCES badge_definitions(id),
  awarded_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(writer_id, badge_id)
);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  Índices                                                          ║
-- ╚════════════════════════════════════════════════════════════════════╝

CREATE INDEX idx_briefings_status ON briefings(status);
CREATE INDEX idx_briefings_created_by ON briefings(created_by);
CREATE INDEX idx_submissions_briefing ON submissions(briefing_id);
CREATE INDEX idx_submissions_writer ON submissions(writer_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_writer_xp_log_writer ON writer_xp_log(writer_id);
CREATE INDEX idx_writer_badges_writer ON writer_badges(writer_id);
CREATE INDEX idx_submission_comments_sub ON submission_comments(submission_id);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  RLS                                                              ║
-- ╚════════════════════════════════════════════════════════════════════╝

ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copywriter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_badges ENABLE ROW LEVEL SECURITY;

-- badge_definitions: leitura pública
CREATE POLICY "badge_definitions_read" ON badge_definitions FOR SELECT USING (true);

-- copywriter_profiles: leitura pública, update apenas pelo próprio
CREATE POLICY "cp_read" ON copywriter_profiles FOR SELECT USING (true);
CREATE POLICY "cp_update_own" ON copywriter_profiles FOR UPDATE
  USING (id = auth.uid());

-- briefings: redatores vêem apenas published+, admins vêem tudo
CREATE POLICY "briefings_read_admin" ON briefings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );
CREATE POLICY "briefings_read_writer" ON briefings FOR SELECT
  USING (
    status <> 'draft'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'copywriter')
  );
CREATE POLICY "briefings_insert_admin" ON briefings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );
CREATE POLICY "briefings_update_admin" ON briefings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );

-- submissions: redator vê as suas, admin vê todas
CREATE POLICY "submissions_read_own" ON submissions FOR SELECT
  USING (writer_id = auth.uid());
CREATE POLICY "submissions_read_admin" ON submissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );
CREATE POLICY "submissions_insert_writer" ON submissions FOR INSERT
  WITH CHECK (writer_id = auth.uid());
CREATE POLICY "submissions_update_own" ON submissions FOR UPDATE
  USING (writer_id = auth.uid());
CREATE POLICY "submissions_update_admin" ON submissions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );

-- submission_comments: quem participa da submission lê/escreve
CREATE POLICY "comments_read" ON submission_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_id AND (s.writer_id = auth.uid() OR s.reviewer_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );
CREATE POLICY "comments_insert" ON submission_comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- writer_xp_log: redator vê o seu
CREATE POLICY "xp_log_read_own" ON writer_xp_log FOR SELECT
  USING (writer_id = auth.uid());
CREATE POLICY "xp_log_read_admin" ON writer_xp_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director','unit_manager'))
  );

-- writer_badges: leitura pública (leaderboard)
CREATE POLICY "badges_read" ON writer_badges FOR SELECT USING (true);

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  Seed — 14 badges                                                 ║
-- ╚════════════════════════════════════════════════════════════════════╝

INSERT INTO badge_definitions (slug, name, description, icon, rarity, category, condition) VALUES
  ('first_mission',    'Primeira Missão',   'Completou a primeira missão',          '🎯', 'common',    'milestone', '{"missions_done": 1}'),
  ('adventurer',       'Aventureiro',       'Completou 5 missões',                  '🗺️', 'common',    'milestone', '{"missions_done": 5}'),
  ('veteran',          'Veterano',          'Completou 10 missões',                 '⚔️', 'rare',      'milestone', '{"missions_done": 10}'),
  ('hero',             'Herói',             'Completou 25 missões',                 '🛡️', 'epic',      'milestone', '{"missions_done": 25}'),
  ('legend',           'Lenda',             'Completou 50 missões',                 '👑', 'legendary', 'milestone', '{"missions_done": 50}'),
  ('perfectionist',    'Perfeccionista',    'Recebeu score 100 em uma missão',      '💎', 'rare',      'quality',   '{"perfect_score": true}'),
  ('master_artisan',   'Mestre Artesão',    'Recebeu 5 scores perfeitos',           '🔮', 'epic',      'quality',   '{"perfect_count": 5}'),
  ('on_fire',          'Em Chamas',         '3 dias consecutivos de entregas',      '🔥', 'common',    'streak',    '{"streak": 3}'),
  ('unstoppable',      'Imparável',         '7 dias consecutivos de entregas',      '⚡', 'rare',      'streak',    '{"streak": 7}'),
  ('machine',          'Máquina',           '30 dias consecutivos de entregas',     '🤖', 'legendary', 'streak',    '{"streak": 30}'),
  ('speedster',        'Velocista',         'Entregou uma missão em menos de 1h',   '💨', 'rare',      'speed',     '{"hours_under": 1}'),
  ('rising',           'Ascendente',        'Alcançou 500 XP',                      '📈', 'common',    'xp',        '{"total_xp": 500}'),
  ('expert_xp',        'Expert',            'Alcançou 1500 XP',                     '🏆', 'epic',      'xp',        '{"total_xp": 1500}'),
  ('supreme_master',   'Mestre Supremo',    'Alcançou 3000 XP',                     '✨', 'legendary', 'xp',        '{"total_xp": 3000}');

-- ╔════════════════════════════════════════════════════════════════════╗
-- ║  Realtime — habilitar para submissions                            ║
-- ╚════════════════════════════════════════════════════════════════════╝

ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

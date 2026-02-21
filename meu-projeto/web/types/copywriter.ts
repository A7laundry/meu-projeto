// ── Tipos do Portal Gamificado de Copywriters ──────────────────────

export type ContentType =
  | 'blog'
  | 'social'
  | 'email'
  | 'ad'
  | 'landing'
  | 'video_script'
  | 'press'
  | 'other'

export type BriefingDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type BriefingStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'

export type SubmissionStatus = 'claimed' | 'submitted' | 'revision' | 'approved' | 'rejected'

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type BadgeCategory = 'milestone' | 'quality' | 'streak' | 'speed' | 'xp'

export type WriterLevel = 0 | 1 | 2 | 3 | 4 | 5

export const LEVEL_THRESHOLDS: { level: WriterLevel; xp: number; title: string }[] = [
  { level: 0, xp: 0,    title: 'Novato' },
  { level: 1, xp: 100,  title: 'Aprendiz' },
  { level: 2, xp: 300,  title: 'Redator' },
  { level: 3, xp: 700,  title: 'Sênior' },
  { level: 4, xp: 1500, title: 'Expert' },
  { level: 5, xp: 3000, title: 'Mestre' },
]

export interface BadgeDefinition {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  rarity: BadgeRarity
  category: BadgeCategory
  condition: Record<string, unknown>
  created_at: string
}

export interface CopywriterProfile {
  id: string
  bio: string
  specialties: string[]
  total_xp: number
  current_streak: number
  best_streak: number
  missions_done: number
  avg_score: number
  last_submission: string | null
  created_at: string
  updated_at: string
  // join
  profile?: { full_name: string; role: string }
}

export interface Briefing {
  id: string
  title: string
  description: string
  content_type: ContentType
  difficulty: BriefingDifficulty
  xp_reward: number
  max_writers: number
  word_limit: number | null
  deadline: string | null
  reference_links: string[]
  status: BriefingStatus
  created_by: string
  created_at: string
  updated_at: string
  // counts
  submissions_count?: number
  creator?: { full_name: string }
}

export interface Submission {
  id: string
  briefing_id: string
  writer_id: string
  content: string
  word_count: number
  status: SubmissionStatus
  score: number | null
  reviewer_id: string | null
  reviewed_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  // joins
  briefing?: Briefing
  writer?: { full_name: string }
  reviewer?: { full_name: string }
}

export interface SubmissionComment {
  id: string
  submission_id: string
  author_id: string
  content: string
  created_at: string
  author?: { full_name: string }
}

export interface WriterXpLog {
  id: string
  writer_id: string
  amount: number
  reason: string
  source_id: string | null
  created_at: string
}

export interface WriterBadge {
  id: string
  writer_id: string
  badge_id: string
  awarded_at: string
  badge?: BadgeDefinition
}

export interface WriterStats {
  profile: CopywriterProfile
  level: WriterLevel
  levelTitle: string
  xpToNext: number
  xpProgress: number
  badges: WriterBadge[]
  recentXp: WriterXpLog[]
}

export interface LeaderboardEntry {
  rank: number
  writerId: string
  name: string
  totalXp: number
  level: WriterLevel
  levelTitle: string
  missionsDone: number
  currentStreak: number
  badgeCount: number
}

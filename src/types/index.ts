export type UserRole = 'player' | 'admin'
export type TournamentStatus = 'registration_open' | 'registration_closed' | 'live' | 'completed'
export type MatchStatus = 'pending' | 'awaiting_results' | 'disputed' | 'referee_review' | 'completed' | 'walkover'
export type SubmissionStatus = 'pending' | 'submitted'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'resubmission_requested'
export type NotificationType =
  | 'tournament_accepted'
  | 'match_assigned'
  | 'result_approved'
  | 'result_rejected'
  | 'tournament_started'
  | 'tournament_finished'
  | 'dispute_raised'
  | 'default_win'

export interface Profile {
  id: string
  username: string
  display_name: string
  efootball_uid: string | null
  country: string
  avatar_url: string | null
  role: UserRole
  is_suspended: boolean
  total_matches: number
  total_wins: number
  total_losses: number
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  description: string | null
  banner_url: string | null
  max_players: number
  current_players: number
  registration_deadline: string
  start_date: string
  rules: string | null
  prize_info: string | null
  status: TournamentStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TournamentRegistration {
  id: string
  tournament_id: string
  player_id: string
  registered_at: string
  seed_number: number | null
  profile?: Profile
}

export interface Bracket {
  id: string
  tournament_id: string
  total_rounds: number
  generated_at: string
}

export interface Match {
  id: string
  tournament_id: string
  bracket_id: string | null
  round_number: number
  match_number: number
  player_a_id: string | null
  player_b_id: string | null
  winner_id: string | null
  status: MatchStatus
  next_match_id: string | null
  result_deadline: string | null
  created_at: string
  updated_at: string
  player_a?: Profile
  player_b?: Profile
  winner?: Profile
}

export interface MatchSubmission {
  id: string
  match_id: string
  submitted_by: string
  claimed_winner_id: string
  screenshot_url: string
  submitted_at: string
  status: SubmissionStatus
  submitter?: Profile
  claimed_winner?: Profile
}

export interface RefereeReview {
  id: string
  match_id: string
  reviewed_by: string | null
  decision: ReviewStatus
  notes: string | null
  created_at: string
  resolved_at: string | null
  reviewer?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  related_tournament_id: string | null
  related_match_id: string | null
  created_at: string
}

export interface BracketRound {
  round: number
  matches: Match[]
}

export interface TournamentWithStats extends Tournament {
  registrations?: TournamentRegistration[]
  brackets?: Bracket
}

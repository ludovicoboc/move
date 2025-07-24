export interface LeisureActivity {
  id: string
  user_id: string
  name: string
  description?: string
  category: string
  duration_minutes?: number
  difficulty_level: "facil" | "medio" | "dificil"
  location?: string
  equipment_needed?: string[]
  energy_required: "baixa" | "media" | "alta"
  mood_boost: number
  favorite: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface LeisureSession {
  id: string
  user_id: string
  activity_id?: string
  activity_name: string
  duration_minutes: number
  enjoyment_rating?: number
  notes?: string
  session_date: string
  started_at: string
  completed_at?: string
  created_at: string
  activity?: LeisureActivity
}

export interface RestSuggestion {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  duration_minutes: number
  instructions?: string[]
  benefits?: string[]
  difficulty_level: "facil" | "medio" | "dificil"
  is_custom: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface LeisurePreferences {
  id: string
  user_id: string
  default_timer_duration: number
  favorite_categories?: string[]
  preferred_time_slots?: string[]
  energy_level_preference: string
  notification_enabled: boolean
  weekly_leisure_goal: number
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  timezone: string
  language: string
  created_at: string
  updated_at: string
}

export interface AccessibilityPreferences {
  id: string
  user_id: string
  high_contrast: boolean
  reduced_stimuli: boolean
  large_text: boolean
  text_size_multiplier: number
  color_blind_support: string | null
  reduced_motion: boolean
  keyboard_navigation: boolean
  screen_reader_support: boolean
  focus_indicators: boolean
  created_at: string
  updated_at: string
}

export interface ThemePreferences {
  id: string
  user_id: string
  theme_mode: "light" | "dark" | "system"
  primary_color: string
  accent_color: string
  sidebar_style: "default" | "compact" | "minimal"
  card_style: "default" | "bordered" | "elevated"
  animation_level: "none" | "reduced" | "normal" | "enhanced"
  created_at: string
  updated_at: string
}

export interface DailyGoals {
  id: string
  user_id: string
  sleep_hours: number
  water_glasses: number
  priority_tasks: number
  scheduled_breaks: number
  study_hours: number
  exercise_minutes: number
  meditation_minutes: number
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  visual_reminders: boolean
  scheduled_breaks: boolean
  task_reminders: boolean
  meal_reminders: boolean
  sleep_reminders: boolean
  study_reminders: boolean
  email_notifications: boolean
  push_notifications: boolean
  sound_notifications: boolean
  vibration_notifications: boolean
  created_at: string
  updated_at: string
}

export interface ProfileData {
  profile: UserProfile
  accessibility: AccessibilityPreferences
  theme: ThemePreferences
  goals: DailyGoals
  notifications: NotificationPreferences
}

export const AVAILABLE_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
]

export const TIMEZONES = [
  { label: "São Paulo (UTC-3)", value: "America/Sao_Paulo" },
  { label: "Rio de Janeiro (UTC-3)", value: "America/Sao_Paulo" },
  { label: "Brasília (UTC-3)", value: "America/Sao_Paulo" },
  { label: "Manaus (UTC-4)", value: "America/Manaus" },
  { label: "Acre (UTC-5)", value: "America/Rio_Branco" },
]

export const LANGUAGES = [
  { label: "Português (Brasil)", value: "pt-BR" },
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
]

export interface SleepRecord {
  id: string
  user_id: string
  sleep_date: string
  bedtime: string
  wake_time: string
  sleep_duration_minutes: number
  sleep_quality: number
  notes?: string
  sleep_latency_minutes?: number
  wake_up_count: number
  sleep_environment_rating?: number
  stress_level?: number
  caffeine_intake: boolean
  exercise_before_sleep: boolean
  screen_time_before_sleep: number
  created_at: string
  updated_at: string
}

export interface SleepReminder {
  id: string
  user_id: string
  reminder_type: "bedtime" | "wake_time"
  time: string
  days_of_week: number[]
  active: boolean
  title?: string
  message?: string
  created_at: string
  updated_at: string
}

export interface SleepGoal {
  id: string
  user_id: string
  target_bedtime: string
  target_wake_time: string
  target_duration_hours: number
  target_quality_rating: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface SleepHygieneTip {
  id: string
  category: "environment" | "routine" | "lifestyle" | "diet"
  title: string
  description: string
  priority: number
  created_at: string
}

export interface SleepStats {
  averageDuration: number
  averageQuality: number
  averageBedtime: string
  averageWakeTime: string
  totalRecords: number
  bestDay?: SleepRecord
  worstDay?: SleepRecord
  sleepEfficiency: number
  consistencyScore: number
}

export interface WeeklyData {
  date: string
  dayName: string
  sleepRecord?: SleepRecord
  hasData: boolean
}

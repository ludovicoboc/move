export interface StudySession {
  id: string
  user_id: string
  subject: string
  topic?: string
  duration_minutes: number
  session_type: "focus" | "break" | "long_break"
  completed: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface Exam {
  id: string
  user_id: string
  name: string
  description?: string
  exam_date?: string
  institution?: string
  status: "planned" | "in_progress" | "completed"
  created_at: string
  updated_at: string
}

export interface StudyMaterial {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  content?: string
  file_url?: string
  tags?: string[]
  exam_id?: string
  created_at: string
  updated_at: string
}

export interface Simulation {
  id: string
  user_id: string
  title: string
  description?: string
  exam_id?: string
  total_questions: number
  duration_minutes?: number
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface SimulationQuestion {
  id: string
  simulation_id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "essay"
  options?: any
  correct_answer: string
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  subject?: string
  order_index: number
  created_at: string
}

export interface SimulationAttempt {
  id: string
  user_id: string
  simulation_id: string
  score?: number
  total_questions: number
  correct_answers: number
  duration_minutes?: number
  completed: boolean
  answers?: any
  started_at: string
  completed_at?: string
}

export interface StudyPreferences {
  id: string
  user_id: string
  pomodoro_focus_minutes: number
  pomodoro_short_break: number
  pomodoro_long_break: number
  simplified_mode: boolean
  daily_study_goal: number
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

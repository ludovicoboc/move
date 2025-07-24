export interface SelfAwarenessCategory {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface SelfAwarenessNote {
  id: string
  user_id: string
  category_id: string
  title: string
  content: string
  tags: string[]
  mood_rating?: number
  is_private: boolean
  created_at: string
  updated_at: string
  category?: SelfAwarenessCategory
}

export interface RefugeSession {
  id: string
  user_id: string
  trigger_description?: string
  coping_strategies: string[]
  duration_minutes?: number
  effectiveness_rating?: number
  notes?: string
  started_at: string
  ended_at?: string
  created_at: string
}

export interface ReflectionPrompt {
  id: string
  user_id: string
  prompt_text: string
  category: string
  is_system_prompt: boolean
  usage_count: number
  created_at: string
}

export interface ReflectionEntry {
  id: string
  user_id: string
  prompt_id?: string
  entry_text: string
  mood_before?: number
  mood_after?: number
  insights: string[]
  created_at: string
  updated_at: string
  prompt?: ReflectionPrompt
}

export interface SelfAnalysisMetric {
  id: string
  user_id: string
  metric_name: string
  metric_value: number
  metric_type: string
  recorded_date: string
  notes?: string
  created_at: string
}

export type RefugeMode = "normal" | "simplified" | "minimal"

export interface RefugeModeSettings {
  mode: RefugeMode
  reduce_animations: boolean
  high_contrast: boolean
  larger_text: boolean
  hide_distractions: boolean
}

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage?: string
  frequency: "daily" | "twice_daily" | "three_times_daily" | "weekly" | "as_needed"
  times: string[]
  start_date: string
  end_date?: string
  notes?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface MedicationDose {
  id: string
  user_id: string
  medication_id: string
  scheduled_time: string
  taken_time?: string
  taken: boolean
  dose_date: string
  notes?: string
  created_at: string
  medication?: Medication
}

export interface MoodRecord {
  id: string
  user_id: string
  mood_score: number
  mood_label?: "muito_ruim" | "ruim" | "neutro" | "bom" | "muito_bom"
  notes?: string
  energy_level?: number
  sleep_quality?: number
  stress_level?: number
  activities?: string[]
  triggers?: string[]
  record_date: string
  created_at: string
  updated_at: string
}

export interface HealthMetric {
  id: string
  user_id: string
  metric_type: string
  value: number
  unit: string
  notes?: string
  recorded_at: string
  created_at: string
}

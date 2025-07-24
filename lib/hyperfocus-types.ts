export interface Hyperfocus {
  id: string
  user_id: string
  title: string
  description?: string
  color: string
  time_limit?: number
  tasks: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HyperfocusSession {
  id: string
  user_id: string
  hyperfocus_id: string
  duration: number
  completed_tasks: string[]
  notes?: string
  started_at: string
  completed_at?: string
  created_at: string
  hyperfocus?: Hyperfocus
}

export interface ToggleSession {
  id: string
  user_id: string
  name: string
  hyperfocus_ids: string[]
  current_index: number
  session_duration: number
  break_duration: number
  is_active: boolean
  started_at?: string
  created_at: string
  updated_at: string
  hyperfocuses?: Hyperfocus[]
}

export interface HyperfocusProject {
  id: string
  user_id: string
  hyperfocus_id: string
  name: string
  description?: string
  status: "active" | "paused" | "completed"
  progress: number
  milestones: ProjectMilestone[]
  created_at: string
  updated_at: string
  hyperfocus?: Hyperfocus
}

export interface ProjectMilestone {
  id: string
  title: string
  description?: string
  completed: boolean
  due_date?: string
  completed_at?: string
}

export interface HyperfocusFormData {
  title: string
  description: string
  color: string
  time_limit: number
  tasks: string[]
}

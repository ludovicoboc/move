export interface MealPlan {
  id: string
  user_id: string
  horario: string
  refeicao: string
  descricao?: string
  data: string
  created_at: string
  updated_at: string
}

export interface MealLog {
  id: string
  user_id: string
  horario: string
  refeicao: string
  descricao?: string
  calorias?: number
  data: string
  created_at: string
  updated_at: string
}

export interface HydrationLog {
  id: string
  user_id: string
  copos_consumidos: number
  meta_copos: number
  data: string
  created_at: string
  updated_at: string
}

export interface MealLogType {
  id: string
  user_id: string
  horario: string
  refeicao: string
  descricao?: string
  calorias?: number
  data: string
  created_at: string
  updated_at: string
}

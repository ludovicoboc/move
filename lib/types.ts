export interface PainelDiaItem {
  id: string
  user_id: string
  horario: string
  atividade: string
  cor: string
  concluida: boolean
  data: string
  created_at: string
  updated_at: string
}

export interface Prioridade {
  id: string
  user_id: string
  titulo: string
  descricao?: string
  concluida: boolean
  data: string
  created_at: string
  updated_at: string
}

export interface LembretePausa {
  id: string
  user_id: string
  intervalo_minutos: number
  ativo: boolean
  ultimo_lembrete?: string
  created_at: string
  updated_at: string
}

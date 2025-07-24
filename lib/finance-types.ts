export interface FinanceCategory {
  id: string
  user_id: string
  name: string
  color: string
  icon?: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id?: string
  description: string
  amount: number
  date: string
  envelope_id?: string
  created_at: string
  updated_at: string
  category?: FinanceCategory
  envelope?: VirtualEnvelope
}

export interface VirtualEnvelope {
  id: string
  user_id: string
  name: string
  total_amount: number
  used_amount: number
  color: string
  created_at: string
  updated_at: string
}

export interface ScheduledPayment {
  id: string
  user_id: string
  title: string
  amount: number
  due_date: string
  category_id?: string
  is_paid: boolean
  is_recurring: boolean
  recurrence_type?: "monthly" | "yearly" | "weekly"
  created_at: string
  updated_at: string
  category?: FinanceCategory
}

export interface ExpensesByCategory {
  category: FinanceCategory
  total: number
  percentage: number
}

export interface MonthlyExpenses {
  month: string
  total: number
  expenses: Expense[]
}

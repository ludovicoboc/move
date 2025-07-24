"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@supabase/supabase-js"
import type { Expense, FinanceCategory, ExpensesByCategory } from "@/lib/finance-types"

interface ExpenseTrackerProps {
  user: User
}

export default function ExpenseTracker({ user }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO EXPENSE TRACKER:', user?.id)
      setLoading(false)
      return
    }

    console.log('🔍 BUSCANDO EXPENSES para:', user.id)

    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("finance_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (categoriesError) {
        console.error('❌ ERRO CATEGORIES:', categoriesError)
      }

      // Fetch expenses with categories
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(`
          *,
          category:finance_categories(*)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (expensesError) {
        console.error('❌ ERRO EXPENSES:', expensesError)
      }

      if (categoriesData) setCategories(categoriesData)
      if (expensesData) {
        setExpenses(expensesData)
        calculateExpensesByCategory(expensesData, categoriesData || [])
      }
      console.log('✅ EXPENSES CARREGADOS:', { categories: categoriesData?.length, expenses: expensesData?.length })
    } catch (error) {
      console.error('❌ ERRO GERAL EXPENSE TRACKER:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateExpensesByCategory = (expenses: Expense[], categories: FinanceCategory[]) => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)

    const categoryTotals = categories.map((category) => {
      const categoryExpenses = expenses.filter((expense) => expense.category_id === category.id)
      const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      return {
        category,
        total: categoryTotal,
        percentage: total > 0 ? (categoryTotal / total) * 100 : 0,
      }
    })

    setExpensesByCategory(categoryTotals)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rastreador de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rastreador de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500 mb-1">Sem despesas registradas</p>
            <p className="text-sm text-gray-400">Adicione despesas para visualizar o gráfico</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart placeholder - could be replaced with actual chart */}
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Gráfico de Gastos</span>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total de Gastos:</span>
            <span className="font-bold text-lg">{formatCurrency(totalExpenses)}</span>
          </div>

          <div className="space-y-3">
            {expensesByCategory.map(({ category, total, percentage }) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCurrency(total)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

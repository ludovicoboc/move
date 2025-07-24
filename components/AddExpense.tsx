"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { FinanceCategory, VirtualEnvelope } from "@/lib/finance-types"

interface AddExpenseProps {
  user: User
  onExpenseAdded?: () => void
}

export default function AddExpense({ user, onExpenseAdded }: AddExpenseProps) {
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [envelopes, setEnvelopes] = useState<VirtualEnvelope[]>([])
  const [loading, setLoading] = useState(false)
  const [expense, setExpense] = useState({
    description: "",
    amount: "",
    category_id: "",
    envelope_id: undefined as string | undefined,
    date: new Date().toISOString().split("T")[0],
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO ADD EXPENSE:', user?.id)
      return
    }

    console.log('🔍 BUSCANDO DADOS ADD EXPENSE para:', user.id)

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

      // Fetch envelopes
      const { data: envelopesData, error: envelopesError } = await supabase
        .from("virtual_envelopes")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (envelopesError) {
        console.error('❌ ERRO ENVELOPES:', envelopesError)
      }

      if (categoriesData) setCategories(categoriesData)
      if (envelopesData) setEnvelopes(envelopesData)
      
      console.log('✅ DADOS ADD EXPENSE CARREGADOS:', { categories: categoriesData?.length, envelopes: envelopesData?.length })
    } catch (error) {
      console.error('❌ ERRO GERAL ADD EXPENSE:', error)
    }
  }

  const addExpense = async () => {
    if (!expense.description || !expense.amount || !expense.category_id) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)

    try {
      const amount = Number.parseFloat(expense.amount)

      // Check envelope limit if envelope is selected
      if (expense.envelope_id) {
        const envelope = envelopes.find((env) => env.id === expense.envelope_id)
        if (envelope && envelope.used_amount + amount > envelope.total_amount) {
          alert("Valor excede o limite do envelope!")
          setLoading(false)
          return
        }
      }

      // Add expense
      const { error: expenseError } = await supabase.from("expenses").insert({
        user_id: user.id,
        description: expense.description,
        amount: amount,
        category_id: expense.category_id,
        envelope_id: expense.envelope_id,
        date: expense.date,
      })

      if (expenseError) throw expenseError

      // Update envelope if selected
      if (expense.envelope_id) {
        const envelope = envelopes.find((env) => env.id === expense.envelope_id)
        if (envelope) {
          const { error: envelopeError } = await supabase
            .from("virtual_envelopes")
            .update({ used_amount: envelope.used_amount + amount })
            .eq("id", expense.envelope_id)

          if (envelopeError) throw envelopeError
        }
      }

      // Reset form
      setExpense({
        description: "",
        amount: "",
        category_id: "",
        envelope_id: undefined,
        date: new Date().toISOString().split("T")[0],
      })

      // Notify parent component
      if (onExpenseAdded) {
        onExpenseAdded()
      }

      alert("Despesa adicionada com sucesso!")
    } catch (error) {
      console.error("Error adding expense:", error)
      alert("Erro ao adicionar despesa. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={expense.description}
              onChange={(e) => setExpense({ ...expense, description: e.target.value })}
              placeholder="Ex: Mercado"
            />
          </div>

          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={expense.amount}
              onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({ ...expense, date: e.target.value })}
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    expense.category_id === category.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setExpense({ ...expense, category_id: category.id })}
                >
                  <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: category.color }} />
                  <span className="text-xs">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="envelope">Envelope (Opcional)</Label>
            <Select
              value={expense.envelope_id || "none"}
              onValueChange={(value) => setExpense({ ...expense, envelope_id: value === "none" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um envelope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum envelope</SelectItem>
                {envelopes.map((envelope) => (
                  <SelectItem key={envelope.id} value={envelope.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: envelope.color }} />
                        {envelope.name}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(envelope.total_amount - envelope.used_amount)} disponível
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addExpense} className="w-full" disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar Despesa"}
          </Button>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dicas para controlar despesas:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Registre despesas logo após realizá-las</li>
                  <li>• Use descrições claras e específicas</li>
                  <li>• Categorize corretamente para melhor visualização</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

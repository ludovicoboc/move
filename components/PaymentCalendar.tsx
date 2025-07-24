"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Check, X } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { ScheduledPayment, FinanceCategory } from "@/lib/finance-types"

interface PaymentCalendarProps {
  user: User
}

export default function PaymentCalendar({ user }: PaymentCalendarProps) {
  const [payments, setPayments] = useState<ScheduledPayment[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false)
  const [newPayment, setNewPayment] = useState({
    title: "",
    amount: "",
    due_date: "",
    category_id: "0", // Updated default value to be a non-empty string
    is_recurring: false,
    recurrence_type: "monthly" as "monthly" | "weekly" | "yearly",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [currentDate])

  const fetchData = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO PAYMENT CALENDAR:', user?.id)
      setLoading(false)
      return
    }

    console.log('🔍 BUSCANDO PAYMENTS para:', user.id)

    try {
      // Get first and last day of current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Fetch payments for current month
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("scheduled_payments")
        .select(`
          *,
          category:finance_categories(*)
        `)
        .eq("user_id", user.id)
        .gte("due_date", firstDay.toISOString().split("T")[0])
        .lte("due_date", lastDay.toISOString().split("T")[0])
        .order("due_date")

      if (paymentsError) {
        console.error('❌ ERRO PAYMENTS:', paymentsError)
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("finance_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (categoriesError) {
        console.error('❌ ERRO CATEGORIES:', categoriesError)
      }

      if (paymentsData) setPayments(paymentsData)
      if (categoriesData) setCategories(categoriesData)
      
      console.log('✅ PAYMENTS CARREGADOS:', { payments: paymentsData?.length, categories: categoriesData?.length })
    } catch (error) {
      console.error('❌ ERRO GERAL PAYMENT CALENDAR:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async () => {
    if (!newPayment.title || !newPayment.amount || !newPayment.due_date) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    try {
      const { error } = await supabase.from("scheduled_payments").insert({
        user_id: user.id,
        title: newPayment.title,
        amount: Number.parseFloat(newPayment.amount),
        due_date: newPayment.due_date,
        category_id: newPayment.category_id || null,
        is_recurring: newPayment.is_recurring,
        recurrence_type: newPayment.is_recurring ? newPayment.recurrence_type : null,
      })

      if (error) throw error

      setNewPayment({
        title: "",
        amount: "",
        due_date: "",
        category_id: "0", // Updated default value to be a non-empty string
        is_recurring: false,
        recurrence_type: "monthly",
      })
      setShowNewPaymentDialog(false)
      fetchData()
    } catch (error) {
      console.error("Error creating payment:", error)
      alert("Erro ao criar pagamento. Tente novamente.")
    }
  }

  const togglePaymentStatus = async (paymentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("scheduled_payments")
        .update({ is_paid: !currentStatus })
        .eq("id", paymentId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error updating payment status:", error)
      alert("Erro ao atualizar status do pagamento.")
    }
  }

  const deletePayment = async (paymentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return

    try {
      const { error } = await supabase.from("scheduled_payments").delete().eq("id", paymentId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error deleting payment:", error)
      alert("Erro ao excluir pagamento.")
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getMonthYear = () => {
    return currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium capitalize">{getMonthYear()}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Payments List */}
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📅</div>
              <p className="text-gray-500">Nenhum pagamento agendado para este mês</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {payment.category && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payment.category.color }} />
                      )}
                      <div>
                        <p className="font-medium">{payment.title}</p>
                        <p className="text-sm text-gray-500">{formatDate(payment.due_date)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePaymentStatus(payment.id, payment.is_paid)}
                        className={payment.is_paid ? "text-green-600" : "text-gray-400"}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePayment(payment.id)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {payment.is_recurring && (
                      <Badge variant="secondary" className="text-xs">
                        {payment.recurrence_type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Payment */}
          <Dialog open={showNewPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Novo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Novo Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-title">Título</Label>
                  <Input
                    id="payment-title"
                    value={newPayment.title}
                    onChange={(e) => setNewPayment({ ...newPayment, title: e.target.value })}
                    placeholder="Ex: Conta de Luz"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-amount">Valor (R$)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-date">Data de Vencimento</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={newPayment.due_date}
                    onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment-category">Categoria (Opcional)</Label>
                  <Select
                    value={newPayment.category_id}
                    onValueChange={(value) => setNewPayment({ ...newPayment, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Nenhuma categoria</SelectItem>{" "}
                      {/* Updated value prop to be a non-empty string */}
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="payment-recurring"
                    checked={newPayment.is_recurring}
                    onChange={(e) => setNewPayment({ ...newPayment, is_recurring: e.target.checked })}
                  />
                  <Label htmlFor="payment-recurring">Pagamento recorrente</Label>
                </div>
                {newPayment.is_recurring && (
                  <div>
                    <Label htmlFor="recurrence-type">Frequência</Label>
                    <Select
                      value={newPayment.recurrence_type}
                      onValueChange={(value) =>
                        setNewPayment({ ...newPayment, recurrence_type: value as "monthly" | "weekly" | "yearly" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={createPayment} className="w-full">
                  Agendar Pagamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

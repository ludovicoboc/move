"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2 } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { VirtualEnvelope } from "@/lib/finance-types"

interface VirtualEnvelopesProps {
  user: User
}

export default function VirtualEnvelopes({ user }: VirtualEnvelopesProps) {
  const [envelopes, setEnvelopes] = useState<VirtualEnvelope[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewEnvelopeDialog, setShowNewEnvelopeDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [selectedEnvelope, setSelectedEnvelope] = useState<VirtualEnvelope | null>(null)
  const [newEnvelope, setNewEnvelope] = useState({
    name: "",
    total_amount: "",
    color: "#3B82F6",
  })
  const [expenseAmount, setExpenseAmount] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchEnvelopes()
  }, [])

  const fetchEnvelopes = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO VIRTUAL ENVELOPES:', user?.id)
      setLoading(false)
      return
    }

    console.log('🔍 BUSCANDO ENVELOPES para:', user.id)

    try {
      const { data, error } = await supabase.from("virtual_envelopes").select("*").eq("user_id", user.id).order("created_at")

      if (error) {
        console.error('❌ ERRO ENVELOPES:', error)
      }

      if (data) {
        setEnvelopes(data)
        console.log('✅ ENVELOPES CARREGADOS:', data.length)
      }
    } catch (error) {
      console.error('❌ ERRO GERAL VIRTUAL ENVELOPES:', error)
    } finally {
      setLoading(false)
    }
  }

  const createEnvelope = async () => {
    if (!newEnvelope.name || !newEnvelope.total_amount) {
      alert("Por favor, preencha todos os campos.")
      return
    }

    try {
      const { error } = await supabase.from("virtual_envelopes").insert({
        user_id: user.id,
        name: newEnvelope.name,
        total_amount: Number.parseFloat(newEnvelope.total_amount),
        color: newEnvelope.color,
      })

      if (error) throw error

      setNewEnvelope({ name: "", total_amount: "", color: "#3B82F6" })
      setShowNewEnvelopeDialog(false)
      fetchEnvelopes()
    } catch (error) {
      console.error("Error creating envelope:", error)
      alert("Erro ao criar envelope. Tente novamente.")
    }
  }

  const registerExpense = async () => {
    if (!selectedEnvelope || !expenseAmount) {
      alert("Por favor, informe o valor da despesa.")
      return
    }

    const amount = Number.parseFloat(expenseAmount)
    if (selectedEnvelope.used_amount + amount > selectedEnvelope.total_amount) {
      alert("Valor excede o limite do envelope!")
      return
    }

    try {
      const { error } = await supabase
        .from("virtual_envelopes")
        .update({ used_amount: selectedEnvelope.used_amount + amount })
        .eq("id", selectedEnvelope.id)

      if (error) throw error

      setExpenseAmount("")
      setShowExpenseDialog(false)
      setSelectedEnvelope(null)
      fetchEnvelopes()
    } catch (error) {
      console.error("Error registering expense:", error)
      alert("Erro ao registrar gasto. Tente novamente.")
    }
  }

  const deleteEnvelope = async (envelopeId: string) => {
    if (!confirm("Tem certeza que deseja excluir este envelope?")) return

    try {
      const { error } = await supabase.from("virtual_envelopes").delete().eq("id", envelopeId)

      if (error) throw error
      fetchEnvelopes()
    } catch (error) {
      console.error("Error deleting envelope:", error)
      alert("Erro ao excluir envelope. Tente novamente.")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const getProgressPercentage = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envelopes Virtuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envelopes Virtuais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {envelopes.map((envelope) => (
            <div key={envelope.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: envelope.color }} />
                  <span className="font-medium">{envelope.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => deleteEnvelope(envelope.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilizado: {formatCurrency(envelope.used_amount)}</span>
                  <span>Total: {formatCurrency(envelope.total_amount)}</span>
                </div>
                <Progress value={getProgressPercentage(envelope.used_amount, envelope.total_amount)} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Disponível: {formatCurrency(envelope.total_amount - envelope.used_amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedEnvelope(envelope)
                      setShowExpenseDialog(true)
                    }}
                  >
                    Registrar Gasto
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Dialog open={showNewEnvelopeDialog} onOpenChange={setShowNewEnvelopeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Novo Envelope
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Envelope</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="envelope-name">Nome do Envelope</Label>
                  <Input
                    id="envelope-name"
                    value={newEnvelope.name}
                    onChange={(e) => setNewEnvelope({ ...newEnvelope, name: e.target.value })}
                    placeholder="Ex: Emergências"
                  />
                </div>
                <div>
                  <Label htmlFor="envelope-amount">Valor Total (R$)</Label>
                  <Input
                    id="envelope-amount"
                    type="number"
                    step="0.01"
                    value={newEnvelope.total_amount}
                    onChange={(e) => setNewEnvelope({ ...newEnvelope, total_amount: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="envelope-color">Cor</Label>
                  <Input
                    id="envelope-color"
                    type="color"
                    value={newEnvelope.color}
                    onChange={(e) => setNewEnvelope({ ...newEnvelope, color: e.target.value })}
                  />
                </div>
                <Button onClick={createEnvelope} className="w-full">
                  Criar Envelope
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Gasto - {selectedEnvelope?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expense-amount">Valor da Despesa (R$)</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                {selectedEnvelope && (
                  <div className="text-sm text-gray-600">
                    Disponível: {formatCurrency(selectedEnvelope.total_amount - selectedEnvelope.used_amount)}
                  </div>
                )}
                <Button onClick={registerExpense} className="w-full">
                  Registrar Gasto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

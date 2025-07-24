"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { MealLogType } from "@/lib/nutrition-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Clock, Utensils } from "lucide-react"

export default function MealLogComponent() {
  const [mealLogs, setMealLogs] = useState<MealLogType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLog, setNewLog] = useState({
    horario: "",
    refeicao: "",
    descricao: "",
    calorias: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchMealLogs()
  }, [])

  const fetchMealLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("data", new Date().toISOString().split("T")[0])
        .order("horario", { ascending: false })

      if (error) throw error
      setMealLogs(data || [])
    } catch (error) {
      console.error("Erro ao buscar registros de refeição:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMealLog = async () => {
    if (!newLog.horario || !newLog.refeicao) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("meal_logs").insert({
        user_id: user.id,
        horario: newLog.horario,
        refeicao: newLog.refeicao,
        descricao: newLog.descricao,
        calorias: newLog.calorias ? Number.parseInt(newLog.calorias) : null,
      })

      if (error) throw error

      setNewLog({ horario: "", refeicao: "", descricao: "", calorias: "" })
      setShowAddForm(false)
      fetchMealLogs()
    } catch (error) {
      console.error("Erro ao adicionar registro de refeição:", error)
    }
  }

  const deleteMealLog = async (id: string) => {
    try {
      const { error } = await supabase.from("meal_logs").delete().eq("id", id)

      if (error) throw error
      fetchMealLogs()
    } catch (error) {
      console.error("Erro ao deletar registro de refeição:", error)
    }
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Refeições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Refeições</CardTitle>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Registro
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  type="time"
                  value={newLog.horario}
                  onChange={(e) => setNewLog({ ...newLog, horario: e.target.value })}
                  className="w-32"
                />
                <Input
                  placeholder="Nome da refeição"
                  value={newLog.refeicao}
                  onChange={(e) => setNewLog({ ...newLog, refeicao: e.target.value })}
                  className="flex-1"
                />
              </div>
              <Input
                placeholder="Descrição (opcional)"
                value={newLog.descricao}
                onChange={(e) => setNewLog({ ...newLog, descricao: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Calorias (opcional)"
                value={newLog.calorias}
                onChange={(e) => setNewLog({ ...newLog, calorias: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={addMealLog} className="bg-blue-500 hover:bg-blue-600">
                  Registrar
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {mealLogs.length === 0 ? (
          <div className="text-center py-8">
            <Utensils className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma refeição registrada hoje</p>
          </div>
        ) : (
          mealLogs.map((log) => (
            <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 text-blue-600 mt-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTime(log.horario)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{log.refeicao}</div>
                  {log.descricao && <div className="text-sm text-gray-600 mt-1">{log.descricao}</div>}
                  {log.calorias && <div className="text-sm text-green-600 mt-1">{log.calorias} kcal</div>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteMealLog(log.id)}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

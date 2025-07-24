"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { MealPlan } from "@/lib/nutrition-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Edit, Trash2, Plus } from "lucide-react"

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMeal, setNewMeal] = useState({
    horario: "",
    refeicao: "",
    descricao: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("data", new Date().toISOString().split("T")[0])
        .order("horario")

      if (error) throw error
      setMealPlans(data || [])
    } catch (error) {
      console.error("Erro ao buscar planos de refeição:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMealPlan = async () => {
    if (!newMeal.horario || !newMeal.refeicao) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("meal_plans").insert({
        user_id: user.id,
        horario: newMeal.horario,
        refeicao: newMeal.refeicao,
        descricao: newMeal.descricao,
      })

      if (error) throw error

      setNewMeal({ horario: "", refeicao: "", descricao: "" })
      setShowAddForm(false)
      fetchMealPlans()
    } catch (error) {
      console.error("Erro ao adicionar plano de refeição:", error)
    }
  }

  const deleteMealPlan = async (id: string) => {
    try {
      const { error } = await supabase.from("meal_plans").delete().eq("id", id)

      if (error) throw error
      fetchMealPlans()
    } catch (error) {
      console.error("Erro ao deletar plano de refeição:", error)
    }
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds from time format
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planejador de Refeições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planejador de Refeições</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealPlans.map((meal) => (
          <div key={meal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTime(meal.horario)}</span>
              </div>
              <div>
                <div className="font-medium">{meal.refeicao}</div>
                {meal.descricao && <div className="text-sm text-gray-500">{meal.descricao}</div>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteMealPlan(meal.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {showAddForm ? (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  type="time"
                  value={newMeal.horario}
                  onChange={(e) => setNewMeal({ ...newMeal, horario: e.target.value })}
                  className="w-32"
                />
                <Input
                  placeholder="Nome da refeição"
                  value={newMeal.refeicao}
                  onChange={(e) => setNewMeal({ ...newMeal, refeicao: e.target.value })}
                  className="flex-1"
                />
              </div>
              <Input
                placeholder="Descrição da refeição"
                value={newMeal.descricao}
                onChange={(e) => setNewMeal({ ...newMeal, descricao: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={addMealPlan} className="bg-green-500 hover:bg-green-600">
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full border-dashed border-2 h-12">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nova Refeição
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

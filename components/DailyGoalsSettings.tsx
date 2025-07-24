"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { DailyGoals } from "@/lib/profile-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Target, Moon, Droplets, CheckSquare, Coffee, BookOpen, Dumbbell, Brain, Save } from "lucide-react"

interface DailyGoalsSettingsProps {
  userId: string
}

export default function DailyGoalsSettings({ userId }: DailyGoalsSettingsProps) {
  const [goals, setGoals] = useState<DailyGoals | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchGoals()
  }, [userId])

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase.from("daily_goals").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setGoals(data)
      } else {
        // Create default goals
        const { data: newGoals, error: insertError } = await supabase
          .from("daily_goals")
          .insert({ user_id: userId })
          .select()
          .single()

        if (insertError) throw insertError
        setGoals(newGoals)
      }
    } catch (error) {
      console.error("Erro ao buscar metas diárias:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateGoal = (key: keyof DailyGoals, value: number) => {
    if (!goals) return
    setGoals({ ...goals, [key]: value })
  }

  const saveGoals = async () => {
    if (!goals) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("daily_goals")
        .update({
          sleep_hours: goals.sleep_hours,
          water_glasses: goals.water_glasses,
          priority_tasks: goals.priority_tasks,
          scheduled_breaks: goals.scheduled_breaks,
          study_hours: goals.study_hours,
          exercise_minutes: goals.exercise_minutes,
          meditation_minutes: goals.meditation_minutes,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao salvar metas:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Diárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!goals) return null

  const goalItems = [
    {
      key: "sleep_hours" as keyof DailyGoals,
      label: "Horas de Sono",
      icon: Moon,
      value: goals.sleep_hours,
      unit: "horas",
      min: 4,
      max: 12,
      color: "text-purple-600",
    },
    {
      key: "water_glasses" as keyof DailyGoals,
      label: "Copos de Água",
      icon: Droplets,
      value: goals.water_glasses,
      unit: "copos",
      min: 4,
      max: 16,
      color: "text-blue-600",
    },
    {
      key: "priority_tasks" as keyof DailyGoals,
      label: "Tarefas Prioritárias",
      icon: CheckSquare,
      value: goals.priority_tasks,
      unit: "tarefas",
      min: 1,
      max: 10,
      color: "text-green-600",
    },
    {
      key: "scheduled_breaks" as keyof DailyGoals,
      label: "Pausas Programadas",
      icon: Coffee,
      value: goals.scheduled_breaks,
      unit: "pausas",
      min: 2,
      max: 12,
      color: "text-orange-600",
    },
    {
      key: "study_hours" as keyof DailyGoals,
      label: "Horas de Estudo",
      icon: BookOpen,
      value: goals.study_hours,
      unit: "horas",
      min: 0,
      max: 12,
      color: "text-indigo-600",
    },
    {
      key: "exercise_minutes" as keyof DailyGoals,
      label: "Exercício",
      icon: Dumbbell,
      value: goals.exercise_minutes,
      unit: "minutos",
      min: 0,
      max: 180,
      color: "text-red-600",
    },
    {
      key: "meditation_minutes" as keyof DailyGoals,
      label: "Meditação",
      icon: Brain,
      value: goals.meditation_minutes,
      unit: "minutos",
      min: 0,
      max: 60,
      color: "text-teal-600",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Diárias
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Configure suas metas diárias para personalizar recomendações e lembretes
          </p>
        </div>
        <Button onClick={saveGoals} disabled={saving} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goalItems.map((item, index) => (
            <div key={item.key}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <Label htmlFor={item.key} className="text-sm font-medium">
                    {item.label}
                  </Label>
                  <p className="text-xs text-gray-500">
                    Meta atual: {item.value} {item.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id={item.key}
                  type="number"
                  min={item.min}
                  max={item.max}
                  value={item.value}
                  onChange={(e) => updateGoal(item.key, Number.parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">{item.unit}</span>
              </div>
              {index < goalItems.length - 1 && index % 2 === 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dica</h4>
          <p className="text-sm text-blue-800">
            Suas metas diárias são usadas para personalizar recomendações e lembretes em todo o painel. Defina metas
            realistas que você possa manter consistentemente.
          </p>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            As metas são usadas para calcular seu progresso diário e gerar insights personalizados sobre seus hábitos e
            bem-estar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

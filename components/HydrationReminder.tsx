"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { HydrationLog } from "@/lib/nutrition-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Droplets, Minus, Plus } from "lucide-react"

export default function HydrationReminder() {
  const [hydrationLog, setHydrationLog] = useState<HydrationLog | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchHydrationLog()
  }, [])

  const fetchHydrationLog = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const hoje = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("hydration_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("data", hoje)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setHydrationLog(data)
      } else {
        // Create new hydration log for today
        const { data: newLog, error: insertError } = await supabase
          .from("hydration_logs")
          .insert({
            user_id: user.id,
            copos_consumidos: 0,
            meta_copos: 8,
            data: hoje,
          })
          .select()
          .single()

        if (insertError) throw insertError
        setHydrationLog(newLog)
      }
    } catch (error) {
      console.error("Erro ao buscar registro de hidratação:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateHydration = async (newCount: number) => {
    if (!hydrationLog || newCount < 0) return

    try {
      const { error } = await supabase
        .from("hydration_logs")
        .update({ copos_consumidos: newCount })
        .eq("id", hydrationLog.id)

      if (error) throw error

      setHydrationLog({ ...hydrationLog, copos_consumidos: newCount })

      // Show notification when goal is reached
      if (newCount >= hydrationLog.meta_copos && hydrationLog.copos_consumidos < hydrationLog.meta_copos) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Parabéns! 🎉", {
            body: "Você atingiu sua meta de hidratação diária!",
            icon: "/favicon.ico",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar hidratação:", error)
    }
  }

  const addGlass = () => {
    if (hydrationLog) {
      updateHydration(hydrationLog.copos_consumidos + 1)
    }
  }

  const removeGlass = () => {
    if (hydrationLog && hydrationLog.copos_consumidos > 0) {
      updateHydration(hydrationLog.copos_consumidos - 1)
    }
  }

  const percentage = hydrationLog ? Math.round((hydrationLog.copos_consumidos / hydrationLog.meta_copos) * 100) : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hidratação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hidratação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Acompanhamento de Hidratação</h3>
          <p className="text-sm text-gray-600 mb-4">Registre os copos de água que você bebe durante o dia</p>

          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={removeGlass} disabled={!hydrationLog?.copos_consumidos}>
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">Meta: {hydrationLog?.meta_copos} copos</div>
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
            </div>
            <Button variant="outline" size="sm" onClick={addGlass}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Progress value={percentage} className="mb-4" />

          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">
              {hydrationLog?.copos_consumidos} de {hydrationLog?.meta_copos} copos
            </span>
          </div>

          {/* Water glasses visualization */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {Array.from({ length: hydrationLog?.meta_copos || 8 }).map((_, index) => (
              <div key={index} className="flex justify-center">
                <Droplets
                  className={`h-8 w-8 ${
                    index < (hydrationLog?.copos_consumidos || 0) ? "text-blue-500 fill-blue-500" : "text-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={addGlass} className="flex-1 bg-blue-500 hover:bg-blue-600">
              Registrar Copo
            </Button>
            <Button onClick={removeGlass} variant="outline" className="flex-1 bg-transparent">
              Remover Copo
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Dicas de Hidratação:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Mantenha uma garrafa de água sempre visível</li>
            <li>• Beba um copo de água ao acordar e antes de cada refeição</li>
            <li>• Configure lembretes para beber água regularmente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

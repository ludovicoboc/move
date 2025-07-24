"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "./AppLayout"
import LeisureTimer from "./LeisureTimer"
import LeisureActivities from "./LeisureActivities"
import RestSuggestions from "./RestSuggestions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, Heart, TrendingUp, Settings } from "lucide-react"

interface LeisureDashboardProps {
  user: User
}

export default function LeisureDashboard({ user }: LeisureDashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const supabase = createClient()

  const handleSessionComplete = async (duration: number, activityName?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("leisure_sessions").insert({
        user_id: user.id,
        activity_name: activityName || "Tempo Livre",
        duration_minutes: duration,
        completed_at: new Date().toISOString(),
      })

      if (error) throw error
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Erro ao salvar sessão:", error)
    }
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Play className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Iniciar Atividade</span>
        <span className="sm:hidden">Iniciar</span>
      </Button>
      <Button variant="ghost" size="sm">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AppLayout user={user} title="Lazer" actions={headerActions}>
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Semanal</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h 30m</div>
              <p className="text-xs text-muted-foreground">desta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">atividades registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bem-estar</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.5</div>
              <p className="text-xs text-muted-foreground">satisfação média</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15%</div>
              <p className="text-xs text-muted-foreground">vs. semana passada</p>
            </CardContent>
          </Card>
        </div>

        {/* Leisure Timer */}
        <LeisureTimer onSessionComplete={handleSessionComplete} />

        {/* Leisure Activities */}
        <LeisureActivities />

        {/* Rest Suggestions */}
        <RestSuggestions />
      </div>
    </AppLayout>
  )
}

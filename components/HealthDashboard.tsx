"use client"

import type { User } from "@supabase/supabase-js"
import AppLayout from "./AppLayout"
import MedicationRegistration from "./MedicationRegistration"
import MoodMonitoring from "./MoodMonitoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, Zap, TrendingUp } from "lucide-react"

interface HealthDashboardProps {
  user: User
}

export default function HealthDashboard({ user }: HealthDashboardProps) {
  return (
    <AppLayout user={user} title="Saúde">
      <div className="space-y-8">
        {/* Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bem-estar Geral</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Bom</div>
              <p className="text-xs text-muted-foreground">Baseado nos registros recentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">medicamentos ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humor Médio</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+5%</div>
              <p className="text-xs text-muted-foreground">melhoria este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Medication Registration */}
        <MedicationRegistration />

        {/* Mood Monitoring */}
        <MoodMonitoring />
      </div>
    </AppLayout>
  )
}

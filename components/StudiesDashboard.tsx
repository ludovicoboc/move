"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import AppLayout from "./AppLayout"
import PomodoroTimer from "./PomodoroTimer"
import StudyLog from "./StudyLog"
import ExamManagement from "./ExamManagement"
import StudyMaterials from "./StudyMaterials"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Eye, BookOpen } from "lucide-react"

interface StudiesDashboardProps {
  user: User
}

export default function StudiesDashboard({ user }: StudiesDashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [simplifiedMode, setSimplifiedMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const supabase = createClient()

  const handleSessionComplete = async (duration: number, subject: string, topic?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject,
        topic,
        duration_minutes: duration,
        session_type: "focus",
        completed: true,
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
        <Eye className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Conferir Simulado</span>
        <span className="sm:hidden">Simulado</span>
      </Button>
      <Button variant="outline" size="sm">
        <BookOpen className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Assistir Matérias</span>
        <span className="sm:hidden">Matérias</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AppLayout user={user} title="Estudos" actions={headerActions}>
      {showSettings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Modo Simplificado</div>
                <div className="text-sm text-gray-600">Reduz a complexidade da interface para facilitar o uso</div>
              </div>
              <Switch checked={simplifiedMode} onCheckedChange={setSimplifiedMode} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PomodoroTimer onSessionComplete={handleSessionComplete} />
        <StudyLog refreshTrigger={refreshTrigger} />
      </div>

      <div className="mb-8">
        <ExamManagement />
      </div>

      <div className="mb-8">
        <StudyMaterials simplified={simplifiedMode} />
      </div>

      {!simplifiedMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Simulados Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Simulados</h3>
                <p className="text-gray-500 mb-4">Pratique com simulados personalizados</p>
                <Button>Criar Primeiro Simulado</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso de Aprendizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-500 mb-4">Acompanhe seu progresso e desempenho</p>
                <Button variant="outline">Ver Relatórios</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { StudySession } from "@/lib/study-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Plus } from "lucide-react"

interface StudyLogProps {
  refreshTrigger: number
}

export default function StudyLog({ refreshTrigger }: StudyLogProps) {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTime, setTotalTime] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchSessions()
  }, [refreshTrigger])

  const fetchSessions = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`)
        .eq("completed", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSessions(data || [])

      // Calculate total time
      const total = (data || []).reduce((sum, session) => sum + session.duration_minutes, 0)
      setTotalTime(total)
    } catch (error) {
      console.error("Erro ao buscar sessões:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Estudos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Estudos</CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Sessão de Estudo
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Sessões Completas</div>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.length}/{sessions.length + 1}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Tempo Total</div>
            <div className="text-2xl font-bold text-blue-600">{formatTime(totalTime)}</div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma sessão de estudo registrada hoje</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      session.session_type === "focus" ? "bg-green-500" : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{session.subject}</div>
                    {session.topic && <div className="text-sm text-gray-600">{session.topic}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(session.duration_minutes)}
                  </div>
                  <div>{formatDate(session.created_at)}</div>
                  <Badge variant="secondary" className="text-xs">
                    {session.session_type === "focus" ? "Foco" : "Pausa"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Play, Square, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { ToggleSession, Hyperfocus } from "@/lib/hyperfocus-types"

interface ToggleSystemProps {
  user: User
}

export default function ToggleSystem({ user }: ToggleSystemProps) {
  const [toggleSessions, setToggleSessions] = useState<ToggleSession[]>([])
  const [hyperfocuses, setHyperfocuses] = useState<Hyperfocus[]>([])
  const [activeSession, setActiveSession] = useState<ToggleSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch toggle sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("toggle_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (sessionsError) throw sessionsError

      // Fetch hyperfocuses
      const { data: hyperfocusData, error: hyperfocusError } = await supabase
        .from("hyperfocuses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (hyperfocusError) throw hyperfocusError

      setToggleSessions(sessions || [])
      setHyperfocuses(hyperfocusData || [])

      // Find active session
      const active = sessions?.find((session) => session.is_active)
      setActiveSession(active || null)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewToggleSession = async () => {
    if (hyperfocuses.length < 2) {
      alert("Você precisa de pelo menos 2 hiperfocos para criar uma sessão de alternância.")
      return
    }

    try {
      const { error } = await supabase.from("toggle_sessions").insert({
        user_id: user.id,
        name: `Sessão ${new Date().toLocaleDateString()}`,
        hyperfocus_ids: hyperfocuses.slice(0, 3).map((h) => h.id),
        session_duration: 25,
        break_duration: 5,
      })

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error creating toggle session:", error)
    }
  }

  const startToggleSession = async (sessionId: string) => {
    try {
      // Stop any active session first
      if (activeSession) {
        await supabase.from("toggle_sessions").update({ is_active: false }).eq("id", activeSession.id)
      }

      // Start new session
      const { error } = await supabase
        .from("toggle_sessions")
        .update({
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .eq("id", sessionId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error starting toggle session:", error)
    }
  }

  const stopToggleSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("toggle_sessions").update({ is_active: false }).eq("id", sessionId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error stopping toggle session:", error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold">Sistema de Alternância</h2>
      </div>

      <p className="text-sm text-gray-600">
        Gerencie transições entre diferentes hiperfocos para reduzir o impacto das mudanças de contexto.
      </p>

      {toggleSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <p className="text-gray-500">Nenhuma sessão de alternância ativa no momento.</p>

              <Button
                onClick={createNewToggleSession}
                className="bg-orange-500 hover:bg-orange-600"
                disabled={hyperfocuses.length < 2}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Sessão de Alternância
              </Button>

              {hyperfocuses.length < 2 && (
                <p className="text-sm text-gray-500 mt-4">
                  Para criar uma sessão de alternância, primeiro crie hiperfocos na guia "Conversor de Interesses".
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Sessões de Alternância</h3>
            <Button onClick={createNewToggleSession} variant="outline" size="sm" disabled={hyperfocuses.length < 2}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          </div>

          {toggleSessions.map((session) => (
            <Card key={session.id} className={session.is_active ? "border-green-500" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{session.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {session.is_active && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ativa
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      {!session.is_active ? (
                        <Button size="sm" variant="outline" onClick={() => startToggleSession(session.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => stopToggleSession(session.id)}>
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Duração: {session.session_duration}min</span>
                    <span>Pausa: {session.break_duration}min</span>
                    <span>Hiperfocos: {session.hyperfocus_ids.length}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.hyperfocus_ids.map((hyperfocusId, index) => {
                      const hyperfocus = hyperfocuses.find((h) => h.id === hyperfocusId)
                      return hyperfocus ? (
                        <Badge
                          key={hyperfocusId}
                          variant="outline"
                          className={`${session.is_active && index === session.current_index ? "bg-blue-100 border-blue-500" : ""}`}
                          style={{ borderColor: hyperfocus.color }}
                        >
                          {hyperfocus.title}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

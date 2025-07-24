"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { StudyPreferences } from "@/lib/study-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"

interface PomodoroTimerProps {
  onSessionComplete: (duration: number, subject: string, topic?: string) => void
}

export default function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<"focus" | "short_break" | "long_break">("focus")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<StudyPreferences | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPreferences()
  }, [])

  useEffect(() => {
    if (preferences) {
      const minutes =
        sessionType === "focus"
          ? preferences.pomodoro_focus_minutes
          : sessionType === "short_break"
            ? preferences.pomodoro_short_break
            : preferences.pomodoro_long_break

      setTimeLeft(minutes * 60)
    }
  }, [sessionType, preferences])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const fetchPreferences = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("study_preferences").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          pomodoro_focus_minutes: 25,
          pomodoro_short_break: 5,
          pomodoro_long_break: 15,
          simplified_mode: false,
          daily_study_goal: 120,
          notifications_enabled: true,
        }

        const { data: newPrefs, error: insertError } = await supabase
          .from("study_preferences")
          .insert(defaultPrefs)
          .select()
          .single()

        if (insertError) throw insertError
        setPreferences(newPrefs)
      }
    } catch (error) {
      console.error("Erro ao buscar preferências:", error)
    }
  }

  const handleSessionComplete = async () => {
    setIsRunning(false)

    if (sessionType === "focus" && subject) {
      const duration = preferences ? preferences.pomodoro_focus_minutes : 25
      onSessionComplete(duration, subject, topic)
    }

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Sessão Concluída! 🎉", {
        body: sessionType === "focus" ? "Hora de fazer uma pausa!" : "Hora de voltar aos estudos!",
        icon: "/favicon.ico",
      })
    }
  }

  const startTimer = () => {
    if (sessionType === "focus" && !subject.trim()) {
      alert("Por favor, informe a matéria que você vai estudar")
      return
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    const minutes =
      sessionType === "focus"
        ? preferences?.pomodoro_focus_minutes || 25
        : sessionType === "short_break"
          ? preferences?.pomodoro_short_break || 5
          : preferences?.pomodoro_long_break || 15

    setTimeLeft(minutes * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getSessionTypeLabel = () => {
    switch (sessionType) {
      case "focus":
        return "Tempo de Foco"
      case "short_break":
        return "Pausa Curta"
      case "long_break":
        return "Pausa Longa"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Temporizador Pomodoro</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSettings && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Foco (min)</label>
                <Input
                  type="number"
                  value={preferences?.pomodoro_focus_minutes || 25}
                  onChange={(e) => {
                    if (preferences) {
                      setPreferences({
                        ...preferences,
                        pomodoro_focus_minutes: Number.parseInt(e.target.value) || 25,
                      })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pausa Curta (min)</label>
                <Input
                  type="number"
                  value={preferences?.pomodoro_short_break || 5}
                  onChange={(e) => {
                    if (preferences) {
                      setPreferences({
                        ...preferences,
                        pomodoro_short_break: Number.parseInt(e.target.value) || 5,
                      })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pausa Longa (min)</label>
                <Input
                  type="number"
                  value={preferences?.pomodoro_long_break || 15}
                  onChange={(e) => {
                    if (preferences) {
                      setPreferences({
                        ...preferences,
                        pomodoro_long_break: Number.parseInt(e.target.value) || 15,
                      })
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="mb-4">
            <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
              <SelectTrigger className="w-48 mx-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focus">Tempo de Foco</SelectItem>
                <SelectItem value="short_break">Pausa Curta</SelectItem>
                <SelectItem value="long_break">Pausa Longa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-6xl font-bold text-blue-600 mb-6">{formatTime(timeLeft)}</div>

          {sessionType === "focus" && (
            <div className="space-y-3 mb-6">
              <Input
                placeholder="Matéria (ex: Matemática)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="max-w-xs mx-auto"
              />
              <Input
                placeholder="Tópico (opcional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="max-w-xs mx-auto"
              />
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button onClick={isRunning ? pauseTimer : startTimer} className="bg-green-500 hover:bg-green-600">
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Pausar" : "Iniciar"}
            </Button>
            <Button variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          <p className="text-sm text-gray-600 mt-4">Concentre-se em uma única tarefa. Evite distrações.</p>
        </div>
      </CardContent>
    </Card>
  )
}

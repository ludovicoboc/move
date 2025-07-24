"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { LeisurePreferences, LeisureActivity } from "@/lib/leisure-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Settings, Clock } from "lucide-react"

interface LeisureTimerProps {
  onSessionComplete: (duration: number, activityName?: string) => void
}

const timePresets = [
  { label: "5 minutos", value: "5" },
  { label: "15 minutos", value: "15" },
  { label: "30 minutos", value: "30" },
  { label: "45 minutos", value: "45" },
  { label: "60 minutos", value: "60" },
  { label: "90 minutos", value: "90" },
]

export default function LeisureTimer({ onSessionComplete }: LeisureTimerProps) {
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [activities, setActivities] = useState<LeisureActivity[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<LeisurePreferences | null>(null)
  const [customDuration, setCustomDuration] = useState(30)
  const [selectedPreset, setSelectedPreset] = useState("30")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPreferences()
    fetchActivities()
  }, [])

  useEffect(() => {
    if (preferences) {
      const duration = preferences.default_timer_duration * 60
      setTimeLeft(duration)
      setCustomDuration(preferences.default_timer_duration)
      setSelectedPreset(preferences.default_timer_duration.toString())
    }
  }, [preferences])

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

      const { data, error } = await supabase.from("leisure_preferences").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setPreferences(data)
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          default_timer_duration: 30,
          favorite_categories: [],
          preferred_time_slots: [],
          energy_level_preference: "media",
          notification_enabled: true,
          weekly_leisure_goal: 300,
        }

        const { data: newPrefs, error: insertError } = await supabase
          .from("leisure_preferences")
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

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase.from("leisure_activities").select("*").eq("active", true).order("name")

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error("Erro ao buscar atividades:", error)
    }
  }

  const handleSessionComplete = async () => {
    setIsRunning(false)

    if (startTimeRef.current) {
      const duration = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000 / 60) // minutes
      const activityName = selectedActivity ? activities.find((a) => a.id === selectedActivity)?.name : "Tempo Livre"

      onSessionComplete(duration, activityName)
    }

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Tempo de Lazer Concluído! 🎉", {
        body: "Parabéns! Você dedicou um tempo para si mesmo.",
        icon: "/favicon.ico",
      })
    }

    // Reset timer
    resetTimer()
  }

  const startTimer = () => {
    setIsRunning(true)
    startTimeRef.current = new Date()
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    startTimeRef.current = null
    const duration = selectedPreset === "custom" ? customDuration : Number.parseInt(selectedPreset)
    setTimeLeft(duration * 60)
  }

  const updateDuration = (preset: string) => {
    setSelectedPreset(preset)
    if (preset !== "custom") {
      const duration = Number.parseInt(preset)
      setTimeLeft(duration * 60)
      setCustomDuration(duration)
    }
  }

  const updateCustomDuration = (minutes: number) => {
    setCustomDuration(minutes)
    if (selectedPreset === "custom") {
      setTimeLeft(minutes * 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Temporizador de Lazer
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold text-blue-600 mb-6">{formatTime(timeLeft)}</div>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={isRunning ? pauseTimer : startTimer}
              className="bg-blue-500 hover:bg-blue-600 px-8 py-3 text-lg"
            >
              {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isRunning ? "Pausar" : "Iniciar"}
            </Button>
            <Button variant="outline" onClick={resetTimer} className="px-8 py-3 text-lg bg-transparent">
              <RotateCcw className="h-5 w-5 mr-2" />
              Resetar
            </Button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Configurações</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Presets de Tempo</label>
              <Select value={selectedPreset} onValueChange={updateDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timePresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPreset === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
                <Input
                  type="number"
                  min="1"
                  max="180"
                  value={customDuration}
                  onChange={(e) => updateCustomDuration(Number.parseInt(e.target.value) || 1)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        )}

        {/* Activity Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Atividade (opcional)</label>
          <Select value={selectedActivity} onValueChange={setSelectedActivity}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Tempo Livre</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tip */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-yellow-600 font-semibold text-sm">💡 Dica</div>
          </div>
          <p className="text-sm text-yellow-800 mt-1">
            Use este temporizador para evitar o "vício" em atividades de lazer. Intervalos regulares ajudam a manter o
            equilíbrio em suas atividades diárias.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

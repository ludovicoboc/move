"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, RotateCcw, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Hyperfocus } from "@/lib/hyperfocus-types"

interface FocusTimerProps {
  user: User
}

export default function FocusTimer({ user }: FocusTimerProps) {
  const [hyperfocuses, setHyperfocuses] = useState<Hyperfocus[]>([])
  const [selectedHyperfocus, setSelectedHyperfocus] = useState<string>("")
  const [customTime, setCustomTime] = useState<number>(30)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchHyperfocuses()
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const fetchHyperfocuses = async () => {
    try {
      const { data, error } = await supabase
        .from("hyperfocuses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setHyperfocuses(data || [])
    } catch (error) {
      console.error("Error fetching hyperfocuses:", error)
    }
  }

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setIsPaused(false)

    // Save session to database
    if (selectedHyperfocus && sessionStartTime) {
      try {
        const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000 / 60) // minutes

        await supabase.from("hyperfocus_sessions").insert({
          user_id: user.id,
          hyperfocus_id: selectedHyperfocus,
          duration: duration,
          completed_tasks: [],
          started_at: sessionStartTime.toISOString(),
          completed_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error saving session:", error)
      }
    }

    // Show completion notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Sessão de Hiperfoco Concluída!", {
        body: "Sua sessão de foco foi finalizada. Que tal fazer uma pausa?",
        icon: "/favicon.ico",
      })
    }
  }

  const startTimer = () => {
    if (!selectedHyperfocus) {
      alert("Selecione um hiperfoco primeiro!")
      return
    }

    const selectedHyperfocusData = hyperfocuses.find((h) => h.id === selectedHyperfocus)
    const duration = selectedHyperfocusData?.time_limit || customTime

    setTimeLeft(duration * 60) // convert to seconds
    setIsRunning(true)
    setIsPaused(false)
    setSessionStartTime(new Date())

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
    setIsPaused(true)
  }

  const resumeTimer = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(0)
    setSessionStartTime(null)
  }

  const resetTimer = () => {
    stopTimer()
    const selectedHyperfocusData = hyperfocuses.find((h) => h.id === selectedHyperfocus)
    const duration = selectedHyperfocusData?.time_limit || customTime
    setTimeLeft(duration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (!selectedHyperfocus) return "#6B7280"
    const hyperfocus = hyperfocuses.find((h) => h.id === selectedHyperfocus)
    return hyperfocus?.color || "#6B7280"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Temporizador de Foco</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hyperfocus-select">Hiperfoco para temporizar:</Label>
              <Select value={selectedHyperfocus} onValueChange={setSelectedHyperfocus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um hiperfoco" />
                </SelectTrigger>
                <SelectContent>
                  {hyperfocuses.map((hyperfocus) => (
                    <SelectItem key={hyperfocus.id} value={hyperfocus.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hyperfocus.color }} />
                        {hyperfocus.title}
                        {hyperfocus.time_limit && (
                          <span className="text-xs text-gray-500">({hyperfocus.time_limit}min)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-time">Tempo personalizado (minutos)</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-time"
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(Number.parseInt(e.target.value) || 30)}
                  placeholder="Ex: 30"
                  min="1"
                  max="480"
                  disabled={isRunning}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const selectedHyperfocusData = hyperfocuses.find((h) => h.id === selectedHyperfocus)
                    const duration = selectedHyperfocusData?.time_limit || customTime
                    setTimeLeft(duration * 60)
                  }}
                  disabled={isRunning}
                >
                  Definir
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
              <strong>Som de alarme:</strong> 🔔
            </div>
          </CardContent>
        </Card>

        {/* Timer Display */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Circular Timer Display */}
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getTimerColor()}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / ((hyperfocuses.find((h) => h.id === selectedHyperfocus)?.time_limit || customTime) * 60))}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800">{formatTime(timeLeft)}</div>
                    {selectedHyperfocus && (
                      <div className="text-sm text-gray-500 mt-1">
                        {hyperfocuses.find((h) => h.id === selectedHyperfocus)?.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-2">
                {!isRunning && !isPaused && (
                  <Button onClick={startTimer} className="bg-blue-500 hover:bg-blue-600" disabled={!selectedHyperfocus}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                )}

                {isRunning && (
                  <Button onClick={pauseTimer} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                )}

                {isPaused && (
                  <Button onClick={resumeTimer} className="bg-green-500 hover:bg-green-600">
                    <Play className="h-4 w-4 mr-2" />
                    Retomar
                  </Button>
                )}

                {(isRunning || isPaused) && (
                  <Button onClick={stopTimer} variant="outline">
                    <Square className="h-4 w-4 mr-2" />
                    Parar
                  </Button>
                )}

                <Button onClick={resetTimer} variant="outline" disabled={isRunning}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                {isPaused ? "Temporizado pausado" : isRunning ? "Em andamento..." : "Pronto para iniciar"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Dica para gerenciar o tempo</p>
              <p>
                Utilize temporizadores para se manter no foco e evitar hiperfocos prolongados. Defina intervalos de
                trabalho e pausa regulares para manter a produtividade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

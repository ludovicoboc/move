"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SleepRecord, SleepStats, WeeklyData } from "@/lib/sleep-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Moon, Sun, TrendingUp, Minus } from "lucide-react"

export default function SleepVisualizer() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [weekStats, setWeekStats] = useState<SleepStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchWeeklyData()
  }, [currentWeek])

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day

    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)
      week.push(currentDate)
    }

    return week
  }

  const fetchWeeklyData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const weekDates = getWeekDates(currentWeek)
      const startDate = weekDates[0].toISOString().split("T")[0]
      const endDate = weekDates[6].toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("user_id", user.id)
        .gte("sleep_date", startDate)
        .lte("sleep_date", endDate)
        .order("sleep_date")

      if (error) throw error

      const records = data || []
      const weeklyData: WeeklyData[] = weekDates.map((date) => {
        const dateString = date.toISOString().split("T")[0]
        const record = records.find((r) => r.sleep_date === dateString)
        return {
          date: dateString,
          dayName: date.toLocaleDateString("pt-BR", { weekday: "short" }),
          sleepRecord: record,
          hasData: !!record,
        }
      })

      setWeeklyData(weeklyData)
      calculateWeekStats(records)
    } catch (error) {
      console.error("Erro ao buscar dados semanais:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWeekStats = (records: SleepRecord[]) => {
    if (records.length === 0) {
      setWeekStats(null)
      return
    }

    const totalDuration = records.reduce((sum, record) => sum + record.sleep_duration_minutes, 0)
    const totalQuality = records.reduce((sum, record) => sum + record.sleep_quality, 0)

    const averageDuration = totalDuration / records.length
    const averageQuality = totalQuality / records.length

    // Calculate average bedtime and wake time
    const bedtimes = records.map((r) => {
      const [hours, minutes] = r.bedtime.split(":").map(Number)
      return hours * 60 + minutes
    })
    const waketimes = records.map((r) => {
      const [hours, minutes] = r.wake_time.split(":").map(Number)
      return hours * 60 + minutes
    })

    const avgBedtimeMinutes = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length
    const avgWaketimeMinutes = waketimes.reduce((sum, time) => sum + time, 0) / waketimes.length

    const avgBedtime = `${Math.floor(avgBedtimeMinutes / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(avgBedtimeMinutes % 60)
      .toString()
      .padStart(2, "0")}`
    const avgWaketime = `${Math.floor(avgWaketimeMinutes / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(avgWaketimeMinutes % 60)
      .toString()
      .padStart(2, "0")}`

    // Find best and worst days
    const bestDay = records.reduce((best, current) => (current.sleep_quality > best.sleep_quality ? current : best))
    const worstDay = records.reduce((worst, current) => (current.sleep_quality < worst.sleep_quality ? current : worst))

    // Calculate sleep efficiency (assuming 8 hours in bed)
    const sleepEfficiency = (averageDuration / 480) * 100 // 480 minutes = 8 hours

    // Calculate consistency score based on bedtime variance
    const bedtimeVariance =
      bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtimeMinutes, 2), 0) / bedtimes.length
    const consistencyScore = Math.max(0, 100 - Math.sqrt(bedtimeVariance) / 6) // Normalize to 0-100

    setWeekStats({
      averageDuration,
      averageQuality,
      averageBedtime: avgBedtime,
      averageWakeTime: avgWaketime,
      totalRecords: records.length,
      bestDay,
      worstDay,
      sleepEfficiency,
      consistencyScore,
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return "bg-green-500"
    if (quality >= 3) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getDayColor = (data: WeeklyData) => {
    if (!data.hasData) return "bg-gray-200"
    return getQualityColor(data.sleepRecord!.sleep_quality)
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentWeek(newDate)
  }

  const getWeekRange = () => {
    const weekDates = getWeekDates(currentWeek)
    const start = weekDates[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    const end = weekDates[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    const year = weekDates[0].getFullYear()
    return `${start} - ${end} de ${weekDates[0].toLocaleDateString("pt-BR", { month: "long" })} ${year}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualizador Semanal de Sono</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualizador Semanal de Sono</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="font-medium">{getWeekRange()}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2 capitalize">{day.dayName}</div>
              <div className="text-xs text-gray-500 mb-2">
                {new Date(day.date).toLocaleDateString("pt-BR", { day: "2-digit" })}
              </div>
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${getDayColor(day)}`}
                title={
                  day.hasData
                    ? `Qualidade: ${day.sleepRecord!.sleep_quality}/5 - ${formatDuration(
                        day.sleepRecord!.sleep_duration_minutes,
                      )}`
                    : "Sem dados"
                }
              >
                {day.hasData ? (
                  <span className="text-white font-bold">{day.sleepRecord!.sleep_quality}</span>
                ) : (
                  <Minus className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Week Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Média da Semana</span>
            </div>
            <div className="pl-7">
              <div className="text-2xl font-bold">{weekStats ? formatDuration(weekStats.averageDuration) : "0h"}</div>
              <div className="text-sm text-gray-600">Horas de sono</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Melhor e Pior Dia</span>
            </div>
            <div className="pl-7">
              <div className="text-2xl font-bold">
                {weekStats && weekStats.bestDay ? `${weekStats.bestDay.sleep_quality}` : "-"}/5
              </div>
              <div className="text-sm text-gray-600">Qualidade média</div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        {weekStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Horário Médio</span>
              </div>
              <div className="font-bold">Dormir: {weekStats.averageBedtime}</div>
              <div className="font-bold">Acordar: {weekStats.averageWakeTime}</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Eficiência</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(weekStats.sleepEfficiency)}%</div>
              <div className="text-xs text-gray-500">Tempo dormindo</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Consistência</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(weekStats.consistencyScore)}%</div>
              <div className="text-xs text-gray-500">Regularidade</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">Registros</span>
              </div>
              <div className="text-2xl font-bold">{weekStats.totalRecords}</div>
              <div className="text-xs text-gray-500">de 7 dias</div>
            </div>
          </div>
        )}

        {/* Week Details */}
        <div>
          <h3 className="font-semibold mb-3">Detalhes da Semana</h3>
          {weeklyData.some((day) => day.hasData) ? (
            <div className="space-y-2">
              {weeklyData
                .filter((day) => day.hasData)
                .map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getQualityColor(day.sleepRecord!.sleep_quality)}`}></div>
                      <div>
                        <div className="font-medium capitalize">
                          {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit" })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {day.sleepRecord!.bedtime} - {day.sleepRecord!.wake_time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatDuration(day.sleepRecord!.sleep_duration_minutes)}</div>
                      <div className="text-sm text-gray-600">Qualidade: {day.sleepRecord!.sleep_quality}/5</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum registro encontrado para esta semana</p>
            </div>
          )}
        </div>

        {/* Sleep Importance Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">A importância do sono</h4>
          <p className="text-sm text-blue-700 mb-3">
            O sono de qualidade é essencial para a saúde cerebral e física, especialmente para pessoas neurodivergentes.
            Regular seus ciclos de sono pode ajudar a melhorar a autorregulação sensorial e melhorar o funcionamento
            cognitivo.
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Tente manter horários regulares para dormir e acordar</li>
            <li>• Crie uma rotina relaxante antes de dormir</li>
            <li>• Reduza a exposição à luz azul pelo menos 1 hora antes de dormir</li>
            <li>• Evite cafeína e estimulantes no período da tarde</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

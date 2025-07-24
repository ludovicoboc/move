"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SleepHygieneTip, SleepRecord } from "@/lib/sleep-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, Home, Clock, Heart, Coffee, RefreshCw, TrendingUp, AlertCircle } from "lucide-react"

const categoryIcons = {
  environment: Home,
  routine: Clock,
  lifestyle: Heart,
  diet: Coffee,
}

const categoryColors = {
  environment: "bg-green-100 text-green-800",
  routine: "bg-blue-100 text-blue-800",
  lifestyle: "bg-purple-100 text-purple-800",
  diet: "bg-orange-100 text-orange-800",
}

const categoryNames = {
  environment: "Ambiente",
  routine: "Rotina",
  lifestyle: "Estilo de Vida",
  diet: "Alimentação",
}

export default function SleepHygieneTips() {
  const [tips, setTips] = useState<SleepHygieneTip[]>([])
  const [recentRecords, setRecentRecords] = useState<SleepRecord[]>([])
  const [personalizedTips, setPersonalizedTips] = useState<SleepHygieneTip[]>([])
  const [sleepScore, setSleepScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([fetchTips(), fetchRecentRecords()])
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase.from("sleep_hygiene_tips").select("*").order("priority").order("category")

      if (error) throw error
      setTips(data || [])
    } catch (error) {
      console.error("Erro ao buscar dicas:", error)
    }
  }

  const fetchRecentRecords = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("user_id", user.id)
        .order("sleep_date", { ascending: false })
        .limit(14) // Last 2 weeks

      if (error) throw error
      const records = data || []
      setRecentRecords(records)
      calculateSleepScore(records)
      generatePersonalizedTips(records)
    } catch (error) {
      console.error("Erro ao buscar registros:", error)
    }
  }

  const calculateSleepScore = (records: SleepRecord[]) => {
    if (records.length === 0) {
      setSleepScore(0)
      return
    }

    const recentRecords = records.slice(0, 7) // Last week
    let score = 0
    let factors = 0

    // Quality score (0-25 points)
    const avgQuality = recentRecords.reduce((sum, r) => sum + r.sleep_quality, 0) / recentRecords.length
    score += (avgQuality / 5) * 25
    factors++

    // Duration score (0-25 points) - optimal 7-9 hours
    const avgDuration = recentRecords.reduce((sum, r) => sum + r.sleep_duration_minutes, 0) / recentRecords.length
    const avgHours = avgDuration / 60
    let durationScore = 0
    if (avgHours >= 7 && avgHours <= 9) {
      durationScore = 25
    } else if (avgHours >= 6 && avgHours <= 10) {
      durationScore = 20
    } else if (avgHours >= 5 && avgHours <= 11) {
      durationScore = 15
    } else {
      durationScore = 10
    }
    score += durationScore
    factors++

    // Consistency score (0-25 points)
    const bedtimes = recentRecords.map((r) => {
      const [hours, minutes] = r.bedtime.split(":").map(Number)
      return hours * 60 + minutes
    })
    const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length
    const bedtimeVariance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length
    const consistencyScore = Math.max(0, 25 - Math.sqrt(bedtimeVariance) / 12)
    score += consistencyScore
    factors++

    // Habits score (0-25 points)
    const habitsScore = recentRecords.reduce((sum, r) => {
      let recordScore = 0
      if (!r.caffeine_intake) recordScore += 5 // No caffeine
      if (!r.exercise_before_sleep) recordScore += 5 // No exercise before sleep
      if (r.screen_time_before_sleep <= 30) recordScore += 5 // Limited screen time
      if (r.sleep_latency_minutes && r.sleep_latency_minutes <= 20) recordScore += 5 // Good sleep latency
      if (r.wake_up_count <= 1) recordScore += 5 // Few wake-ups
      return sum + recordScore
    }, 0)
    score += habitsScore / recentRecords.length
    factors++

    setSleepScore(Math.round(score))
  }

  const generatePersonalizedTips = (records: SleepRecord[]) => {
    if (records.length === 0) {
      setPersonalizedTips([])
      return
    }

    const recentRecords = records.slice(0, 7)
    const personalizedTips: SleepHygieneTip[] = []

    // Analyze patterns and suggest improvements
    const avgQuality = recentRecords.reduce((sum, r) => sum + r.sleep_quality, 0) / recentRecords.length
    const avgDuration = recentRecords.reduce((sum, r) => sum + r.sleep_duration_minutes, 0) / recentRecords.length
    const caffeineCount = recentRecords.filter((r) => r.caffeine_intake).length
    const exerciseCount = recentRecords.filter((r) => r.exercise_before_sleep).length
    const highScreenTime = recentRecords.filter((r) => r.screen_time_before_sleep > 60).length

    if (avgQuality < 3) {
      personalizedTips.push({
        id: "quality-low",
        category: "routine",
        title: "Melhore sua qualidade de sono",
        description:
          "Sua qualidade de sono está abaixo do ideal. Tente criar uma rotina relaxante antes de dormir e mantenha o quarto escuro e silencioso.",
        priority: 1,
        created_at: new Date().toISOString(),
      })
    }

    if (avgDuration < 420) {
      // Less than 7 hours
      personalizedTips.push({
        id: "duration-short",
        category: "routine",
        title: "Aumente sua duração de sono",
        description:
          "Você está dormindo menos de 7 horas por noite. Tente ir para a cama mais cedo ou acordar mais tarde para atingir 7-9 horas de sono.",
        priority: 1,
        created_at: new Date().toISOString(),
      })
    }

    if (caffeineCount > 3) {
      personalizedTips.push({
        id: "caffeine-high",
        category: "diet",
        title: "Reduza o consumo de cafeína",
        description:
          "Você tem consumido cafeína frequentemente. Tente evitar cafeína pelo menos 6 horas antes de dormir.",
        priority: 2,
        created_at: new Date().toISOString(),
      })
    }

    if (exerciseCount > 2) {
      personalizedTips.push({
        id: "exercise-timing",
        category: "lifestyle",
        title: "Ajuste o horário dos exercícios",
        description:
          "Exercitar-se muito próximo ao horário de dormir pode atrapalhar o sono. Tente terminar exercícios intensos pelo menos 3 horas antes de deitar.",
        priority: 2,
        created_at: new Date().toISOString(),
      })
    }

    if (highScreenTime > 3) {
      personalizedTips.push({
        id: "screen-time-high",
        category: "environment",
        title: "Reduza o tempo de tela antes de dormir",
        description:
          "Você tem passado muito tempo em telas antes de dormir. A luz azul pode interferir na produção de melatonina. Tente desligar dispositivos 1 hora antes de deitar.",
        priority: 1,
        created_at: new Date().toISOString(),
      })
    }

    setPersonalizedTips(personalizedTips)
  }

  const getSleepScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSleepScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Bom"
    if (score >= 40) return "Regular"
    return "Precisa melhorar"
  }

  const filteredTips = selectedCategory ? tips.filter((tip) => tip.category === selectedCategory) : tips

  const categories = Array.from(new Set(tips.map((tip) => tip.category)))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Higiene do Sono</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sleep Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pontuação do Sono
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getSleepScoreColor(sleepScore)}`}>{sleepScore}/100</div>
              <div className="text-sm text-gray-600">{getSleepScoreLabel(sleepScore)}</div>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
          <Progress value={sleepScore} className="mb-4" />
          <div className="text-sm text-gray-600">
            Baseado nos seus registros dos últimos 7 dias. Inclui qualidade, duração, consistência e hábitos de sono.
          </div>
        </CardContent>
      </Card>

      {/* Personalized Tips */}
      {personalizedTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Dicas Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalizedTips.map((tip) => {
                const Icon = categoryIcons[tip.category as keyof typeof categoryIcons]
                return (
                  <div key={tip.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-orange-800">{tip.title}</h4>
                          <Badge className={categoryColors[tip.category as keyof typeof categoryColors]}>
                            {categoryNames[tip.category as keyof typeof categoryNames]}
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Dicas de Higiene do Sono
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Button>
            {categories.map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons]
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-4 w-4" />
                  {categoryNames[category as keyof typeof categoryNames]}
                </Button>
              )
            })}
          </div>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTips.map((tip) => {
              const Icon = categoryIcons[tip.category as keyof typeof categoryIcons]
              return (
                <div key={tip.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{tip.title}</h4>
                        <Badge className={categoryColors[tip.category as keyof typeof categoryColors]}>
                          {categoryNames[tip.category as keyof typeof categoryNames]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

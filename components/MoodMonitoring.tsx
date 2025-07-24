"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import type { MoodRecord } from "@/lib/health-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Plus, Smile, ChevronLeft, ChevronRight, Info } from "lucide-react"

const moodEmojis = {
  1: "😢",
  2: "😟",
  3: "😕",
  4: "😐",
  5: "😐",
  6: "🙂",
  7: "😊",
  8: "😄",
  9: "😁",
  10: "🤩",
}

const moodLabels = {
  1: "Muito Ruim",
  2: "Ruim",
  3: "Ruim",
  4: "Neutro",
  5: "Neutro",
  6: "Neutro",
  7: "Bom",
  8: "Bom",
  9: "Muito Bom",
  10: "Muito Bom",
}

export default function MoodMonitoring() {
  const { user, loading: userLoading } = useUser()
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [formData, setFormData] = useState({
    mood_score: 5,
    notes: "",
    energy_level: 5,
    sleep_quality: 5,
    stress_level: 5,
    activities: [] as string[],
    triggers: [] as string[],
  })
  const [newActivity, setNewActivity] = useState("")
  const [newTrigger, setNewTrigger] = useState("")
  const supabase = createClient()

  // Mostrar loading enquanto usuário está carregando
  if (userLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5" />
              Carregando registros de humor...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Se não há usuário, não renderizar nada
  if (!user) {
    return null
  }

  useEffect(() => {
    if (!userLoading && user) {
      fetchMoodRecords()
    }
  }, [currentDate, user, userLoading])

  const fetchMoodRecords = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO MOOD:', user?.id)
      setLoading(false)
      return
    }

    console.log('🔍 BUSCANDO MOOD RECORDS para:', user.id)

    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from("mood_records")
        .select("*")
        .eq("user_id", user.id)
        .gte("record_date", startOfMonth.toISOString().split("T")[0])
        .lte("record_date", endOfMonth.toISOString().split("T")[0])
        .order("record_date", { ascending: false })

      if (error) {
        console.error('❌ ERRO MOOD RECORDS:', error)
        throw error
      }
      
      setMoodRecords(data || [])
      console.log('✅ MOOD RECORDS CARREGADOS:', data?.length)
    } catch (error) {
      console.error('❌ ERRO GERAL MOOD:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO SUBMIT MOOD:', user?.id)
      return
    }

    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if record already exists for today
      const { data: existingRecord } = await supabase
        .from("mood_records")
        .select("id")
        .eq("user_id", user.id)
        .eq("record_date", today)
        .single()

      const recordData = {
        user_id: user.id,
        mood_score: formData.mood_score,
        mood_label: getMoodLabel(formData.mood_score),
        notes: formData.notes.trim() || null,
        energy_level: formData.energy_level,
        sleep_quality: formData.sleep_quality,
        stress_level: formData.stress_level,
        activities: formData.activities.length > 0 ? formData.activities : null,
        triggers: formData.triggers.length > 0 ? formData.triggers : null,
        record_date: today,
      }

      if (existingRecord) {
        const { error } = await supabase.from("mood_records").update(recordData).eq("id", existingRecord.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("mood_records").insert(recordData)

        if (error) throw error
      }

      setFormData({
        mood_score: 5,
        notes: "",
        energy_level: 5,
        sleep_quality: 5,
        stress_level: 5,
        activities: [],
        triggers: [],
      })
      setShowForm(false)
      fetchMoodRecords()
    } catch (error) {
      console.error("Erro ao salvar registro de humor:", error)
    }
  }

  const getMoodLabel = (score: number): any => {
    if (score <= 2) return "muito_ruim"
    if (score <= 4) return "ruim"
    if (score <= 6) return "neutro"
    if (score <= 8) return "bom"
    return "muito_bom"
  }

  const addActivity = () => {
    if (newActivity.trim() && !formData.activities.includes(newActivity.trim())) {
      setFormData({
        ...formData,
        activities: [...formData.activities, newActivity.trim()],
      })
      setNewActivity("")
    }
  }

  const addTrigger = () => {
    if (newTrigger.trim() && !formData.triggers.includes(newTrigger.trim())) {
      setFormData({
        ...formData,
        triggers: [...formData.triggers, newTrigger.trim()],
      })
      setNewTrigger("")
    }
  }

  const removeActivity = (activity: string) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((a) => a !== activity),
    })
  }

  const removeTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.filter((t) => t !== trigger),
    })
  }

  const getAverageMood = () => {
    if (moodRecords.length === 0) return 0
    const sum = moodRecords.reduce((acc, record) => acc + record.mood_score, 0)
    return Math.round(sum / moodRecords.length)
  }

  const getMoodForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return moodRecords.find((record) => record.record_date === dateString)
  }

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const calendarDays = generateCalendar()
  const averageMood = getAverageMood()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento de Humor</CardTitle>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monitoramento de Humor</CardTitle>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">Humor Médio</span>
          </div>
          <div className="text-2xl font-bold">{averageMood}</div>
          <div className="text-sm text-gray-500">Baseado em todos os registros</div>
        </div>

        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Calendário de Humor</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const mood = getMoodForDate(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = day.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`
                    p-2 text-center text-sm border rounded cursor-pointer hover:bg-gray-50
                    ${!isCurrentMonth ? "text-gray-300 bg-gray-50" : ""}
                    ${isToday ? "ring-2 ring-blue-500" : ""}
                  `}
                >
                  <div className="font-medium">{day.getDate()}</div>
                  {mood && isCurrentMonth && (
                    <div className="text-lg" title={`Humor: ${mood.mood_score}/10`}>
                      {moodEmojis[mood.mood_score as keyof typeof moodEmojis]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Records */}
        <div>
          <h3 className="font-semibold mb-3">Registros Recentes</h3>
          {moodRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-blue-500 mb-2">
                <Info className="h-5 w-5" />
                <span className="text-sm">Nenhum registro encontrado</span>
              </div>
              <p className="text-sm text-gray-400">
                Adicione seu primeiro registro de humor usando o botão "Novo Registro".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {moodRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{moodEmojis[record.mood_score as keyof typeof moodEmojis]}</div>
                      <div>
                        <div className="font-medium">
                          {moodLabels[record.mood_score as keyof typeof moodLabels]} ({record.mood_score}/10)
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.record_date).toLocaleDateString("pt-BR")}
                        </div>
                        {record.notes && <div className="text-sm text-gray-600 mt-1">{record.notes}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {record.energy_level && (
                        <Badge variant="outline" className="text-xs">
                          Energia: {record.energy_level}/10
                        </Badge>
                      )}
                      {record.sleep_quality && (
                        <Badge variant="outline" className="text-xs">
                          Sono: {record.sleep_quality}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                  {(record.activities || record.triggers) && (
                    <div className="mt-3 flex gap-4">
                      {record.activities && record.activities.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Atividades:</div>
                          <div className="flex gap-1">
                            {record.activities.map((activity, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {record.triggers && record.triggers.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Gatilhos:</div>
                          <div className="flex gap-1">
                            {record.triggers.map((trigger, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">Novo Registro de Humor</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Como você está se sentindo hoje? ({formData.mood_score}/10)
                </label>
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{moodEmojis[formData.mood_score as keyof typeof moodEmojis]}</div>
                  <div className="text-lg font-medium">
                    {moodLabels[formData.mood_score as keyof typeof moodLabels]}
                  </div>
                </div>
                <Slider
                  value={[formData.mood_score]}
                  onValueChange={(value) => setFormData({ ...formData, mood_score: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muito Ruim</span>
                  <span>Neutro</span>
                  <span>Muito Bom</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nível de Energia ({formData.energy_level}/10)
                  </label>
                  <Slider
                    value={[formData.energy_level]}
                    onValueChange={(value) => setFormData({ ...formData, energy_level: value[0] })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Qualidade do Sono ({formData.sleep_quality}/10)
                  </label>
                  <Slider
                    value={[formData.sleep_quality]}
                    onValueChange={(value) => setFormData({ ...formData, sleep_quality: value[0] })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nível de Estresse ({formData.stress_level}/10)
                  </label>
                  <Slider
                    value={[formData.stress_level]}
                    onValueChange={(value) => setFormData({ ...formData, stress_level: value[0] })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Atividades do Dia</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="Ex: Exercício, Trabalho, Leitura"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addActivity())}
                  />
                  <Button type="button" onClick={addActivity}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.activities.map((activity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeActivity(activity)}
                    >
                      {activity} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gatilhos ou Fatores Negativos</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="Ex: Estresse no trabalho, Discussão"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTrigger())}
                  />
                  <Button type="button" onClick={addTrigger}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.triggers.map((trigger, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeTrigger(trigger)}
                    >
                      {trigger} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Como foi seu dia? O que influenciou seu humor?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar Registro</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

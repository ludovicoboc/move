"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SleepRecord } from "@/lib/sleep-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Plus, Moon, Sun, Star, Clock, Coffee, Dumbbell, Smartphone } from "lucide-react"

export default function SleepRecorder() {
  const [recentRecords, setRecentRecords] = useState<SleepRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sleep_date: new Date().toISOString().split("T")[0],
    bedtime: "22:00",
    wake_time: "07:00",
    sleep_quality: 3,
    notes: "",
    sleep_latency_minutes: 15,
    wake_up_count: 0,
    sleep_environment_rating: 3,
    stress_level: 3,
    caffeine_intake: false,
    exercise_before_sleep: false,
    screen_time_before_sleep: 60,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchRecentRecords()
  }, [])

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
        .limit(7)

      if (error) throw error
      setRecentRecords(data || [])
    } catch (error) {
      console.error("Erro ao buscar registros de sono:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Check if record already exists for this date
      const { data: existingRecord } = await supabase
        .from("sleep_records")
        .select("id")
        .eq("user_id", user.id)
        .eq("sleep_date", formData.sleep_date)
        .single()

      const recordData = {
        user_id: user.id,
        sleep_date: formData.sleep_date,
        bedtime: formData.bedtime,
        wake_time: formData.wake_time,
        sleep_quality: formData.sleep_quality,
        notes: formData.notes.trim() || null,
        sleep_latency_minutes: formData.sleep_latency_minutes,
        wake_up_count: formData.wake_up_count,
        sleep_environment_rating: formData.sleep_environment_rating,
        stress_level: formData.stress_level,
        caffeine_intake: formData.caffeine_intake,
        exercise_before_sleep: formData.exercise_before_sleep,
        screen_time_before_sleep: formData.screen_time_before_sleep,
      }

      if (existingRecord) {
        const { error } = await supabase.from("sleep_records").update(recordData).eq("id", existingRecord.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("sleep_records").insert(recordData)
        if (error) throw error
      }

      setFormData({
        sleep_date: new Date().toISOString().split("T")[0],
        bedtime: "22:00",
        wake_time: "07:00",
        sleep_quality: 3,
        notes: "",
        sleep_latency_minutes: 15,
        wake_up_count: 0,
        sleep_environment_rating: 3,
        stress_level: 3,
        caffeine_intake: false,
        exercise_before_sleep: false,
        screen_time_before_sleep: 60,
      })
      setShowForm(false)
      fetchRecentRecords()
    } catch (error) {
      console.error("Erro ao salvar registro de sono:", error)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return "text-green-600"
    if (quality >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityStars = (quality: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < quality ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registrar Sono</CardTitle>
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
        <CardTitle>Registrar Sono</CardTitle>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        {showForm && (
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">Registro de Sono</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sleep_date">Data</Label>
                  <Input
                    id="sleep_date"
                    type="date"
                    value={formData.sleep_date}
                    onChange={(e) => setFormData({ ...formData, sleep_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bedtime" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Horário de dormir
                  </Label>
                  <Input
                    id="bedtime"
                    type="time"
                    value={formData.bedtime}
                    onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="wake_time" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Horário de acordar
                  </Label>
                  <Input
                    id="wake_time"
                    type="time"
                    value={formData.wake_time}
                    onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Qualidade do sono ({formData.sleep_quality}/5)</Label>
                <div className="flex items-center gap-2 mb-2">{getQualityStars(formData.sleep_quality)}</div>
                <Slider
                  value={[formData.sleep_quality]}
                  onValueChange={(value) => setFormData({ ...formData, sleep_quality: value[0] })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muito Ruim</span>
                  <span>Excelente</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep_latency">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Tempo para adormecer (minutos)
                  </Label>
                  <Input
                    id="sleep_latency"
                    type="number"
                    min="0"
                    value={formData.sleep_latency_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, sleep_latency_minutes: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="wake_up_count">Número de despertares</Label>
                  <Input
                    id="wake_up_count"
                    type="number"
                    min="0"
                    value={formData.wake_up_count}
                    onChange={(e) => setFormData({ ...formData, wake_up_count: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Ambiente do sono ({formData.sleep_environment_rating}/5)</Label>
                  <Slider
                    value={[formData.sleep_environment_rating]}
                    onValueChange={(value) => setFormData({ ...formData, sleep_environment_rating: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Nível de estresse ({formData.stress_level}/5)</Label>
                  <Slider
                    value={[formData.stress_level]}
                    onValueChange={(value) => setFormData({ ...formData, stress_level: value[0] })}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="screen_time">
                  <Smartphone className="h-4 w-4 inline mr-1" />
                  Tempo de tela antes de dormir (minutos)
                </Label>
                <Input
                  id="screen_time"
                  type="number"
                  min="0"
                  value={formData.screen_time_before_sleep}
                  onChange={(e) =>
                    setFormData({ ...formData, screen_time_before_sleep: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caffeine"
                    checked={formData.caffeine_intake}
                    onCheckedChange={(checked) => setFormData({ ...formData, caffeine_intake: checked as boolean })}
                  />
                  <Label htmlFor="caffeine" className="flex items-center gap-1">
                    <Coffee className="h-4 w-4" />
                    Consumiu cafeína
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exercise"
                    checked={formData.exercise_before_sleep}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, exercise_before_sleep: checked as boolean })
                    }
                  />
                  <Label htmlFor="exercise" className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    Exercitou-se antes de dormir
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Exemplo: Acordei várias vezes, tive sonhos vívidos, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Registrar Sono</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Records */}
        <div>
          <h3 className="font-semibold mb-3">Registros Recentes</h3>
          {recentRecords.length === 0 ? (
            <div className="text-center py-8">
              <Moon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhum registro de sono encontrado</p>
              <p className="text-sm text-gray-400">Adicione seu primeiro registro usando o botão "Novo Registro".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{new Date(record.sleep_date).toLocaleDateString("pt-BR")}</span>
                        <div className="flex">{getQualityStars(record.sleep_quality)}</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Moon className="h-4 w-4" />
                          {record.bedtime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Sun className="h-4 w-4" />
                          {record.wake_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(record.sleep_duration_minutes)}
                        </div>
                        <div className={`font-medium ${getQualityColor(record.sleep_quality)}`}>
                          Qualidade: {record.sleep_quality}/5
                        </div>
                      </div>
                      {record.notes && <p className="text-sm text-gray-600 mt-2">{record.notes}</p>}
                      <div className="flex gap-2 mt-2">
                        {record.caffeine_intake && (
                          <Badge variant="outline" className="text-xs">
                            <Coffee className="h-3 w-3 mr-1" />
                            Cafeína
                          </Badge>
                        )}
                        {record.exercise_before_sleep && (
                          <Badge variant="outline" className="text-xs">
                            <Dumbbell className="h-3 w-3 mr-1" />
                            Exercício
                          </Badge>
                        )}
                        {record.screen_time_before_sleep > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Smartphone className="h-3 w-3 mr-1" />
                            {record.screen_time_before_sleep}min tela
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

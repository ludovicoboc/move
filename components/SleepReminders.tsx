"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SleepReminder } from "@/lib/sleep-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Moon, Sun, Bell, Trash2, Edit } from "lucide-react"

const daysOfWeek = [
  { value: 0, label: "Dom", fullName: "Domingo" },
  { value: 1, label: "Seg", fullName: "Segunda" },
  { value: 2, label: "Ter", fullName: "Terça" },
  { value: 3, label: "Qua", fullName: "Quarta" },
  { value: 4, label: "Qui", fullName: "Quinta" },
  { value: 5, label: "Sex", fullName: "Sexta" },
  { value: 6, label: "Sáb", fullName: "Sábado" },
]

export default function SleepReminders() {
  const [reminders, setReminders] = useState<SleepReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<SleepReminder | null>(null)
  const [formData, setFormData] = useState({
    reminder_type: "bedtime" as "bedtime" | "wake_time",
    time: "22:00",
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    title: "",
    message: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("sleep_reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setReminders(data || [])
    } catch (error) {
      console.error("Erro ao buscar lembretes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.days_of_week.length === 0) {
      alert("Selecione pelo menos um dia da semana")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const reminderData = {
        user_id: user.id,
        reminder_type: formData.reminder_type,
        time: formData.time,
        days_of_week: formData.days_of_week,
        title: formData.title.trim() || null,
        message: formData.message.trim() || null,
        active: true,
      }

      if (editingReminder) {
        const { error } = await supabase.from("sleep_reminders").update(reminderData).eq("id", editingReminder.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("sleep_reminders").insert(reminderData)
        if (error) throw error
      }

      setFormData({
        reminder_type: "bedtime",
        time: "22:00",
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        title: "",
        message: "",
      })
      setShowForm(false)
      setEditingReminder(null)
      fetchReminders()
    } catch (error) {
      console.error("Erro ao salvar lembrete:", error)
    }
  }

  const handleEdit = (reminder: SleepReminder) => {
    setEditingReminder(reminder)
    setFormData({
      reminder_type: reminder.reminder_type,
      time: reminder.time,
      days_of_week: reminder.days_of_week,
      title: reminder.title || "",
      message: reminder.message || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (reminderId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lembrete?")) return

    try {
      const { error } = await supabase.from("sleep_reminders").delete().eq("id", reminderId)
      if (error) throw error
      fetchReminders()
    } catch (error) {
      console.error("Erro ao excluir lembrete:", error)
    }
  }

  const toggleReminderActive = async (reminderId: string, active: boolean) => {
    try {
      const { error } = await supabase.from("sleep_reminders").update({ active }).eq("id", reminderId)
      if (error) throw error
      fetchReminders()
    } catch (error) {
      console.error("Erro ao atualizar lembrete:", error)
    }
  }

  const toggleDay = (day: number) => {
    const newDays = formData.days_of_week.includes(day)
      ? formData.days_of_week.filter((d) => d !== day)
      : [...formData.days_of_week, day].sort()
    setFormData({ ...formData, days_of_week: newDays })
  }

  const getDaysText = (days: number[]) => {
    if (days.length === 7) return "Todos os dias"
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Dias úteis"
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "Fins de semana"
    return days
      .sort()
      .map((day) => daysOfWeek[day].label)
      .join(", ")
  }

  const bedtimeReminders = reminders.filter((r) => r.reminder_type === "bedtime")
  const waketimeReminders = reminders.filter((r) => r.reminder_type === "wake_time")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lembretes</CardTitle>
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
        <CardTitle>Lembretes</CardTitle>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingReminder(null)
            setFormData({
              reminder_type: "bedtime",
              time: "22:00",
              days_of_week: [0, 1, 2, 3, 4, 5, 6],
              title: "",
              message: "",
            })
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Lembrete
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        {showForm && (
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">{editingReminder ? "Editar Lembrete" : "Configuração de Lembretes"}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="mb-3 block">Tipo de Lembrete</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reminder_type"
                      value="bedtime"
                      checked={formData.reminder_type === "bedtime"}
                      onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value as any })}
                    />
                    <Moon className="h-4 w-4" />
                    Hora de dormir
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reminder_type"
                      value="wake_time"
                      checked={formData.reminder_type === "wake_time"}
                      onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value as any })}
                    />
                    <Sun className="h-4 w-4" />
                    Hora de acordar
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label className="mb-3 block">Dias da Semana</Label>
                <div className="flex gap-2 mb-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        formData.days_of_week.includes(day.value)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-600">{getDaysText(formData.days_of_week)}</div>
              </div>

              <div>
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Hora de dormir!"
                />
              </div>

              <div>
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Input
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ex: Prepare-se para uma boa noite de sono"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingReminder ? "Atualizar" : "Adicionar Lembrete"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingReminder(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bedtime Reminders */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Lembretes para Dormir</h3>
            </div>
            {bedtimeReminders.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-gray-500">Nenhum lembrete configurado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bedtimeReminders.map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold">{reminder.time}</span>
                          <Switch
                            checked={reminder.active}
                            onCheckedChange={(checked) => toggleReminderActive(reminder.id, checked)}
                          />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{getDaysText(reminder.days_of_week)}</div>
                        {reminder.title && <div className="font-medium">{reminder.title}</div>}
                        {reminder.message && <div className="text-sm text-gray-600">{reminder.message}</div>}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(reminder)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(reminder.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wake Time Reminders */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Lembretes para Acordar</h3>
            </div>
            {waketimeReminders.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-gray-500">Nenhum lembrete configurado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waketimeReminders.map((reminder) => (
                  <div key={reminder.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold">{reminder.time}</span>
                          <Switch
                            checked={reminder.active}
                            onCheckedChange={(checked) => toggleReminderActive(reminder.id, checked)}
                          />
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{getDaysText(reminder.days_of_week)}</div>
                        {reminder.title && <div className="font-medium">{reminder.title}</div>}
                        {reminder.message && <div className="text-sm text-gray-600">{reminder.message}</div>}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(reminder)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(reminder.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info about reminders */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium text-blue-800">Sobre os lembretes</h4>
          </div>
          <p className="text-sm text-blue-700">
            Os lembretes são apenas visuais e exibidos quando você estiver usando o aplicativo. Para receber
            notificações em seu dispositivo, configure os alarmes no aplicativo de relógio do seu sistema.
          </p>
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

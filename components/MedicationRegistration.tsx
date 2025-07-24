"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import type { Medication, MedicationDose } from "@/lib/health-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pill, Clock, Calendar, Edit, Trash2, Check } from "lucide-react"

export default function MedicationRegistration() {
  const { user, loading: userLoading } = useUser()
  const [medications, setMedications] = useState<Medication[]>([])
  const [todayDoses, setTodayDoses] = useState<MedicationDose[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "daily" as const,
    times: ["08:00"],
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  })
  const supabase = createClient()

  // Mostrar loading enquanto usuário está carregando
  if (userLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Carregando medicamentos...
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
      fetchMedications()
      fetchTodayDoses()
    }
  }, [user, userLoading])

  const fetchMedications = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO MEDICATION:', user?.id)
      setLoading(false)
      return
    }

    console.log('🔍 BUSCANDO MEDICAMENTOS para:', user.id)

    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error('❌ ERRO MEDICAMENTOS:', error)
        throw error
      }
      
      setMedications(data || [])
      console.log('✅ MEDICAMENTOS CARREGADOS:', data?.length)
    } catch (error) {
      console.error('❌ ERRO GERAL MEDICAMENTOS:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayDoses = async () => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO DOSES:', user?.id)
      return
    }

    console.log('🔍 BUSCANDO DOSES para:', user.id)

    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("medication_doses")
        .select(`
          *,
          medication:medications(name, dosage)
        `)
        .eq("user_id", user.id)
        .eq("dose_date", today)
        .order("scheduled_time")

      if (error) {
        console.error('❌ ERRO DOSES:', error)
        throw error
      }
      
      setTodayDoses(data || [])
      console.log('✅ DOSES CARREGADAS:', data?.length)
    } catch (error) {
      console.error('❌ ERRO GERAL DOSES:', error)
    }
  }

  const generateDosesForMedication = async (medication: Medication) => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id || user.id === 'undefined' || typeof user.id !== 'string') {
      console.error('❌ USERID INVÁLIDO NO GENERATE DOSES:', user?.id)
      return
    }

    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if doses already exist for today
      const { data: existingDoses } = await supabase
        .from("medication_doses")
        .select("id")
        .eq("medication_id", medication.id)
        .eq("dose_date", today)

      if (existingDoses && existingDoses.length > 0) return

      // Generate doses for today
      const doses = medication.times.map((time) => ({
        user_id: user.id,
        medication_id: medication.id,
        scheduled_time: time,
        dose_date: today,
        taken: false,
      }))

      const { error } = await supabase.from("medication_doses").insert(doses)

      if (error) throw error
    } catch (error) {
      console.error("Erro ao gerar doses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Nome do medicamento é obrigatório")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const medicationData = {
        user_id: user.id,
        name: formData.name.trim(),
        dosage: formData.dosage.trim() || null,
        frequency: formData.frequency,
        times: formData.times,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes.trim() || null,
      }

      let savedMedication: Medication

      if (editingMedication) {
        const { data, error } = await supabase
          .from("medications")
          .update(medicationData)
          .eq("id", editingMedication.id)
          .select()
          .single()

        if (error) throw error
        savedMedication = data
      } else {
        const { data, error } = await supabase.from("medications").insert(medicationData).select().single()

        if (error) throw error
        savedMedication = data
      }

      // Generate doses for the medication
      await generateDosesForMedication(savedMedication)

      setFormData({
        name: "",
        dosage: "",
        frequency: "daily",
        times: ["08:00"],
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        notes: "",
      })
      setShowForm(false)
      setEditingMedication(null)
      fetchMedications()
      fetchTodayDoses()
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error)
    }
  }

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication)
    setFormData({
      name: medication.name,
      dosage: medication.dosage || "",
      frequency: medication.frequency,
      times: medication.times,
      start_date: medication.start_date,
      end_date: medication.end_date || "",
      notes: medication.notes || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (medicationId: string) => {
    if (!confirm("Tem certeza que deseja excluir este medicamento?")) return

    try {
      const { error } = await supabase.from("medications").update({ active: false }).eq("id", medicationId)

      if (error) throw error
      fetchMedications()
      fetchTodayDoses()
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error)
    }
  }

  const markDoseTaken = async (doseId: string, taken: boolean) => {
    try {
      const updateData = {
        taken,
        taken_time: taken ? new Date().toISOString() : null,
      }

      const { error } = await supabase.from("medication_doses").update(updateData).eq("id", doseId)

      if (error) throw error
      fetchTodayDoses()
    } catch (error) {
      console.error("Erro ao marcar dose:", error)
    }
  }

  const updateTimes = (frequency: string) => {
    const timeMap = {
      daily: ["08:00"],
      twice_daily: ["08:00", "20:00"],
      three_times_daily: ["08:00", "14:00", "20:00"],
      weekly: ["08:00"],
      as_needed: ["08:00"],
    }
    setFormData({ ...formData, frequency: frequency as any, times: timeMap[frequency as keyof typeof timeMap] })
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: "Diário",
      twice_daily: "2x ao dia",
      three_times_daily: "3x ao dia",
      weekly: "Semanal",
      as_needed: "Conforme necessário",
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const getNextDose = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)

    const upcomingDoses = todayDoses
      .filter((dose) => !dose.taken && dose.scheduled_time > currentTime)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))

    return upcomingDoses[0]
  }

  const takenToday = todayDoses.filter((dose) => dose.taken).length
  const totalToday = todayDoses.length
  const percentageTaken = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0
  const nextDose = getNextDose()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Medicamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Medicamentos</CardTitle>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingMedication(null)
            setFormData({
              name: "",
              dosage: "",
              frequency: "daily",
              times: ["08:00"],
              start_date: new Date().toISOString().split("T")[0],
              end_date: "",
              notes: "",
            })
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Medicamento
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">Total de Medicamentos</span>
            </div>
            <div className="text-2xl font-bold">{medications.length}</div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Tomados Hoje</span>
            </div>
            <div className="text-2xl font-bold">{takenToday}</div>
            <div className="text-sm text-gray-500">{percentageTaken}% dos medicamentos</div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600">Próxima Dose</span>
            </div>
            <div className="text-2xl font-bold">{nextDose ? nextDose.scheduled_time : "N/A"}</div>
            <div className="text-sm text-gray-500">{nextDose ? nextDose.medication?.name : "sem medicamentos"}</div>
          </div>
        </div>

        {/* Today's Doses */}
        {todayDoses.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Doses de Hoje</h3>
            <div className="space-y-2">
              {todayDoses.map((dose) => (
                <div
                  key={dose.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    dose.taken ? "bg-green-50 border-green-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={dose.taken}
                      onCheckedChange={(checked) => markDoseTaken(dose.id, checked as boolean)}
                    />
                    <div>
                      <div className="font-medium">{dose.medication?.name}</div>
                      <div className="text-sm text-gray-600">
                        {dose.scheduled_time} {dose.medication?.dosage && `- ${dose.medication.dosage}`}
                      </div>
                    </div>
                  </div>
                  {dose.taken && (
                    <Badge className="bg-green-500">
                      Tomado{" "}
                      {dose.taken_time &&
                        new Date(dose.taken_time).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications List */}
        <div>
          <h3 className="font-semibold mb-3">Seus Medicamentos</h3>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Você ainda não tem medicamentos cadastrados.</p>
              <p className="text-sm text-gray-400">Adicione seu primeiro medicamento clicando no botão acima.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((medication) => (
                <div key={medication.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{medication.name}</h4>
                        <Badge variant="outline">{getFrequencyLabel(medication.frequency)}</Badge>
                      </div>
                      {medication.dosage && <p className="text-sm text-gray-600 mb-1">Dosagem: {medication.dosage}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {medication.times.join(", ")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Desde {new Date(medication.start_date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      {medication.notes && <p className="text-sm text-gray-600 mt-2">{medication.notes}</p>}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(medication)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(medication.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">{editingMedication ? "Editar Medicamento" : "Novo Medicamento"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Medicamento*</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Paracetamol"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dosagem</label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="Ex: 500mg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Frequência*</label>
                <Select value={formData.frequency} onValueChange={updateTimes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="twice_daily">2x ao dia</SelectItem>
                    <SelectItem value="three_times_daily">3x ao dia</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="as_needed">Conforme necessário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horários</label>
                <div className="flex gap-2">
                  {formData.times.map((time, index) => (
                    <Input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...formData.times]
                        newTimes[index] = e.target.value
                        setFormData({ ...formData, times: newTimes })
                      }}
                      className="w-32"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Início</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Fim (opcional)</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o medicamento"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingMedication ? "Atualizar" : "Adicionar"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingMedication(null)
                  }}
                >
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

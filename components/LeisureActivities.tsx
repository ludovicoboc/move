"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { LeisureActivity, LeisureSession } from "@/lib/leisure-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Edit, Trash2, Heart, Clock, MapPin, Zap } from "lucide-react"

const activityCategories = [
  { id: "esportes", name: "Esportes", icon: "⚽", color: "bg-green-100 text-green-700" },
  { id: "leitura", name: "Leitura", icon: "📚", color: "bg-blue-100 text-blue-700" },
  { id: "musica", name: "Música", icon: "🎵", color: "bg-purple-100 text-purple-700" },
  { id: "jogos", name: "Jogos", icon: "🎮", color: "bg-red-100 text-red-700" },
  { id: "social", name: "Social", icon: "👥", color: "bg-orange-100 text-orange-700" },
  { id: "criativo", name: "Criativo", icon: "🎨", color: "bg-pink-100 text-pink-700" },
  { id: "natureza", name: "Natureza", icon: "🌿", color: "bg-green-100 text-green-700" },
  { id: "relaxamento", name: "Relaxamento", icon: "🧘", color: "bg-indigo-100 text-indigo-700" },
]

const difficultyLevels = [
  { id: "facil", name: "Fácil", color: "bg-green-100 text-green-700" },
  { id: "medio", name: "Médio", color: "bg-yellow-100 text-yellow-700" },
  { id: "dificil", name: "Difícil", color: "bg-red-100 text-red-700" },
]

const energyLevels = [
  { id: "baixa", name: "Baixa", color: "bg-blue-100 text-blue-700" },
  { id: "media", name: "Média", color: "bg-yellow-100 text-yellow-700" },
  { id: "alta", name: "Alta", color: "bg-red-100 text-red-700" },
]

const locations = [
  { id: "casa", name: "Casa" },
  { id: "ar_livre", name: "Ar Livre" },
  { id: "academia", name: "Academia" },
  { id: "qualquer", name: "Qualquer Lugar" },
]

export default function LeisureActivities() {
  const [activities, setActivities] = useState<LeisureActivity[]>([])
  const [sessions, setSessions] = useState<LeisureSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<LeisureActivity | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "relaxamento",
    duration_minutes: 30,
    difficulty_level: "facil" as const,
    location: "casa",
    equipment_needed: [] as string[],
    energy_required: "media" as const,
    mood_boost: 5,
  })
  const [newEquipment, setNewEquipment] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchActivities()
    fetchSessions()
  }, [])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("leisure_activities")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error("Erro ao buscar atividades:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

      const { data, error } = await supabase
        .from("leisure_sessions")
        .select("*")
        .gte("session_date", startOfWeek.toISOString().split("T")[0])
        .lte("session_date", endOfWeek.toISOString().split("T")[0])

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error("Erro ao buscar sessões:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Nome da atividade é obrigatório")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const activityData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        duration_minutes: formData.duration_minutes,
        difficulty_level: formData.difficulty_level,
        location: formData.location,
        equipment_needed: formData.equipment_needed.length > 0 ? formData.equipment_needed : null,
        energy_required: formData.energy_required,
        mood_boost: formData.mood_boost,
      }

      if (editingActivity) {
        const { error } = await supabase.from("leisure_activities").update(activityData).eq("id", editingActivity.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("leisure_activities").insert(activityData)

        if (error) throw error
      }

      setFormData({
        name: "",
        description: "",
        category: "relaxamento",
        duration_minutes: 30,
        difficulty_level: "facil",
        location: "casa",
        equipment_needed: [],
        energy_required: "media",
        mood_boost: 5,
      })
      setShowForm(false)
      setEditingActivity(null)
      fetchActivities()
    } catch (error) {
      console.error("Erro ao salvar atividade:", error)
    }
  }

  const handleEdit = (activity: LeisureActivity) => {
    setEditingActivity(activity)
    setFormData({
      name: activity.name,
      description: activity.description || "",
      category: activity.category,
      duration_minutes: activity.duration_minutes || 30,
      difficulty_level: activity.difficulty_level,
      location: activity.location || "casa",
      equipment_needed: activity.equipment_needed || [],
      energy_required: activity.energy_required,
      mood_boost: activity.mood_boost,
    })
    setShowForm(true)
  }

  const handleDelete = async (activityId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta atividade?")) return

    try {
      const { error } = await supabase.from("leisure_activities").update({ active: false }).eq("id", activityId)

      if (error) throw error
      fetchActivities()
    } catch (error) {
      console.error("Erro ao excluir atividade:", error)
    }
  }

  const toggleFavorite = async (activityId: string, favorite: boolean) => {
    try {
      const { error } = await supabase.from("leisure_activities").update({ favorite: !favorite }).eq("id", activityId)

      if (error) throw error
      fetchActivities()
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error)
    }
  }

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment_needed.includes(newEquipment.trim())) {
      setFormData({
        ...formData,
        equipment_needed: [...formData.equipment_needed, newEquipment.trim()],
      })
      setNewEquipment("")
    }
  }

  const removeEquipment = (equipment: string) => {
    setFormData({
      ...formData,
      equipment_needed: formData.equipment_needed.filter((e) => e !== equipment),
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return activityCategories.find((cat) => cat.id === categoryId) || activityCategories[0]
  }

  const getDifficultyInfo = (level: string) => {
    return difficultyLevels.find((diff) => diff.id === level) || difficultyLevels[0]
  }

  const getEnergyInfo = (level: string) => {
    return energyLevels.find((energy) => energy.id === level) || energyLevels[0]
  }

  const getLocationName = (locationId: string) => {
    return locations.find((loc) => loc.id === locationId)?.name || locationId
  }

  // Calculate stats
  const completedActivities = sessions.length
  const totalLeisureTime = sessions.reduce((total, session) => total + session.duration_minutes, 0)
  const favoriteCategory = activities.length > 0 ? getCategoryInfo(activities[0].category).name : "N/A"

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades de Lazer</CardTitle>
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
        <CardTitle>Atividades de Lazer</CardTitle>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingActivity(null)
            setFormData({
              name: "",
              description: "",
              category: "relaxamento",
              duration_minutes: 30,
              difficulty_level: "facil",
              location: "casa",
              equipment_needed: [],
              energy_required: "media",
              mood_boost: 5,
            })
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Atividades Realizadas</span>
            </div>
            <div className="text-2xl font-bold">{completedActivities}</div>
            <div className="text-sm text-gray-500">Esta semana</div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">Tempo de Lazer</span>
            </div>
            <div className="text-2xl font-bold">{formatTime(totalLeisureTime)}</div>
            <div className="text-sm text-gray-500">Tempo acumulado</div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">Categoria Favorita</span>
            </div>
            <div className="text-2xl font-bold">{favoriteCategory}</div>
            <div className="text-sm text-gray-500">Mais frequente</div>
          </div>
        </div>

        {/* Activities List */}
        <div>
          <h3 className="font-semibold mb-3">Suas Atividades</h3>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 mb-2">Você ainda não tem nenhuma atividade de lazer registrada.</p>
              <p className="text-sm text-gray-400">Adicione uma atividade para começar a acompanhar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((activity) => {
                const category = getCategoryInfo(activity.category)
                const difficulty = getDifficultyInfo(activity.difficulty_level)
                const energy = getEnergyInfo(activity.energy_required)

                return (
                  <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium">{activity.name}</h4>
                          <Badge className={category.color} variant="secondary">
                            {category.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(activity.id, activity.favorite)}
                        >
                          <Heart className={`h-4 w-4 ${activity.favorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(activity.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {activity.description && <p className="text-sm text-gray-600 mb-3">{activity.description}</p>}

                    <div className="flex flex-wrap gap-2 text-xs">
                      {activity.duration_minutes && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.duration_minutes} min
                        </Badge>
                      )}
                      <Badge variant="outline" className={difficulty.color}>
                        {difficulty.name}
                      </Badge>
                      <Badge variant="outline" className={energy.color}>
                        <Zap className="h-3 w-3 mr-1" />
                        {energy.name}
                      </Badge>
                      {activity.location && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {getLocationName(activity.location)}
                        </Badge>
                      )}
                    </div>

                    {activity.equipment_needed && activity.equipment_needed.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Equipamentos:</div>
                        <div className="flex flex-wrap gap-1">
                          {activity.equipment_needed.map((equipment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">{editingActivity ? "Editar Atividade" : "Nova Atividade"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Atividade*</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Leitura de Romance"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoria*</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a atividade..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                  <Input
                    type="number"
                    min="5"
                    max="300"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) || 30 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dificuldade</label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Energia Necessária</label>
                  <Select
                    value={formData.energy_required}
                    onValueChange={(value: any) => setFormData({ ...formData, energy_required: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {energyLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Local</label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Impacto no Humor (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.mood_boost}
                    onChange={(e) => setFormData({ ...formData, mood_boost: Number.parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Equipamentos Necessários</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    placeholder="Ex: Livro, Fones de ouvido"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                  />
                  <Button type="button" onClick={addEquipment}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.equipment_needed.map((equipment, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeEquipment(equipment)}
                    >
                      {equipment} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingActivity ? "Atualizar" : "Adicionar"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingActivity(null)
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

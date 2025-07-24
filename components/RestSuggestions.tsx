"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RestSuggestion } from "@/lib/leisure-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, Play, Clock, Lightbulb, Edit, Trash2 } from "lucide-react"

const suggestionCategories = [
  { id: "respiracao", name: "Respiração", icon: "🫁", color: "bg-blue-100 text-blue-700" },
  { id: "alongamento", name: "Alongamento", icon: "🤸", color: "bg-green-100 text-green-700" },
  { id: "meditacao", name: "Meditação", icon: "🧘", color: "bg-purple-100 text-purple-700" },
  { id: "exercicio_rapido", name: "Exercício Rápido", icon: "💪", color: "bg-red-100 text-red-700" },
  { id: "mental", name: "Descanso Mental", icon: "🧠", color: "bg-indigo-100 text-indigo-700" },
  { id: "visual", name: "Descanso Visual", icon: "👁️", color: "bg-teal-100 text-teal-700" },
]

export default function RestSuggestions() {
  const [suggestions, setSuggestions] = useState<RestSuggestion[]>([])
  const [currentSuggestion, setCurrentSuggestion] = useState<RestSuggestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSuggestion, setEditingSuggestion] = useState<RestSuggestion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "respiracao",
    duration_minutes: 5,
    instructions: [] as string[],
    benefits: [] as string[],
    difficulty_level: "facil" as const,
  })
  const [newInstruction, setNewInstruction] = useState("")
  const [newBenefit, setNewBenefit] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("rest_suggestions")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSuggestions(data || [])

      // Set random suggestion as current
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length)
        setCurrentSuggestion(data[randomIndex])
      }
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRandomSuggestion = () => {
    if (suggestions.length === 0) return

    const availableSuggestions = suggestions.filter((s) => s.id !== currentSuggestion?.id)
    if (availableSuggestions.length === 0) {
      // If only one suggestion, keep it
      return
    }

    const randomIndex = Math.floor(Math.random() * availableSuggestions.length)
    setCurrentSuggestion(availableSuggestions[randomIndex])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert("Título da sugestão é obrigatório")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const suggestionData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        duration_minutes: formData.duration_minutes,
        instructions: formData.instructions.length > 0 ? formData.instructions : null,
        benefits: formData.benefits.length > 0 ? formData.benefits : null,
        difficulty_level: formData.difficulty_level,
        is_custom: true,
      }

      if (editingSuggestion) {
        const { error } = await supabase.from("rest_suggestions").update(suggestionData).eq("id", editingSuggestion.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("rest_suggestions").insert(suggestionData)

        if (error) throw error
      }

      setFormData({
        title: "",
        description: "",
        category: "respiracao",
        duration_minutes: 5,
        instructions: [],
        benefits: [],
        difficulty_level: "facil",
      })
      setShowForm(false)
      setEditingSuggestion(null)
      fetchSuggestions()
    } catch (error) {
      console.error("Erro ao salvar sugestão:", error)
    }
  }

  const handleEdit = (suggestion: RestSuggestion) => {
    setEditingSuggestion(suggestion)
    setFormData({
      title: suggestion.title,
      description: suggestion.description || "",
      category: suggestion.category,
      duration_minutes: suggestion.duration_minutes,
      instructions: suggestion.instructions || [],
      benefits: suggestion.benefits || [],
      difficulty_level: suggestion.difficulty_level,
    })
    setShowForm(true)
  }

  const handleDelete = async (suggestionId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sugestão?")) return

    try {
      const { error } = await supabase.from("rest_suggestions").update({ active: false }).eq("id", suggestionId)

      if (error) throw error
      fetchSuggestions()
    } catch (error) {
      console.error("Erro ao excluir sugestão:", error)
    }
  }

  const addInstruction = () => {
    if (newInstruction.trim() && !formData.instructions.includes(newInstruction.trim())) {
      setFormData({
        ...formData,
        instructions: [...formData.instructions, newInstruction.trim()],
      })
      setNewInstruction("")
    }
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, newBenefit.trim()],
      })
      setNewBenefit("")
    }
  }

  const removeInstruction = (instruction: string) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((i) => i !== instruction),
    })
  }

  const removeBenefit = (benefit: string) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((b) => b !== benefit),
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return suggestionCategories.find((cat) => cat.id === categoryId) || suggestionCategories[0]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sugestões de Descanso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sugestões de Descanso</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={getRandomSuggestion}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Nova Sugestão
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowForm(true)
              setEditingSuggestion(null)
              setFormData({
                title: "",
                description: "",
                category: "respiracao",
                duration_minutes: 5,
                instructions: [],
                benefits: [],
                difficulty_level: "facil",
              })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Suggestion */}
        {currentSuggestion && (
          <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryInfo(currentSuggestion.category).icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900">{currentSuggestion.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getCategoryInfo(currentSuggestion.category).color} variant="secondary">
                      {getCategoryInfo(currentSuggestion.category).name}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {currentSuggestion.duration_minutes} min
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Começar
              </Button>
            </div>

            {currentSuggestion.description && <p className="text-blue-800 mb-4">{currentSuggestion.description}</p>}

            {currentSuggestion.instructions && currentSuggestion.instructions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Como fazer:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  {currentSuggestion.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {currentSuggestion.benefits && currentSuggestion.benefits.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Benefícios:</h4>
                <div className="flex flex-wrap gap-1">
                  {currentSuggestion.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-white">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Suggestions */}
        <div>
          <h3 className="font-semibold mb-3">Todas as Sugestões</h3>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma sugestão de descanso encontrada</p>
              <p className="text-sm text-gray-400">Adicione sua primeira sugestão para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => {
                const category = getCategoryInfo(suggestion.category)

                return (
                  <div key={suggestion.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={category.color} variant="secondary" className="text-xs">
                              {category.name}
                            </Badge>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {suggestion.duration_minutes} min
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {suggestion.is_custom && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(suggestion)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(suggestion.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {suggestion.description && <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>}

                    {suggestion.benefits && suggestion.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {suggestion.benefits.slice(0, 3).map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                        {suggestion.benefits.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{suggestion.benefits.length - 3}
                          </Badge>
                        )}
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
            <h3 className="font-semibold mb-4">{editingSuggestion ? "Editar Sugestão" : "Nova Sugestão"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título da Sugestão*</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Respiração Relaxante"
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
                      {suggestionCategories.map((category) => (
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
                  placeholder="Descreva brevemente a sugestão..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) || 5 })
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
                      <SelectItem value="facil">Fácil</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="dificil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instruções</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newInstruction}
                    onChange={(e) => setNewInstruction(e.target.value)}
                    placeholder="Ex: Inspire profundamente por 4 segundos"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInstruction())}
                  />
                  <Button type="button" onClick={addInstruction}>
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                      <span className="text-sm">
                        {index + 1}. {instruction}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInstruction(instruction)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Benefícios</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Ex: Reduz ansiedade"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" onClick={addBenefit}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.benefits.map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeBenefit(benefit)}
                    >
                      {benefit} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingSuggestion ? "Atualizar" : "Adicionar"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSuggestion(null)
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

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { StudyMaterial } from "@/lib/study-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Brain, CheckSquare, Target, Calendar, Map, Lightbulb, Plus } from "lucide-react"

const materialCategories = [
  { id: "resumos", name: "Resumos", icon: FileText, color: "bg-blue-100 text-blue-700" },
  { id: "flashcards", name: "Flashcards", icon: Brain, color: "bg-purple-100 text-purple-700" },
  { id: "estrategias", name: "Estratégias de Foco", icon: Target, color: "bg-green-100 text-green-700" },
  { id: "checklists", name: "Checklists", icon: CheckSquare, color: "bg-orange-100 text-orange-700" },
  { id: "simulados", name: "Simulados", icon: BookOpen, color: "bg-red-100 text-red-700" },
  { id: "mapas", name: "Mapas Mentais", icon: Map, color: "bg-teal-100 text-teal-700" },
  { id: "tarefas", name: "Tarefas", icon: Calendar, color: "bg-yellow-100 text-yellow-700" },
  { id: "outlines", name: "Outlines de Informativos", icon: Lightbulb, color: "bg-indigo-100 text-indigo-700" },
]

interface StudyMaterialsProps {
  simplified?: boolean
}

export default function StudyMaterials({ simplified = false }: StudyMaterialsProps) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error("Erro ao buscar materiais:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMaterialsByCategory = (categoryId: string) => {
    return materials.filter((material) => material.category === categoryId)
  }

  const displayCategories = simplified ? materialCategories.slice(0, 4) : materialCategories

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Materiais de Estudo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Materiais de Estudo</CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Material
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayCategories.map((category) => {
            const Icon = category.icon
            const categoryMaterials = getMaterialsByCategory(category.id)

            return (
              <Button
                key={category.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow bg-transparent"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className={`p-3 rounded-full ${category.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{category.name}</div>
                  {categoryMaterials.length > 0 && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {categoryMaterials.length}
                    </Badge>
                  )}
                </div>
              </Button>
            )
          })}
        </div>

        {simplified && materialCategories.length > 4 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              Ver Todas as Categorias ({materialCategories.length - 4} mais)
            </Button>
          </div>
        )}

        {selectedCategory && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{materialCategories.find((cat) => cat.id === selectedCategory)?.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                ×
              </Button>
            </div>

            {getMaterialsByCategory(selectedCategory).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum material nesta categoria ainda</p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Material
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {getMaterialsByCategory(selectedCategory).map((material) => (
                  <div key={material.id} className="p-3 bg-white border rounded">
                    <div className="font-medium">{material.title}</div>
                    {material.description && <div className="text-sm text-gray-600 mt-1">{material.description}</div>}
                    {material.tags && material.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {material.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

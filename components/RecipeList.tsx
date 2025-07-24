"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Recipe } from "@/lib/recipe-types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Zap, Eye, Edit, Trash2 } from "lucide-react"
import Image from "next/image"

interface RecipeListProps {
  searchTerm: string
  selectedCategory: string
  onRecipeSelect: (recipe: Recipe) => void
  onRecipeEdit: (recipe: Recipe) => void
  refreshTrigger: number
}

export default function RecipeList({
  searchTerm,
  selectedCategory,
  onRecipeSelect,
  onRecipeEdit,
  refreshTrigger,
}: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRecipes()
  }, [searchTerm, selectedCategory, refreshTrigger])

  const fetchRecipes = async () => {
    try {
      let query = supabase
        .from("recipes")
        .select(`
          *,
          category:recipe_categories(id, name),
          ingredients:recipe_ingredients(id, ingredient, quantity, unit),
          instructions:recipe_instructions(id, step_number, instruction)
        `)
        .order("created_at", { ascending: false })

      // Apply category filter
      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      let filteredRecipes = data || []

      // Apply search filter
      if (searchTerm) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          const nameMatch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
          const ingredientMatch = recipe.ingredients?.some((ing: any) =>
            ing.ingredient.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          const tagMatch = recipe.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          return nameMatch || ingredientMatch || tagMatch
        })
      }

      setRecipes(filteredRecipes)
    } catch (error) {
      console.error("Erro ao buscar receitas:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return

    try {
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId)

      if (error) throw error
      fetchRecipes()
    } catch (error) {
      console.error("Erro ao excluir receita:", error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍳</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma receita encontrada</h3>
        <p className="text-gray-500 mb-6">
          {searchTerm || selectedCategory !== "all"
            ? "Tente ajustar seus filtros de busca"
            : "Comece adicionando sua primeira receita"}
        </p>
        <div className="text-center text-sm text-gray-400 italic">
          <p>"Whāia te iti kahurangi, ki te tuohu koe, me he maunga teitei" - Provérbio da língua Māori</p>
          <p>
            Tradução: "Busque o tesouro que você mais valoriza, se você inclinar a cabeça, que seja para uma montanha
            elevada."
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-gray-100">
            {recipe.image_url ? (
              <Image src={recipe.image_url || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-sm">Sem imagem</p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{recipe.name}</h3>
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="sm" onClick={() => onRecipeSelect(recipe)} className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onRecipeEdit(recipe)} className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRecipe(recipe.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {recipe.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>}

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              {recipe.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prep_time} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} porções</span>
                </div>
              )}
              {recipe.calories && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>{recipe.calories} kcal</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {recipe.category && (
                <Badge variant="secondary" className="text-xs">
                  {recipe.category.name}
                </Badge>
              )}
              {recipe.tags?.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.tags && recipe.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.tags.length - 2}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

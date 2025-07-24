"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Recipe, RecipeCategory } from "@/lib/recipe-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface RecipeFormProps {
  recipe?: Recipe
  onSave: () => void
  onCancel: () => void
}

export default function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const [categories, setCategories] = useState<RecipeCategory[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prep_time: "",
    servings: "",
    calories: "",
    image_url: "",
    tags: "",
    category_id: "",
  })
  const [ingredients, setIngredients] = useState<Array<{ quantity: string; unit: string; ingredient: string }>>([
    { quantity: "", unit: "", ingredient: "" },
  ])
  const [instructions, setInstructions] = useState<string[]>([""])
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
    if (recipe) {
      populateForm()
    }
  }, [recipe])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("recipe_categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    }
  }

  const populateForm = async () => {
    if (!recipe) return

    setFormData({
      name: recipe.name,
      description: recipe.description || "",
      prep_time: recipe.prep_time?.toString() || "",
      servings: recipe.servings?.toString() || "",
      calories: recipe.calories?.toString() || "",
      image_url: recipe.image_url || "",
      tags: recipe.tags?.join(", ") || "",
      category_id: recipe.category_id || "",
    })

    // Fetch ingredients
    const { data: ingredientsData } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", recipe.id)
      .order("order_index")

    if (ingredientsData && ingredientsData.length > 0) {
      setIngredients(
        ingredientsData.map((ing) => ({
          quantity: ing.quantity?.toString() || "",
          unit: ing.unit || "",
          ingredient: ing.ingredient,
        })),
      )
    }

    // Fetch instructions
    const { data: instructionsData } = await supabase
      .from("recipe_instructions")
      .select("*")
      .eq("recipe_id", recipe.id)
      .order("step_number")

    if (instructionsData && instructionsData.length > 0) {
      setInstructions(instructionsData.map((inst) => inst.instruction))
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: "", unit: "", ingredient: "" }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Nome da receita é obrigatório")
      return
    }

    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const recipeData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        prep_time: formData.prep_time ? Number.parseInt(formData.prep_time) : null,
        servings: formData.servings ? Number.parseInt(formData.servings) : null,
        calories: formData.calories ? Number.parseInt(formData.calories) : null,
        image_url: formData.image_url.trim() || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        category_id: formData.category_id || null,
      }

      let recipeId: string

      if (recipe) {
        // Update existing recipe
        const { error } = await supabase.from("recipes").update(recipeData).eq("id", recipe.id)

        if (error) throw error
        recipeId = recipe.id

        // Delete existing ingredients and instructions
        await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipe.id)
        await supabase.from("recipe_instructions").delete().eq("recipe_id", recipe.id)
      } else {
        // Create new recipe
        const { data, error } = await supabase.from("recipes").insert(recipeData).select().single()

        if (error) throw error
        recipeId = data.id
      }

      // Insert ingredients
      const validIngredients = ingredients.filter((ing) => ing.ingredient.trim())
      if (validIngredients.length > 0) {
        const ingredientsData = validIngredients.map((ing, index) => ({
          recipe_id: recipeId,
          quantity: ing.quantity ? Number.parseFloat(ing.quantity) : null,
          unit: ing.unit.trim() || null,
          ingredient: ing.ingredient.trim(),
          order_index: index,
        }))

        const { error } = await supabase.from("recipe_ingredients").insert(ingredientsData)
        if (error) throw error
      }

      // Insert instructions
      const validInstructions = instructions.filter((inst) => inst.trim())
      if (validInstructions.length > 0) {
        const instructionsData = validInstructions.map((inst, index) => ({
          recipe_id: recipeId,
          step_number: index + 1,
          instruction: inst.trim(),
        }))

        const { error } = await supabase.from("recipe_instructions").insert(instructionsData)
        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      console.error("Erro ao salvar receita:", error)
      alert(`Erro ao salvar receita: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Receita*</label>
              <Input
                placeholder="Ex: Bolo de Cenoura Fofinho"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categorias</label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Segure Ctrl+Cmd para selecionar múltiplas.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição Breve</label>
            <Textarea
              placeholder="Uma breve descrição sobre a receita, dicas, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tempo de Preparo (min)*</label>
              <Input
                type="number"
                placeholder="30"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Porções*</label>
              <Input
                type="number"
                placeholder="2"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Calorias (por porção)</label>
              <Input
                type="number"
                placeholder="Ex: 350 ou N/A"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <Input
              placeholder="Adicione tags (ex: Vegana, Rápido)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipe Image */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem da Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium mb-1">Carregar Imagem</label>
            <Input
              placeholder="URL da imagem ou deixe em branco"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Nenhum arquivo selecionado.</p>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ingredientes*</CardTitle>
          <Button onClick={addIngredient} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ingrediente
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-3 items-center">
              <Input
                type="number"
                placeholder="1"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                className="w-20"
              />
              <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(index, "unit", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="gramas (g)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">gramas (g)</SelectItem>
                  <SelectItem value="kg">quilos (kg)</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="l">litros (l)</SelectItem>
                  <SelectItem value="xícara">xícara</SelectItem>
                  <SelectItem value="colher (sopa)">colher (sopa)</SelectItem>
                  <SelectItem value="colher (chá)">colher (chá)</SelectItem>
                  <SelectItem value="unidade">unidade</SelectItem>
                  <SelectItem value="dente">dente</SelectItem>
                  <SelectItem value="pitada">pitada</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Nome do ingrediente"
                value={ingredient.ingredient}
                onChange={(e) => updateIngredient(index, "ingredient", e.target.value)}
                className="flex-1"
              />
              {ingredients.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modo de Preparo*</CardTitle>
          <Button onClick={addInstruction} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Passo
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                {index + 1}
              </div>
              <Textarea
                placeholder={`Descreva o passo ${index + 1}`}
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                className="flex-1"
                rows={2}
              />
              {instructions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstruction(index)}
                  className="text-red-500 hover:text-red-700 mt-1"
                >
                  Remover
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : recipe ? "Atualizar Receita" : "Salvar Receita"}
        </Button>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface RecipeImporterProps {
  onImportComplete: () => void
}

export default function RecipeImporter({ onImportComplete }: RecipeImporterProps) {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const supabase = createClient()

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const recipes = JSON.parse(text)

      if (!Array.isArray(recipes)) {
        throw new Error("O arquivo deve conter um array de receitas")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      let successCount = 0
      const errors: string[] = []

      for (const recipe of recipes) {
        try {
          // Validate required fields
          if (!recipe.name) {
            errors.push(`Receita sem nome ignorada`)
            continue
          }

          // Insert recipe
          const { data: recipeData, error: recipeError } = await supabase
            .from("recipes")
            .insert({
              user_id: user.id,
              name: recipe.name,
              description: recipe.description,
              prep_time: recipe.prep_time,
              servings: recipe.servings,
              calories: recipe.calories,
              image_url: recipe.image_url,
              tags: recipe.tags,
              category_id: recipe.category_id,
            })
            .select()
            .single()

          if (recipeError) throw recipeError

          // Insert ingredients
          if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            const ingredients = recipe.ingredients.map((ing: any, index: number) => ({
              recipe_id: recipeData.id,
              quantity: ing.quantity,
              unit: ing.unit,
              ingredient: ing.ingredient,
              order_index: index,
            }))

            const { error: ingredientsError } = await supabase.from("recipe_ingredients").insert(ingredients)

            if (ingredientsError) throw ingredientsError
          }

          // Insert instructions
          if (recipe.instructions && Array.isArray(recipe.instructions)) {
            const instructions = recipe.instructions.map((inst: any, index: number) => ({
              recipe_id: recipeData.id,
              step_number: index + 1,
              instruction: typeof inst === "string" ? inst : inst.instruction,
            }))

            const { error: instructionsError } = await supabase.from("recipe_instructions").insert(instructions)

            if (instructionsError) throw instructionsError
          }

          successCount++
        } catch (error: any) {
          errors.push(`Erro ao importar "${recipe.name}": ${error.message}`)
        }
      }

      setImportResult({ success: successCount, errors })
      onImportComplete()
    } catch (error: any) {
      setImportResult({ success: 0, errors: [error.message] })
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Receitas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecione um arquivo ".json" contendo uma única receita ou um array de receitas para importar.
        </p>

        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            disabled={importing}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <Button variant="outline" disabled={importing}>
            <FileText className="h-4 w-4 mr-2" />
            {importing ? "Importando..." : "Selecionar Arquivo JSON"}
          </Button>
        </div>

        {importResult && (
          <div className="space-y-2">
            {importResult.success > 0 && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{importResult.success} receita(s) importada(s) com sucesso!</span>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Erros durante a importação:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="ml-4">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Formato esperado do JSON:</p>
          <pre className="text-xs overflow-x-auto">
            {`[
  {
    "name": "Nome da Receita",
    "description": "Descrição breve",
    "prep_time": 30,
    "servings": 4,
    "calories": 350,
    "tags": ["tag1", "tag2"],
    "ingredients": [
      {
        "quantity": 2,
        "unit": "xícaras",
        "ingredient": "farinha"
      }
    ],
    "instructions": [
      "Passo 1 da receita",
      "Passo 2 da receita"
    ]
  }
]`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Recipe } from "@/lib/recipe-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import RecipeList from "./RecipeList"
import CategoryFilter from "./CategoryFilter"
import RecipeImporter from "./RecipeImporter"
import RecipeForm from "./RecipeForm"
import AppLayout from "./AppLayout"
import { Search, Plus, ShoppingCart, ArrowLeft } from "lucide-react"

interface RecipesDashboardProps {
  user: User
}

export default function RecipesDashboard({ user }: RecipesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }

  const handleRecipeEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowForm(true)
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingRecipe(undefined)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingRecipe(undefined)
  }

  const handleImportComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (showForm) {
    const formActions = (
      <Button variant="ghost" size="sm" onClick={handleFormCancel}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
    )

    return (
      <AppLayout user={user} title={editingRecipe ? "Editar Receita" : "Nova Receita"} actions={formActions}>
        <RecipeForm recipe={editingRecipe} onSave={handleFormSave} onCancel={handleFormCancel} />
      </AppLayout>
    )
  }

  const headerActions = (
    <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
      <Plus className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">Adicionar Nova Receita</span>
      <span className="sm:hidden">Nova</span>
    </Button>
  )

  return (
    <AppLayout user={user} title="Minhas Receitas" actions={headerActions}>
      {/* Import Section */}
      <div className="mb-8">
        <RecipeImporter onImportComplete={handleImportComplete} />
      </div>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou ingrediente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Lista de Compras</span>
              <span className="sm:hidden">Lista</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipe List */}
      <RecipeList
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onRecipeSelect={handleRecipeSelect}
        onRecipeEdit={handleRecipeEdit}
        refreshTrigger={refreshTrigger}
      />
    </AppLayout>
  )
}

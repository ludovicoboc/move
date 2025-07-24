"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RecipeCategory } from "@/lib/recipe-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<RecipeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("recipe_categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Todas as Categorias" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as Categorias</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

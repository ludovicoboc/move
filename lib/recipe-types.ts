export interface Recipe {
  id: string
  user_id: string
  name: string
  description?: string
  prep_time?: number
  servings?: number
  calories?: number
  image_url?: string
  tags?: string[]
  category_id?: string
  created_at: string
  updated_at: string
  category?: RecipeCategory
  ingredients?: RecipeIngredient[]
  instructions?: RecipeInstruction[]
}

export interface RecipeCategory {
  id: string
  name: string
  created_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  quantity?: number
  unit?: string
  ingredient: string
  order_index: number
  created_at: string
}

export interface RecipeInstruction {
  id: string
  recipe_id: string
  step_number: number
  instruction: string
  created_at: string
}

export interface ShoppingList {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  items?: ShoppingListItem[]
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient: string
  quantity?: number
  unit?: string
  checked: boolean
  created_at: string
}

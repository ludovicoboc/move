-- Create tables for recipe management

-- Table for recipe categories
CREATE TABLE IF NOT EXISTS recipe_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default categories
INSERT INTO recipe_categories (name) VALUES 
  ('Café da Manhã'),
  ('Almoço'),
  ('Jantar'),
  ('Lanche'),
  ('Sobremesa'),
  ('Bebidas')
ON CONFLICT (name) DO NOTHING;

-- Table for recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prep_time INTEGER, -- in minutes
  servings INTEGER,
  calories INTEGER,
  image_url TEXT,
  tags TEXT[],
  category_id UUID REFERENCES recipe_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2),
  unit TEXT,
  ingredient TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for recipe instructions
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for shopping list items
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for recipes
CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for recipe_ingredients
CREATE POLICY "Users can view recipe ingredients" ON recipe_ingredients FOR SELECT USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid())
);
CREATE POLICY "Users can insert recipe ingredients" ON recipe_ingredients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid())
);
CREATE POLICY "Users can update recipe ingredients" ON recipe_ingredients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid())
);
CREATE POLICY "Users can delete recipe ingredients" ON recipe_ingredients FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid())
);

-- Create policies for recipe_instructions
CREATE POLICY "Users can view recipe instructions" ON recipe_instructions FOR SELECT USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_instructions.recipe_id AND recipes.user_id = auth.uid())
);
CREATE POLICY "Users can insert recipe instructions" ON recipe_instructions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_instructions.recipe_id AND recipes.user_id = auth.uid())
);
CREATE POLICY "Users can update recipe instructions" ON recipe_instructions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_instructions.recipe_id AND recipes.user_id = auth.uid())
);
CREATE POLICY "Users can delete recipe instructions" ON recipe_instructions FOR DELETE USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_instructions.recipe_id AND recipes.user_id = auth.uid())
);

-- Create policies for shopping lists
CREATE POLICY "Users can view own shopping lists" ON shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shopping lists" ON shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shopping lists" ON shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shopping lists" ON shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- Create policies for shopping list items
CREATE POLICY "Users can view shopping list items" ON shopping_list_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);
CREATE POLICY "Users can insert shopping list items" ON shopping_list_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);
CREATE POLICY "Users can update shopping list items" ON shopping_list_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);
CREATE POLICY "Users can delete shopping list items" ON shopping_list_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM shopping_lists WHERE shopping_lists.id = shopping_list_items.shopping_list_id AND shopping_lists.user_id = auth.uid())
);

-- Allow everyone to read recipe categories
CREATE POLICY "Anyone can view recipe categories" ON recipe_categories FOR SELECT TO public USING (true);

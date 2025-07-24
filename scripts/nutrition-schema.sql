-- Create tables for nutrition management

-- Table for meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TIME NOT NULL,
  refeicao TEXT NOT NULL,
  descricao TEXT,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for meal logs
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TIME NOT NULL,
  refeicao TEXT NOT NULL,
  descricao TEXT,
  calorias INTEGER,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for hydration tracking
CREATE TABLE IF NOT EXISTS hydration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  copos_consumidos INTEGER DEFAULT 0,
  meta_copos INTEGER DEFAULT 8,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, data)
);

-- Enable Row Level Security (RLS)
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for meal_plans
CREATE POLICY "Users can view own meal_plans" ON meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal_plans" ON meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal_plans" ON meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal_plans" ON meal_plans FOR DELETE USING (auth.uid() = user_id);

-- Create policies for meal_logs
CREATE POLICY "Users can view own meal_logs" ON meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal_logs" ON meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal_logs" ON meal_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal_logs" ON meal_logs FOR DELETE USING (auth.uid() = user_id);

-- Create policies for hydration_logs
CREATE POLICY "Users can view own hydration_logs" ON hydration_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hydration_logs" ON hydration_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hydration_logs" ON hydration_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hydration_logs" ON hydration_logs FOR DELETE USING (auth.uid() = user_id);

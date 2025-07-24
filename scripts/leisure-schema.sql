-- Create tables for leisure management system

-- Table for leisure activities
CREATE TABLE IF NOT EXISTS leisure_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'esportes', 'leitura', 'musica', 'jogos', 'social', 'criativo', 'natureza', 'relaxamento'
  duration_minutes INTEGER,
  difficulty_level TEXT DEFAULT 'facil', -- 'facil', 'medio', 'dificil'
  location TEXT, -- 'casa', 'ar_livre', 'academia', 'qualquer'
  equipment_needed TEXT[],
  energy_required TEXT DEFAULT 'baixa', -- 'baixa', 'media', 'alta'
  mood_boost INTEGER DEFAULT 5 CHECK (mood_boost >= 1 AND mood_boost <= 10),
  favorite BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for leisure sessions (when activities are performed)
CREATE TABLE IF NOT EXISTS leisure_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES leisure_activities(id) ON DELETE SET NULL,
  activity_name TEXT NOT NULL, -- Store name in case activity is deleted
  duration_minutes INTEGER NOT NULL,
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 10),
  notes TEXT,
  session_date DATE DEFAULT CURRENT_DATE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for rest suggestions
CREATE TABLE IF NOT EXISTS rest_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'respiracao', 'alongamento', 'meditacao', 'exercicio_rapido', 'mental', 'visual'
  duration_minutes INTEGER DEFAULT 5,
  instructions TEXT[],
  benefits TEXT[],
  difficulty_level TEXT DEFAULT 'facil',
  is_custom BOOLEAN DEFAULT TRUE, -- User-created vs system suggestions
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for leisure preferences
CREATE TABLE IF NOT EXISTS leisure_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  default_timer_duration INTEGER DEFAULT 30,
  favorite_categories TEXT[],
  preferred_time_slots TEXT[], -- 'manha', 'tarde', 'noite'
  energy_level_preference TEXT DEFAULT 'media',
  notification_enabled BOOLEAN DEFAULT TRUE,
  weekly_leisure_goal INTEGER DEFAULT 300, -- minutes per week
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE leisure_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE leisure_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rest_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leisure_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for leisure_activities
CREATE POLICY "Users can view own leisure_activities" ON leisure_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leisure_activities" ON leisure_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leisure_activities" ON leisure_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leisure_activities" ON leisure_activities FOR DELETE USING (auth.uid() = user_id);

-- Create policies for leisure_sessions
CREATE POLICY "Users can view own leisure_sessions" ON leisure_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leisure_sessions" ON leisure_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leisure_sessions" ON leisure_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leisure_sessions" ON leisure_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create policies for rest_suggestions
CREATE POLICY "Users can view own rest_suggestions" ON rest_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rest_suggestions" ON rest_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rest_suggestions" ON rest_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rest_suggestions" ON rest_suggestions FOR DELETE USING (auth.uid() = user_id);

-- Create policies for leisure_preferences
CREATE POLICY "Users can view own leisure_preferences" ON leisure_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leisure_preferences" ON leisure_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leisure_preferences" ON leisure_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leisure_preferences" ON leisure_preferences FOR DELETE USING (auth.uid() = user_id);

-- Insert default rest suggestions
INSERT INTO rest_suggestions (user_id, title, description, category, duration_minutes, instructions, benefits, is_custom) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Respiração 4-7-8', 'Técnica de respiração para relaxamento', 'respiracao', 5, 
   ARRAY['Inspire por 4 segundos', 'Segure por 7 segundos', 'Expire por 8 segundos', 'Repita 4 vezes'], 
   ARRAY['Reduz ansiedade', 'Melhora o sono', 'Diminui o estresse'], FALSE),
  ('00000000-0000-0000-0000-000000000000', 'Alongamento de Pescoço', 'Alongamentos simples para aliviar tensão', 'alongamento', 3,
   ARRAY['Incline a cabeça para direita', 'Segure por 15 segundos', 'Repita para esquerda', 'Faça rotações suaves'],
   ARRAY['Alivia tensão muscular', 'Melhora postura', 'Reduz dor de cabeça'], FALSE),
  ('00000000-0000-0000-0000-000000000000', 'Meditação Rápida', 'Meditação focada na respiração', 'meditacao', 10,
   ARRAY['Sente-se confortavelmente', 'Feche os olhos', 'Foque na respiração', 'Observe pensamentos sem julgamento'],
   ARRAY['Aumenta foco', 'Reduz estresse', 'Melhora bem-estar'], FALSE),
  ('00000000-0000-0000-0000-000000000000', 'Agachamentos Rápidos', 'Exercício rápido para ativar o corpo', 'exercicio_rapido', 2,
   ARRAY['Fique em pé com pés afastados', 'Desça como se fosse sentar', 'Mantenha costas retas', 'Faça 10 repetições'],
   ARRAY['Ativa circulação', 'Fortalece pernas', 'Aumenta energia'], FALSE);

-- Create indexes for better performance
CREATE INDEX idx_leisure_sessions_date ON leisure_sessions(session_date);
CREATE INDEX idx_leisure_activities_category ON leisure_activities(category);
CREATE INDEX idx_leisure_activities_favorite ON leisure_activities(favorite) WHERE favorite = true;
CREATE INDEX idx_rest_suggestions_category ON rest_suggestions(category);

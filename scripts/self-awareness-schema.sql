-- Self-awareness management schema
CREATE TABLE IF NOT EXISTS self_awareness_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#f97316',
  icon VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS self_awareness_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES self_awareness_categories(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refuge_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_description TEXT,
  coping_strategies TEXT[],
  duration_minutes INTEGER,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reflection_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_system_prompt BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reflection_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES reflection_prompts(id) ON DELETE SET NULL,
  entry_text TEXT NOT NULL,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS self_analysis_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_type VARCHAR(50) NOT NULL, -- 'mood', 'energy', 'stress', 'focus', etc.
  recorded_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO self_awareness_categories (user_id, name, description, color, icon) 
SELECT 
  auth.uid(),
  'Quem sou',
  'Registre suas preferências, aprendizados e características pessoais estáveis',
  '#f97316',
  'user'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO self_awareness_categories (user_id, name, description, color, icon) 
SELECT 
  auth.uid(),
  'Meus porquês',
  'Documente motivações e valores fundamentais que guiam suas decisões',
  '#f97316',
  'heart'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO self_awareness_categories (user_id, name, description, color, icon) 
SELECT 
  auth.uid(),
  'Meus padrões',
  'Anote reações emocionais típicas e estratégias eficazes em momentos de crise',
  '#f97316',
  'trending-up'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert default reflection prompts
INSERT INTO reflection_prompts (user_id, prompt_text, category, is_system_prompt) 
SELECT 
  auth.uid(),
  'O que aprendi sobre mim hoje?',
  'daily',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO reflection_prompts (user_id, prompt_text, category, is_system_prompt) 
SELECT 
  auth.uid(),
  'Quais foram meus maiores desafios esta semana?',
  'weekly',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO reflection_prompts (user_id, prompt_text, category, is_system_prompt) 
SELECT 
  auth.uid(),
  'Como posso melhorar meu bem-estar emocional?',
  'wellbeing',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE self_awareness_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_awareness_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE refuge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_analysis_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own categories" ON self_awareness_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes" ON self_awareness_notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own refuge sessions" ON refuge_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own prompts" ON reflection_prompts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own entries" ON reflection_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own metrics" ON self_analysis_metrics
  FOR ALL USING (auth.uid() = user_id);

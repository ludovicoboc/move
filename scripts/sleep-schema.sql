-- Create tables for sleep management system

-- Table for sleep records
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  sleep_duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN wake_time >= bedtime THEN 
        EXTRACT(EPOCH FROM (wake_time - bedtime)) / 60
      ELSE 
        EXTRACT(EPOCH FROM (wake_time + INTERVAL '24 hours' - bedtime)) / 60
    END
  ) STORED,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  notes TEXT,
  sleep_latency_minutes INTEGER, -- Time to fall asleep
  wake_up_count INTEGER DEFAULT 0, -- Number of times woken up
  sleep_environment_rating INTEGER CHECK (sleep_environment_rating >= 1 AND sleep_environment_rating <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  caffeine_intake BOOLEAN DEFAULT FALSE,
  exercise_before_sleep BOOLEAN DEFAULT FALSE,
  screen_time_before_sleep INTEGER DEFAULT 0, -- Minutes of screen time before bed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for sleep reminders
CREATE TABLE IF NOT EXISTS sleep_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('bedtime', 'wake_time')),
  time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- Array of days (0=Sunday, 1=Monday, etc.)
  active BOOLEAN DEFAULT TRUE,
  title TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for sleep goals
CREATE TABLE IF NOT EXISTS sleep_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_bedtime TIME NOT NULL,
  target_wake_time TIME NOT NULL,
  target_duration_hours DECIMAL(3,1) NOT NULL,
  target_quality_rating INTEGER CHECK (target_quality_rating >= 1 AND target_quality_rating <= 5),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for sleep hygiene tips
CREATE TABLE IF NOT EXISTS sleep_hygiene_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'environment', 'routine', 'lifestyle', 'diet'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for sleep_records
CREATE POLICY "Users can view own sleep_records" ON sleep_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_records" ON sleep_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_records" ON sleep_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_records" ON sleep_records FOR DELETE USING (auth.uid() = user_id);

-- Create policies for sleep_reminders
CREATE POLICY "Users can view own sleep_reminders" ON sleep_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_reminders" ON sleep_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_reminders" ON sleep_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_reminders" ON sleep_reminders FOR DELETE USING (auth.uid() = user_id);

-- Create policies for sleep_goals
CREATE POLICY "Users can view own sleep_goals" ON sleep_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_goals" ON sleep_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_goals" ON sleep_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_goals" ON sleep_goals FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_sleep_records_date ON sleep_records(sleep_date);
CREATE INDEX idx_sleep_records_user_date ON sleep_records(user_id, sleep_date);
CREATE INDEX idx_sleep_reminders_active ON sleep_reminders(active) WHERE active = true;

-- Insert default sleep hygiene tips
INSERT INTO sleep_hygiene_tips (category, title, description, priority) VALUES
('routine', 'Mantenha horários regulares', 'Tente manter horários regulares para dormir e acordar, mesmo nos fins de semana', 1),
('environment', 'Crie uma rotina relaxante antes de dormir', 'Desenvolva atividades calmas como leitura ou meditação 30-60 minutos antes de dormir', 1),
('environment', 'Reduza a exposição à luz azul pelo menos 1 hora antes de dormir', 'Evite telas de dispositivos eletrônicos ou use filtros de luz azul', 1),
('environment', 'Evite cafeína e estimulantes no período da tarde', 'Pare de consumir cafeína pelo menos 6 horas antes de dormir', 1),
('environment', 'Mantenha o quarto escuro, silencioso e fresco', 'Use cortinas blackout, tampões de ouvido ou máquinas de ruído branco se necessário', 2),
('lifestyle', 'Pratique exercícios regularmente', 'Exercite-se regularmente, mas evite atividades intensas 3-4 horas antes de dormir', 2),
('diet', 'Evite refeições pesadas antes de dormir', 'Faça a última refeição pelo menos 2-3 horas antes de deitar', 2),
('routine', 'Use técnicas de relaxamento', 'Pratique respiração profunda, meditação ou relaxamento muscular progressivo', 3),
('environment', 'Considere aromaterapia', 'Lavanda e outros aromas relaxantes podem ajudar a induzir o sono', 3),
('lifestyle', 'Limite cochilos durante o dia', 'Se precisar cochilar, faça por no máximo 20-30 minutos e antes das 15h', 3);

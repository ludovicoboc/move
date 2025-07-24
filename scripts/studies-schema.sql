-- Create tables for study management system

-- Table for study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT DEFAULT 'focus', -- 'focus', 'break', 'long_break'
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for exams/contests
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exam_date DATE,
  institution TEXT,
  status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for study materials
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'resumos', 'flashcards', 'simulados', etc.
  content TEXT,
  file_url TEXT,
  tags TEXT[],
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for simulations/practice tests
CREATE TABLE IF NOT EXISTS simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  total_questions INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for simulation questions
CREATE TABLE IF NOT EXISTS simulation_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'essay'
  options JSONB, -- For multiple choice options
  correct_answer TEXT,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  subject TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for simulation attempts
CREATE TABLE IF NOT EXISTS simulation_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  total_questions INTEGER,
  correct_answers INTEGER,
  duration_minutes INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  answers JSONB, -- Store user answers
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table for user preferences
CREATE TABLE IF NOT EXISTS study_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pomodoro_focus_minutes INTEGER DEFAULT 25,
  pomodoro_short_break INTEGER DEFAULT 5,
  pomodoro_long_break INTEGER DEFAULT 15,
  simplified_mode BOOLEAN DEFAULT FALSE,
  daily_study_goal INTEGER DEFAULT 120, -- minutes
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for study_sessions
CREATE POLICY "Users can view own study_sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study_sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study_sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study_sessions" ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create policies for exams
CREATE POLICY "Users can view own exams" ON exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exams" ON exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exams" ON exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exams" ON exams FOR DELETE USING (auth.uid() = user_id);

-- Create policies for study_materials
CREATE POLICY "Users can view own study_materials" ON study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study_materials" ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study_materials" ON study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study_materials" ON study_materials FOR DELETE USING (auth.uid() = user_id);

-- Create policies for simulations
CREATE POLICY "Users can view own simulations" ON simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations" ON simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulations" ON simulations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations" ON simulations FOR DELETE USING (auth.uid() = user_id);

-- Create policies for simulation_questions
CREATE POLICY "Users can view simulation questions" ON simulation_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM simulations WHERE simulations.id = simulation_questions.simulation_id AND simulations.user_id = auth.uid())
);
CREATE POLICY "Users can insert simulation questions" ON simulation_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM simulations WHERE simulations.id = simulation_questions.simulation_id AND simulations.user_id = auth.uid())
);
CREATE POLICY "Users can update simulation questions" ON simulation_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM simulations WHERE simulations.id = simulation_questions.simulation_id AND simulations.user_id = auth.uid())
);
CREATE POLICY "Users can delete simulation questions" ON simulation_questions FOR DELETE USING (
  EXISTS (SELECT 1 FROM simulations WHERE simulations.id = simulation_questions.simulation_id AND simulations.user_id = auth.uid())
);

-- Create policies for simulation_attempts
CREATE POLICY "Users can view own simulation_attempts" ON simulation_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulation_attempts" ON simulation_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulation_attempts" ON simulation_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulation_attempts" ON simulation_attempts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for study_preferences
CREATE POLICY "Users can view own study_preferences" ON study_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study_preferences" ON study_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study_preferences" ON study_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study_preferences" ON study_preferences FOR DELETE USING (auth.uid() = user_id);

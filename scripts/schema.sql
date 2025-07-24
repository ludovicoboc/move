-- Create tables for the dashboard application

-- Table for daily schedule items
CREATE TABLE IF NOT EXISTS painel_dia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  horario TIME NOT NULL,
  atividade TEXT NOT NULL,
  cor VARCHAR(20) DEFAULT 'blue',
  concluida BOOLEAN DEFAULT FALSE,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for priorities
CREATE TABLE IF NOT EXISTS prioridades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  concluida BOOLEAN DEFAULT FALSE,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for pause reminders
CREATE TABLE IF NOT EXISTS lembretes_pausas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  intervalo_minutos INTEGER NOT NULL DEFAULT 60,
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_lembrete TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE painel_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE prioridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lembretes_pausas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own painel_dia" ON painel_dia FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own painel_dia" ON painel_dia FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own painel_dia" ON painel_dia FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own painel_dia" ON painel_dia FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own prioridades" ON prioridades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prioridades" ON prioridades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prioridades" ON prioridades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prioridades" ON prioridades FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lembretes_pausas" ON lembretes_pausas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lembretes_pausas" ON lembretes_pausas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lembretes_pausas" ON lembretes_pausas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lembretes_pausas" ON lembretes_pausas FOR DELETE USING (auth.uid() = user_id);

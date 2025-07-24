-- Create tables for health management system

-- Table for medications
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL, -- 'daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed'
  times TEXT[], -- Array of times like ['08:00', '20:00']
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for medication doses taken
CREATE TABLE IF NOT EXISTS medication_doses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TIME NOT NULL,
  taken_time TIMESTAMP WITH TIME ZONE,
  taken BOOLEAN DEFAULT FALSE,
  dose_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for mood records
CREATE TABLE IF NOT EXISTS mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label TEXT, -- 'muito_ruim', 'ruim', 'neutro', 'bom', 'muito_bom'
  notes TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  activities TEXT[], -- Activities that might have influenced mood
  triggers TEXT[], -- Potential mood triggers
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for health metrics (optional for future expansion)
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'weight', 'blood_pressure', 'heart_rate', etc.
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for medications
CREATE POLICY "Users can view own medications" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON medications FOR DELETE USING (auth.uid() = user_id);

-- Create policies for medication_doses
CREATE POLICY "Users can view own medication_doses" ON medication_doses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medication_doses" ON medication_doses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medication_doses" ON medication_doses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medication_doses" ON medication_doses FOR DELETE USING (auth.uid() = user_id);

-- Create policies for mood_records
CREATE POLICY "Users can view own mood_records" ON mood_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood_records" ON mood_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood_records" ON mood_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood_records" ON mood_records FOR DELETE USING (auth.uid() = user_id);

-- Create policies for health_metrics
CREATE POLICY "Users can view own health_metrics" ON health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health_metrics" ON health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health_metrics" ON health_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health_metrics" ON health_metrics FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_medication_doses_date ON medication_doses(dose_date);
CREATE INDEX idx_mood_records_date ON mood_records(record_date);
CREATE INDEX idx_medications_active ON medications(active) WHERE active = true;

-- Create hyperfocuses table
CREATE TABLE IF NOT EXISTS hyperfocuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  time_limit INTEGER, -- in minutes
  tasks TEXT[], -- array of task descriptions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hyperfocus sessions table
CREATE TABLE IF NOT EXISTS hyperfocus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hyperfocus_id UUID REFERENCES hyperfocuses(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in minutes
  completed_tasks TEXT[],
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create toggle sessions table
CREATE TABLE IF NOT EXISTS toggle_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  hyperfocus_ids UUID[] NOT NULL,
  current_index INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 25, -- minutes per hyperfocus
  break_duration INTEGER DEFAULT 5, -- minutes between switches
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hyperfocus projects table
CREATE TABLE IF NOT EXISTS hyperfocus_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hyperfocus_id UUID REFERENCES hyperfocuses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
  progress INTEGER DEFAULT 0, -- percentage
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hyperfocuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hyperfocus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE toggle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hyperfocus_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own hyperfocuses" ON hyperfocuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hyperfocuses" ON hyperfocuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hyperfocuses" ON hyperfocuses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hyperfocuses" ON hyperfocuses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own hyperfocus sessions" ON hyperfocus_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hyperfocus sessions" ON hyperfocus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hyperfocus sessions" ON hyperfocus_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own toggle sessions" ON toggle_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own toggle sessions" ON toggle_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own toggle sessions" ON toggle_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own toggle sessions" ON toggle_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own hyperfocus projects" ON hyperfocus_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hyperfocus projects" ON hyperfocus_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hyperfocus projects" ON hyperfocus_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hyperfocus projects" ON hyperfocus_projects
  FOR DELETE USING (auth.uid() = user_id);

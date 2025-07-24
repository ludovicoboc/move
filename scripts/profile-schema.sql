-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accessibility_preferences table
CREATE TABLE IF NOT EXISTS accessibility_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  high_contrast BOOLEAN DEFAULT FALSE,
  reduced_stimuli BOOLEAN DEFAULT FALSE,
  large_text BOOLEAN DEFAULT FALSE,
  text_size_multiplier DECIMAL DEFAULT 1.0,
  color_blind_support TEXT,
  reduced_motion BOOLEAN DEFAULT FALSE,
  keyboard_navigation BOOLEAN DEFAULT FALSE,
  screen_reader_support BOOLEAN DEFAULT FALSE,
  focus_indicators BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create theme_preferences table
CREATE TABLE IF NOT EXISTS theme_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme_mode TEXT DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  primary_color TEXT DEFAULT '#3b82f6',
  accent_color TEXT DEFAULT '#10b981',
  sidebar_style TEXT DEFAULT 'default' CHECK (sidebar_style IN ('default', 'compact', 'minimal')),
  card_style TEXT DEFAULT 'default' CHECK (card_style IN ('default', 'bordered', 'elevated')),
  animation_level TEXT DEFAULT 'normal' CHECK (animation_level IN ('none', 'reduced', 'normal', 'enhanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  sleep_hours INTEGER DEFAULT 8,
  water_glasses INTEGER DEFAULT 8,
  priority_tasks INTEGER DEFAULT 3,
  scheduled_breaks INTEGER DEFAULT 4,
  study_hours INTEGER DEFAULT 2,
  exercise_minutes INTEGER DEFAULT 30,
  meditation_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  visual_reminders BOOLEAN DEFAULT TRUE,
  scheduled_breaks BOOLEAN DEFAULT TRUE,
  task_reminders BOOLEAN DEFAULT TRUE,
  meal_reminders BOOLEAN DEFAULT FALSE,
  sleep_reminders BOOLEAN DEFAULT TRUE,
  study_reminders BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sound_notifications BOOLEAN DEFAULT TRUE,
  vibration_notifications BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own accessibility preferences" ON accessibility_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own accessibility preferences" ON accessibility_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accessibility preferences" ON accessibility_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own theme preferences" ON theme_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own theme preferences" ON theme_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own theme preferences" ON theme_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own daily goals" ON daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own daily goals" ON daily_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily goals" ON daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notification preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO accessibility_preferences (user_id)
  VALUES (NEW.id);
  
  INSERT INTO theme_preferences (user_id)
  VALUES (NEW.id);
  
  INSERT INTO daily_goals (user_id)
  VALUES (NEW.id);
  
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create preferences for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_preferences();

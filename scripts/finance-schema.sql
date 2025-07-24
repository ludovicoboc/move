-- Finance Management Schema

-- Categories table
CREATE TABLE IF NOT EXISTS finance_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  envelope_id UUID REFERENCES virtual_envelopes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual Envelopes table
CREATE TABLE IF NOT EXISTS virtual_envelopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  used_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Payments table
CREATE TABLE IF NOT EXISTS scheduled_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  category_id UUID REFERENCES finance_categories(id) ON DELETE SET NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO finance_categories (user_id, name, color) 
SELECT 
  auth.uid(),
  category.name,
  category.color
FROM (
  VALUES 
    ('Moradia', '#EF4444'),
    ('Alimentação', '#22C55E'),
    ('Transporte', '#3B82F6'),
    ('Saúde', '#F59E0B'),
    ('Lazer', '#8B5CF6')
) AS category(name, color)
WHERE auth.uid() IS NOT NULL;

-- RLS Policies
ALTER TABLE finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can manage their own finance categories" ON finance_categories
  FOR ALL USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can manage their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Virtual envelopes policies
CREATE POLICY "Users can manage their own virtual envelopes" ON virtual_envelopes
  FOR ALL USING (auth.uid() = user_id);

-- Scheduled payments policies
CREATE POLICY "Users can manage their own scheduled payments" ON scheduled_payments
  FOR ALL USING (auth.uid() = user_id);

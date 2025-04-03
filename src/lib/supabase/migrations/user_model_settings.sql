-- Create user_model_settings table
CREATE TABLE IF NOT EXISTS user_model_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  preferred_provider TEXT NOT NULL DEFAULT 'openai',
  preferred_hosting TEXT NOT NULL DEFAULT 'cloud',
  api_keys JSONB DEFAULT '{}'::jsonb,
  custom_models JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_model_settings_user_id ON user_model_settings(user_id);

-- Set up RLS policies
ALTER TABLE user_model_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own model settings"
  ON user_model_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own model settings"
  ON user_model_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own model settings"
  ON user_model_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own model settings"
  ON user_model_settings FOR DELETE
  USING (auth.uid() = user_id);

// Script to update the DeepSeek model ID in the database
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateModelId() {
  try {
    console.log('Fetching user ID...');
    // Get user ID
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'hazlamahedich@gmail.com')
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return;
    }

    const userId = profiles.id;
    console.log('User ID:', userId);

    // Get current model settings
    console.log('Fetching current model settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_model_settings')
      .select('custom_models')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('Error fetching model settings:', settingsError);
      return;
    }

    if (!settings || !settings.custom_models) {
      console.log('No custom models found for user');
      return;
    }

    console.log('Current custom models:', JSON.stringify(settings.custom_models, null, 2));

    // Update the model ID
    const updatedModels = settings.custom_models.map(model => {
      if (model.id === 'deepseek-r1:14b') {
        console.log('Found model with problematic ID, updating...');
        return {
          ...model,
          id: 'deepseek-r1-14b'
        };
      }
      return model;
    });

    console.log('Updated custom models:', JSON.stringify(updatedModels, null, 2));

    // Update the database
    console.log('Updating database...');
    const { data: updateResult, error: updateError } = await supabase
      .from('user_model_settings')
      .update({ custom_models: updatedModels })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating model settings:', updateError);
      return;
    }

    console.log('Model ID updated successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateModelId();

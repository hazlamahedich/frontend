import { createClient } from '@/lib/supabase/server';
import AIModelSettings from '@/components/settings/ai-model-settings';
import { ModelProvider, ModelHosting } from '@/lib/ai/litellm-config';

export const metadata = {
  title: 'AI Model Settings | Surge SEO Platform',
  description: 'Configure your AI model providers and settings',
};

export default async function AIModelsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single();
  
  // Get user's AI model settings
  const { data: modelSettings } = await supabase
    .from('user_model_settings')
    .select('*')
    .eq('user_id', session?.user?.id)
    .single();
  
  // Default settings if none exist
  const settings = modelSettings || {
    preferred_provider: ModelProvider.OPENAI,
    preferred_hosting: ModelHosting.CLOUD,
    api_keys: {},
    custom_models: [],
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Model Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your AI model providers and settings for the SEO platform.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <AIModelSettings 
          userId={session?.user?.id || ''} 
          userTier={profile?.subscription_tier || 'free'} 
          initialSettings={settings}
        />
      </div>
    </div>
  );
}

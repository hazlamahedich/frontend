import { createClient } from '@/lib/supabase/server';
import TokenUsageDashboard from '@/components/settings/token-usage-dashboard';
import { ModelTier } from '@/lib/ai/litellm-config';

export const metadata = {
  title: 'Token Usage | Surge SEO Platform',
  description: 'Track your AI token usage and costs',
};

export default async function TokenUsagePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session?.user?.id)
    .single();
  
  const userTier = profile?.subscription_tier || 'free';
  
  // Get token limits based on user tier
  const tokenLimits = {
    [ModelTier.FREE]: 100000, // 100K tokens per month
    [ModelTier.STANDARD]: 500000, // 500K tokens per month
    [ModelTier.PREMIUM]: 2000000, // 2M tokens per month
  };
  
  const tokenLimit = tokenLimits[userTier as keyof typeof tokenLimits] || tokenLimits[ModelTier.FREE];
  
  // Get token usage for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { data: tokenUsage } = await supabase
    .from('token_usage')
    .select('*')
    .eq('user_id', session?.user?.id)
    .gte('timestamp', startOfMonth.toISOString())
    .lte('timestamp', endOfMonth.toISOString())
    .order('timestamp', { ascending: false });
  
  // Get token usage by model
  const { data: usageByModel } = await supabase
    .rpc('get_token_usage_by_model', {
      user_id_param: session?.user?.id,
      start_date_param: startOfMonth.toISOString(),
      end_date_param: endOfMonth.toISOString(),
    });
  
  // Get token usage by day
  const { data: usageByDay } = await supabase
    .rpc('get_token_usage_by_day', {
      user_id_param: session?.user?.id,
      start_date_param: startOfMonth.toISOString(),
      end_date_param: endOfMonth.toISOString(),
    });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Token Usage</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your AI token usage and costs for the current billing period.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <TokenUsageDashboard 
          tokenUsage={tokenUsage || []}
          usageByModel={usageByModel || []}
          usageByDay={usageByDay || []}
          tokenLimit={tokenLimit}
          userTier={userTier}
        />
      </div>
    </div>
  );
}

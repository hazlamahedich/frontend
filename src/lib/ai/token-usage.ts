import { createClient } from '@/lib/supabase/server';
import { ModelTier } from './litellm-config';

// Define token limits based on user tier
const TOKEN_LIMITS = {
  [ModelTier.FREE]: 100000, // 100K tokens per month
  [ModelTier.STANDARD]: 500000, // 500K tokens per month
  [ModelTier.PREMIUM]: 2000000, // 2M tokens per month
};

// Get user tier from database
export async function getUserTier(userId: string): Promise<string> {
  if (!userId) return ModelTier.FREE;
  
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();
  
  return data?.subscription_tier || ModelTier.FREE;
}

// Check if user has exceeded their token limit
export async function hasExceededTokenLimit(userId: string, userTier: string): Promise<boolean> {
  if (!userId) return false;
  
  const supabase = createClient();
  
  // Get the current month's usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { data } = await supabase
    .from('token_usage')
    .select('total_tokens')
    .eq('user_id', userId)
    .gte('timestamp', startOfMonth.toISOString())
    .lte('timestamp', endOfMonth.toISOString());
  
  if (!data || data.length === 0) return false;
  
  // Calculate total usage
  const totalUsage = data.reduce((sum, record) => sum + record.total_tokens, 0);
  
  // Check against limit
  const limit = TOKEN_LIMITS[userTier as keyof typeof TOKEN_LIMITS] || TOKEN_LIMITS[ModelTier.FREE];
  
  return totalUsage >= limit;
}

// Record token usage
export async function recordTokenUsage(
  userId: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  totalTokens: number
): Promise<void> {
  if (!userId) return;
  
  const supabase = createClient();
  
  await supabase.from('token_usage').insert({
    user_id: userId,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    timestamp: new Date().toISOString(),
  });
}

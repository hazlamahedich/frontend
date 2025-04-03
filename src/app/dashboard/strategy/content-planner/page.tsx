import { createClient } from '@/lib/supabase/server';
import ContentPlannerForm from '@/components/strategy/content-planner-form';

export const metadata = {
  title: 'Content Planner | Surge SEO Platform',
  description: 'Plan your content strategy with AI-powered recommendations',
};

export default async function ContentPlannerPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile to determine tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session?.user?.id)
    .single();
  
  const userTier = profile?.subscription_tier || 'free';
  
  // Get user's websites
  const { data: websites } = await supabase
    .from('websites')
    .select('id, url, name')
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false });
  
  // Get user's keywords
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, keyword, search_volume, difficulty, intent')
    .eq('is_tracked', true)
    .order('search_volume', { ascending: false })
    .limit(100);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Planner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Plan your content strategy with AI-powered recommendations based on your keywords and audience.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <ContentPlannerForm 
          userTier={userTier} 
          websites={websites || []}
          keywords={keywords || []}
        />
      </div>
    </div>
  );
}

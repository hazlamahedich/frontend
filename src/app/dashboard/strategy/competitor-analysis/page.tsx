import { createClient } from '@/lib/supabase/server';
import CompetitorAnalysisForm from '@/components/strategy/competitor-analysis-form';

export const metadata = {
  title: 'Competitor Analysis | Surge SEO Platform',
  description: 'Analyze your competitors\' SEO strategies and identify opportunities',
};

export default async function CompetitorAnalysisPage() {
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
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze your competitors' SEO strategies and identify opportunities to outperform them.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <CompetitorAnalysisForm 
          userTier={userTier} 
          websites={websites || []}
        />
      </div>
    </div>
  );
}

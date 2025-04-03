import { createClient } from '@/lib/supabase/server';
import KeywordResearchForm from '@/components/seo/keyword-research-form';

export const metadata = {
  title: 'Keyword Research | Surge SEO Platform',
  description: 'Discover high-value keywords with AI-powered analysis',
};

export default async function KeywordResearchPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile to determine tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session?.user?.id)
    .single();
  
  const userTier = profile?.subscription_tier || 'free';
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Keyword Research</h1>
        <p className="mt-1 text-sm text-gray-500">
          Discover high-value keywords with AI-powered analysis of search intent, competition, and traffic potential.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <KeywordResearchForm userTier={userTier} />
      </div>
    </div>
  );
}

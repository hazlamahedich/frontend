import { createClient } from '@/lib/supabase/server';
import ContentAnalysisForm from '@/components/seo/content-analysis-form';

export const metadata = {
  title: 'Content Analysis | Surge SEO Platform',
  description: 'Analyze and optimize your content with AI-powered recommendations',
};

export default async function ContentAnalysisPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Content Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze and optimize your content with AI-powered recommendations to improve rankings and engagement.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <ContentAnalysisForm userTier={userTier} />
      </div>
    </div>
  );
}

import { requireAuth, getUserProfile } from '@/lib/supabase/auth-actions';
import KeywordResearchClient from '@/components/seo/keyword-research-client';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Keyword Research | Surge SEO Platform',
  description: 'Discover high-value keywords with AI-powered analysis',
};

export default async function KeywordResearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Check authentication and get session
  const session = await requireAuth();

  // Get user profile to determine tier
  const profile = await getUserProfile(session.user.id);

  const userTier = profile?.subscription_tier || 'free';

  // Get project ID from query parameters
  const projectId = searchParams.projectId as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Keyword Research</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Discover high-value keywords with AI-powered analysis of search intent, competition, and traffic potential.
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <KeywordResearchClient userTier={userTier} projectId={projectId} />
      </div>
    </div>
  );
}

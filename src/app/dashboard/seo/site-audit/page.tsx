import { createClient } from '@/lib/supabase/server';
import SiteAuditForm from '@/components/seo/site-audit-form';

export const metadata = {
  title: 'Site Audit | Surge SEO Platform',
  description: 'Identify and fix technical SEO issues with our comprehensive site audit',
};

export default async function SiteAuditPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Get user profile to determine tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session?.user?.id)
    .single();

  const userTier = profile?.subscription_tier || 'free';

  // Get user's websites by joining with projects table
  const { data: websites } = await supabase
    .from('websites')
    .select('id, url, name, project_id, projects!inner(user_id)')
    .eq('projects.user_id', session?.user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Technical SEO Audit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Identify and fix technical SEO issues with our comprehensive site audit to improve crawlability, indexability, and site performance.
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <SiteAuditForm
          userTier={userTier}
          websites={websites || []}
        />
      </div>
    </div>
  );
}

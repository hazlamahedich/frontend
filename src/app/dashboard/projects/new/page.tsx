import { createClient } from '@/lib/supabase/server';
import NewProjectForm from '@/components/projects/new-project-form';

export const metadata = {
  title: 'New Project | Surge SEO Platform',
  description: 'Create a new SEO project',
};

export default async function NewProjectPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile to determine tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', session?.user?.id)
    .single();
  
  const userTier = profile?.subscription_tier || 'free';
  
  // Get count of existing projects to check against limits
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session?.user?.id);
  
  // Define project limits based on tier
  const projectLimits = {
    free: 3,
    standard: 10,
    premium: 50,
  };
  
  const projectLimit = projectLimits[userTier as keyof typeof projectLimits] || projectLimits.free;
  const projectsRemaining = Math.max(0, projectLimit - (count || 0));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new project to track and optimize your website.
        </p>
      </div>
      
      {projectsRemaining > 0 ? (
        <div className="p-6 bg-white rounded-lg shadow">
          <NewProjectForm userId={session?.user?.id || ''} />
        </div>
      ) : (
        <div className="p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-medium text-yellow-800">Project Limit Reached</h2>
          <p className="mt-2 text-sm text-yellow-700">
            You have reached the maximum number of projects allowed for your current plan ({projectLimit}).
            Please upgrade your plan to create more projects or delete existing projects.
          </p>
          <div className="mt-4">
            <a
              href="/dashboard/settings/billing"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Upgrade Plan
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

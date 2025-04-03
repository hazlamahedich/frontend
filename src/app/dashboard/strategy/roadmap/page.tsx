import { createClient } from '@/lib/supabase/server';
import SEORoadmapForm from '@/components/strategy/seo-roadmap-form';

export const metadata = {
  title: 'SEO Roadmap | Surge SEO Platform',
  description: 'Create a comprehensive SEO strategy and implementation roadmap',
};

export default async function SEORoadmapPage() {
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
  
  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Roadmap</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a comprehensive SEO strategy and implementation roadmap tailored to your website and business goals.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <SEORoadmapForm 
          userTier={userTier} 
          websites={websites || []}
          projects={projects || []}
        />
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProjectSettingsForm from '@/components/projects/project-settings-form';

interface ProjectSettingsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProjectSettingsPageProps) {
  const supabase = createClient();
  
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', params.id)
    .single();
  
  return {
    title: project ? `${project.name} Settings | Surge SEO Platform` : 'Project Settings | Surge SEO Platform',
    description: 'Manage your project settings',
  };
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session?.user?.id)
    .single();
  
  if (!project) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage settings for {project.name}.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <ProjectSettingsForm project={project} />
      </div>
      
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Danger Zone</h3>
        <p className="mt-2 text-sm text-red-700">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Globe, Plus, Zap } from 'lucide-react';

export const metadata = {
  title: 'Projects | Surge SEO Platform',
  description: 'Manage your SEO projects',
};

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your SEO projects and websites.
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 md:ml-4">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </div>
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {project.favicon_url ? (
                          <img
                            src={project.favicon_url}
                            alt=""
                            className="w-6 h-6 mr-3"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 mr-3 bg-primary-100 rounded">
                            <Zap className="w-4 h-4 text-primary-600" />
                          </div>
                        )}
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {project.name}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 ml-2">
                        <p className="inline-flex px-2 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          {project.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Globe className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {project.website_url}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                        <p>
                          Created on{' '}
                          {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {project.description && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <Zap className="w-12 h-12 mx-auto text-primary-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first project.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

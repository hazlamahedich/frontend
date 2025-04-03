import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink,
  Settings,
  Zap,
} from 'lucide-react';
import ProjectStatsCards from '@/components/dashboard/project-stats-cards';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const supabase = createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', params.id)
    .single();

  return {
    title: project ? `${project.name} | Surge SEO Platform` : 'Project | Surge SEO Platform',
    description: 'Manage your SEO project',
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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

  // Get website details
  const { data: websites } = await supabase
    .from('websites')
    .select('*')
    .eq('project_id', params.id);

  // Get keyword count
  const { count: keywordCount } = await supabase
    .from('keywords')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', params.id);

  // Get latest audit
  const { data: latestAudit } = await supabase
    .from('audits')
    .select('*')
    .eq('website_id', websites?.[0]?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            {project.favicon_url ? (
              <img
                src={project.favicon_url}
                alt=""
                className="w-8 h-8 mr-3"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 mr-3 bg-primary-100 rounded">
                <Zap className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <div className="flex items-center mt-1">
            <Globe className="w-4 h-4 mr-1 text-gray-400" />
            <a
              href={project.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-600 hover:underline"
            >
              {project.website_url}
              <ExternalLink className="inline-block w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
        <div className="flex mt-4 space-x-3 md:mt-0 md:ml-4">
          <Link
            href={`/dashboard/projects/${params.id}/settings`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
          <Link
            href={`/dashboard/seo/site-audit?projectId=${params.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Zap className="w-4 h-4 mr-2" />
            Run Audit
          </Link>
        </div>
      </div>

      {project.description && (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{project.description}</p>
        </div>
      )}

      <ProjectStatsCards
        projectId={params.id}
        initialKeywordCount={keywordCount || 0}
        initialLatestAudit={latestAudit}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
            <div className="flex items-center justify-center h-48 text-gray-500">
              No recent activity
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
          </div>
          <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Run your first site audit
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Start by running a comprehensive site audit to identify technical SEO issues and opportunities.
                      </p>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/dashboard/seo/site-audit?projectId=${params.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Run audit →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Search className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Research keywords for your industry
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Discover high-value keywords that your target audience is searching for.
                      </p>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/dashboard/seo/keyword-research?projectId=${params.id}`}
                        className="text-sm font-medium text-green-600 hover:text-green-500"
                      >
                        Research keywords →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-purple-800">
                      Optimize your content
                    </h3>
                    <div className="mt-2 text-sm text-purple-700">
                      <p>
                        Analyze and optimize your content to improve rankings and engagement.
                      </p>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/dashboard/seo/content-analysis?projectId=${params.id}`}
                        className="text-sm font-medium text-purple-600 hover:text-purple-500"
                      >
                        Analyze content →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

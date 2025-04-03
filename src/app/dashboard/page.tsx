import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  BarChart2,
  Search,
  Globe,
  FileText,
  Zap,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard | Surge SEO Platform',
  description: 'Your SEO dashboard',
};

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single();
  
  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session?.user?.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || session?.user?.email}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your SEO projects today.
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Keyword Research
                  </dt>
                  <dd className="flex items-center">
                    <div className="text-lg font-medium text-gray-900">
                      Find opportunities
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <Link
                href="/dashboard/seo/keyword-research"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                <span className="flex items-center">
                  Start researching
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Site Audit
                  </dt>
                  <dd className="flex items-center">
                    <div className="text-lg font-medium text-gray-900">
                      Analyze your site
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <Link
                href="/dashboard/seo/site-audit"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                <span className="flex items-center">
                  Run an audit
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Content Analysis
                  </dt>
                  <dd className="flex items-center">
                    <div className="text-lg font-medium text-gray-900">
                      Optimize content
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <Link
                href="/dashboard/seo/content-analysis"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                <span className="flex items-center">
                  Analyze content
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart2 className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 w-0 ml-5">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rank Tracking
                  </dt>
                  <dd className="flex items-center">
                    <div className="text-lg font-medium text-gray-900">
                      Monitor rankings
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="text-sm">
              <Link
                href="/dashboard/seo/rank-tracking"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                <span className="flex items-center">
                  View rankings
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Your Projects</h2>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        
        <div className="mt-4 overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
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
                            Active
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
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    No projects yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new project.
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/dashboard/projects/new"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Link>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* AI Features */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">AI-Powered Features</h2>
        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative p-6 bg-white rounded-lg shadow">
            <div className="absolute p-3 bg-primary-100 rounded-lg">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <div className="pt-16">
              <h3 className="text-lg font-medium text-gray-900">
                AI Strategy Engine
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Get AI-powered strategic recommendations tailored to your website and industry.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/strategy/roadmap"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <span className="flex items-center">
                    Create strategy
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative p-6 bg-white rounded-lg shadow">
            <div className="absolute p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div className="pt-16">
              <h3 className="text-lg font-medium text-gray-900">
                Content Optimization
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Analyze and optimize your content with AI to improve rankings and engagement.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/seo/content-analysis"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <span className="flex items-center">
                    Optimize content
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative p-6 bg-white rounded-lg shadow">
            <div className="absolute p-3 bg-primary-100 rounded-lg">
              <Search className="w-6 h-6 text-primary-600" />
            </div>
            <div className="pt-16">
              <h3 className="text-lg font-medium text-gray-900">
                Keyword Intelligence
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Discover high-value keywords with AI-powered intent and difficulty analysis.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/seo/keyword-research"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <span className="flex items-center">
                    Research keywords
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

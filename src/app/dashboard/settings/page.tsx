import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CreditCard, Key, User, Cpu, BarChart } from 'lucide-react';

export const metadata = {
  title: 'Settings | Surge SEO Platform',
  description: 'Manage your account settings',
};

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          <li>
            <Link
              href="/dashboard/profile"
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3 text-gray-400" />
                    <p className="text-sm font-medium text-primary-600 truncate">
                      Profile
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Manage your personal information and preferences
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/settings/billing"
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                    <p className="text-sm font-medium text-primary-600 truncate">
                      Billing
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Manage your subscription and payment methods
                    </p>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                    <p className="capitalize">
                      <span className="px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full">
                        {profile?.subscription_tier || 'Free'} Plan
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/settings/ai-models"
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Cpu className="w-5 h-5 mr-3 text-gray-400" />
                    <p className="text-sm font-medium text-primary-600 truncate">
                      AI Models
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Configure AI model providers and settings
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/settings/token-usage"
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart className="w-5 h-5 mr-3 text-gray-400" />
                    <p className="text-sm font-medium text-primary-600 truncate">
                      Token Usage
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Track your AI token usage and costs
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/settings/security"
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Key className="w-5 h-5 mr-3 text-gray-400" />
                    <p className="text-sm font-medium text-primary-600 truncate">
                      Security
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Manage your password and account security
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900">API Access</h2>
        <p className="mt-1 text-sm text-gray-500">
          Access the Surge API to integrate with your own applications.
        </p>
        <div className="mt-4">
          <Link
            href="/dashboard/settings/api"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Manage API Keys
          </Link>
        </div>
      </div>

      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-lg font-medium text-red-800">Delete Account</h2>
        <p className="mt-1 text-sm text-red-700">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

import { requireAuth } from '@/lib/supabase/auth-actions';
import DashboardSidebar from '@/components/layout/dashboard-sidebar';
import DashboardHeader from '@/components/layout/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the user is authenticated using server action
  const session = await requireAuth();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <DashboardSidebar />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto dark:bg-gray-900">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

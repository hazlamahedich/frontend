import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/auth/profile-form';

export const metadata = {
  title: 'Profile | Surge SEO Platform',
  description: 'Manage your profile',
};

export default async function ProfilePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and profile information.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <ProfileForm user={session?.user} profile={profile} />
      </div>
    </div>
  );
}

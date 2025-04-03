'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

interface ProfileFormProps {
  user: User | undefined;
  profile: Profile | null;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // Update user metadata
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        },
      });

      if (userUpdateError) {
        throw userUpdateError;
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md">
          Profile updated successfully.
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50"
          value={user?.email || ''}
          disabled
        />
        <p className="mt-1 text-xs text-gray-500">
          Your email cannot be changed.
        </p>
      </div>

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="avatarUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Avatar URL (Optional)
        </label>
        <input
          type="url"
          id="avatarUrl"
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={avatarUrl || ''}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>

      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700">Subscription</h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            <span className="font-medium">Current plan:</span>{' '}
            <span className="capitalize">{profile?.subscription_tier || 'Free'}</span>
          </p>
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span className="capitalize">{profile?.subscription_status || 'Active'}</span>
          </p>
          {profile?.subscription_end_date && (
            <p>
              <span className="font-medium">Renewal date:</span>{' '}
              {new Date(profile.subscription_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="mt-3">
          <a
            href="/dashboard/settings/billing"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Manage subscription →
          </a>
        </div>
      </div>

      <div className="flex items-center pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 mr-2 -ml-1 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

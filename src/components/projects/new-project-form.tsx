'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NewProjectFormProps {
  userId: string;
}

export default function NewProjectForm({ userId }: NewProjectFormProps) {
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate URL format
      try {
        new URL(websiteUrl);
      } catch (err) {
        setError('Please enter a valid URL including http:// or https://');
        setIsLoading(false);
        return;
      }

      // Try to fetch favicon
      let faviconUrl = null;
      try {
        const url = new URL(websiteUrl);
        faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
      } catch (err) {
        // Ignore favicon errors
      }

      // Create project in database
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name,
          description,
          website_url: websiteUrl,
          favicon_url: faviconUrl,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Create website entry
      await supabase.from('websites').insert({
        project_id: data.id,
        url: websiteUrl,
        name: name,
      });

      // Redirect to project page
      router.push(`/dashboard/projects/${data.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project. Please try again.');
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

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Project Name
        </label>
        <input
          type="text"
          id="name"
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="My Website"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label
          htmlFor="websiteUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Website URL
        </label>
        <input
          type="url"
          id="websiteUrl"
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="https://example.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Include https:// or http:// in the URL
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={3}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Brief description of your website or project"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center pt-4">
        <button
          type="submit"
          disabled={isLoading || !name || !websiteUrl}
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
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 ml-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

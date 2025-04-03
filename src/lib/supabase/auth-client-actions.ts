'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Client-side action to sign out
export const useSignOut = () => {
  const router = useRouter();
  const supabase = createClient();
  
  return async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };
};

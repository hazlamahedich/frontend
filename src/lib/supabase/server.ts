import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

// For middleware.ts
export const createMiddlewareClient = (request: Request, response: Response) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookies = request.headers.get('cookie') || '';
          const cookie = cookies
            .split('; ')
            .find((c) => c.startsWith(`${name}=`));
          if (!cookie) return undefined;
          return cookie.split('=')[1];
        },
        set(name: string, value: string, options: any) {
          // This is handled by the middleware
        },
        remove(name: string, options: any) {
          // This is handled by the middleware
        },
      },
    }
  );
};

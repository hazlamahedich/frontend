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
          // Use synchronous version for server components
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: any) {
          // In server components, we can only set cookies in Server Actions or Route Handlers
          // This will be a no-op in regular server components
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // Silently fail if we're not in a Server Action or Route Handler
            console.warn('Cannot set cookie outside of Server Action or Route Handler');
          }
        },
        remove(name: string, options: any) {
          // In server components, we can only remove cookies in Server Actions or Route Handlers
          // This will be a no-op in regular server components
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (e) {
            // Silently fail if we're not in a Server Action or Route Handler
            console.warn('Cannot remove cookie outside of Server Action or Route Handler');
          }
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

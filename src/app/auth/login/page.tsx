import LoginForm from '@/components/auth/login-form';
import Link from 'next/link';

export const metadata = {
  title: 'Login | Surge SEO Platform',
  description: 'Log in to your Surge SEO account',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 border-b">
        <div className="container flex items-center justify-between px-4 mx-auto">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Surge
          </Link>
        </div>
      </header>
      
      <main className="flex items-center justify-center flex-1 px-4 py-12 bg-gray-50">
        <LoginForm />
      </main>
      
      <footer className="py-6 text-center text-gray-500 bg-gray-50">
        <div className="container px-4 mx-auto">
          <p>© {new Date().getFullYear()} Surge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

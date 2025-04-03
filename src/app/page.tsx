import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Check if user is already logged in
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 bg-white border-b">
        <div className="container flex items-center justify-between px-4 mx-auto">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Surge
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">AI-Powered SEO Platform</span>
                <span className="block text-primary-600">for the Modern Web</span>
              </h1>
              <p className="max-w-2xl mx-auto mt-6 text-xl text-gray-500">
                Leverage advanced AI to optimize your website, analyze competitors, and create winning SEO strategies that drive real results.
              </p>
              <div className="flex justify-center mt-10 space-x-4">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 text-base font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 text-base font-medium text-primary-600 bg-white border border-primary-600 rounded-md hover:bg-primary-50 md:py-4 md:text-lg md:px-10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Powerful AI-Driven SEO Features
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Our platform combines cutting-edge AI with proven SEO techniques to help you outrank competitors and drive more organic traffic.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="relative p-8 bg-white border rounded-lg shadow-sm">
                <div className="absolute p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    ></path>
                  </svg>
                </div>
                <div className="pt-16">
                  <h3 className="text-lg font-medium text-gray-900">
                    AI Strategy Engine
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Get customized SEO strategies based on your industry, competitors, and website performance. Our AI analyzes your unique situation to create actionable plans.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative p-8 bg-white border rounded-lg shadow-sm">
                <div className="absolute p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <div className="pt-16">
                  <h3 className="text-lg font-medium text-gray-900">
                    Content Optimization
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Analyze and optimize your content with AI-powered recommendations. Improve readability, keyword usage, and semantic relevance to rank higher.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative p-8 bg-white border rounded-lg shadow-sm">
                <div className="absolute p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    ></path>
                  </svg>
                </div>
                <div className="pt-16">
                  <h3 className="text-lg font-medium text-gray-900">
                    Real-Time SERP Monitoring
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Track your rankings with real-time SERP monitoring. Get alerts for ranking changes and competitor movements to stay ahead of the curve.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative p-8 bg-white border rounded-lg shadow-sm">
                <div className="absolute p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                    ></path>
                  </svg>
                </div>
                <div className="pt-16">
                  <h3 className="text-lg font-medium text-gray-900">
                    Keyword Intelligence
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Discover high-value keywords with our AI-powered keyword research tool. Analyze search intent, competition, and traffic potential to prioritize your efforts.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="relative p-8 bg-white border rounded-lg shadow-sm">
                <div className="absolute p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                </div>
                <div className="pt-16">
                  <h3 className="text-lg font-medium text-gray-900">
                    Technical SEO Audit
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Identify and fix technical SEO issues with our comprehensive site audit. Improve crawlability, indexability, and site performance to boost rankings.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="relative p-8 bg-white border rounded-lg shadow-sm">
                <div className="absolute p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    ></path>
                  </svg>
                </div>
                <div className="pt-16">
                  <h3 className="text-lg font-medium text-gray-900">
                    Predictive SEO Modeling
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Simulate the impact of SEO changes before implementing them. Our AI predicts traffic and ranking changes to help you make data-driven decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to transform your SEO strategy?
              </h2>
              <p className="mt-4 text-xl text-primary-100">
                Join thousands of businesses using Surge to drive more organic traffic and outrank competitors.
              </p>
              <div className="mt-10">
                <Link
                  href="/auth/signup"
                  className="px-8 py-3 text-base font-medium text-primary-600 bg-white border border-transparent rounded-md hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Guides
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-12 border-t border-gray-700">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} Surge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

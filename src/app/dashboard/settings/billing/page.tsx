import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Billing | Surge SEO Platform',
  description: 'Manage your subscription and billing',
};

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single();
  
  const currentPlan = profile?.subscription_tier || 'free';
  
  // Get token usage for the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data: tokenUsage } = await supabase
    .from('token_usage')
    .select('total_tokens')
    .eq('user_id', session?.user?.id)
    .gte('timestamp', startOfMonth.toISOString());
  
  const totalTokensUsed = tokenUsage?.reduce((sum, record) => sum + record.total_tokens, 0) || 0;
  
  // Define plan limits
  const planLimits = {
    free: {
      price: 0,
      projects: 3,
      keywords: 100,
      tokens: 50000,
      features: [
        'Basic keyword research',
        'Limited site audits',
        'Basic content analysis',
        'Weekly rank tracking',
      ],
    },
    standard: {
      price: 49,
      projects: 10,
      keywords: 500,
      tokens: 500000,
      features: [
        'Advanced keyword research',
        'Comprehensive site audits',
        'Advanced content analysis',
        'Daily rank tracking',
        'Competitor analysis',
        'Content optimization',
      ],
    },
    premium: {
      price: 99,
      projects: 50,
      keywords: 2000,
      tokens: 5000000,
      features: [
        'Enterprise-grade keyword research',
        'Unlimited site audits',
        'AI-powered content optimization',
        'Real-time rank tracking',
        'Advanced competitor analysis',
        'Predictive SEO modeling',
        'Custom SEO strategy',
        'Priority support',
      ],
    },
  };
  
  const currentPlanLimits = planLimits[currentPlan as keyof typeof planLimits] || planLimits.free;
  const tokenPercentage = Math.min(100, Math.round((totalTokensUsed / currentPlanLimits.tokens) * 100));
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and payment methods.
        </p>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-900 capitalize">{currentPlan} Plan</p>
              {currentPlan !== 'free' && (
                <p className="mt-1 text-sm text-gray-500">
                  {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'} •{' '}
                  {profile?.subscription_end_date
                    ? `Renews on ${new Date(profile.subscription_end_date).toLocaleDateString()}`
                    : 'No renewal date'}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${currentPlanLimits.price}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </p>
              {currentPlan !== 'premium' && (
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900">Usage</h2>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">AI Token Usage</p>
              <p className="text-sm font-medium text-gray-700">
                {totalTokensUsed.toLocaleString()} / {currentPlanLimits.tokens.toLocaleString()} tokens
              </p>
            </div>
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  tokenPercentage > 90 ? 'bg-red-500' : tokenPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${tokenPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Projects</p>
              <p className="text-sm font-medium text-gray-700">
                {/* This would be dynamic in a real app */}
                1 / {currentPlanLimits.projects} projects
              </p>
            </div>
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${(1 / currentPlanLimits.projects) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Keywords</p>
              <p className="text-sm font-medium text-gray-700">
                {/* This would be dynamic in a real app */}
                25 / {currentPlanLimits.keywords} keywords
              </p>
            </div>
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${(25 / currentPlanLimits.keywords) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="pricing" className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Plans & Pricing</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Free Plan */}
          <div className={`p-6 bg-white rounded-lg shadow ${currentPlan === 'free' ? 'ring-2 ring-primary-500' : ''}`}>
            <h3 className="text-lg font-medium text-gray-900">Free</h3>
            <p className="mt-4 text-sm text-gray-500">
              Get started with basic SEO tools
            </p>
            <p className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900">$0</span>
              <span className="text-base font-medium text-gray-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-4">
              {planLimits.free.features.map((feature, index) => (
                <li key={index} className="flex">
                  <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                  <span className="ml-3 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {currentPlan === 'free' ? (
                <button
                  disabled
                  className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-transparent rounded-md"
                >
                  Current Plan
                </button>
              ) : (
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Downgrade
                </button>
              )}
            </div>
          </div>
          
          {/* Standard Plan */}
          <div className={`p-6 bg-white rounded-lg shadow ${currentPlan === 'standard' ? 'ring-2 ring-primary-500' : ''}`}>
            <h3 className="text-lg font-medium text-gray-900">Standard</h3>
            <p className="mt-4 text-sm text-gray-500">
              Perfect for growing websites
            </p>
            <p className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900">$49</span>
              <span className="text-base font-medium text-gray-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-4">
              {planLimits.standard.features.map((feature, index) => (
                <li key={index} className="flex">
                  <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                  <span className="ml-3 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {currentPlan === 'standard' ? (
                <button
                  disabled
                  className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-transparent rounded-md"
                >
                  Current Plan
                </button>
              ) : currentPlan === 'free' ? (
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Upgrade
                </button>
              ) : (
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Downgrade
                </button>
              )}
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className={`p-6 bg-white rounded-lg shadow ${currentPlan === 'premium' ? 'ring-2 ring-primary-500' : ''}`}>
            <h3 className="text-lg font-medium text-gray-900">Premium</h3>
            <p className="mt-4 text-sm text-gray-500">
              Advanced features for serious SEO
            </p>
            <p className="mt-4">
              <span className="text-3xl font-extrabold text-gray-900">$99</span>
              <span className="text-base font-medium text-gray-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-4">
              {planLimits.premium.features.map((feature, index) => (
                <li key={index} className="flex">
                  <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                  <span className="ml-3 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {currentPlan === 'premium' ? (
                <button
                  disabled
                  className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-transparent rounded-md"
                >
                  Current Plan
                </button>
              ) : (
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your payment methods and billing information.
        </p>
        <div className="mt-4">
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Add Payment Method
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
        <p className="mt-1 text-sm text-gray-500">
          View your past invoices and payment history.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-center h-24 text-gray-500">
            No billing history available
          </div>
        </div>
      </div>
    </div>
  );
}

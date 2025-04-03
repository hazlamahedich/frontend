'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Bell, Search, Menu, X, User, LogOut, Settings } from 'lucide-react';

export default function DashboardHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={24} className="w-6 h-6" />
            ) : (
              <Menu size={24} className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="flex flex-1 lg:ml-0">
          <div className="flex items-center flex-1 max-w-lg">
            <div className="w-full">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={20} className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full py-2 pl-10 pr-3 text-sm bg-white border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell size={24} className="w-6 h-6" />
          </button>

          <div className="relative ml-4">
            <div>
              <button
                type="button"
                className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                id="user-menu-button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 bg-primary-100 rounded-full"></div>
              </button>
            </div>

            {isProfileOpen && (
              <div
                className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <a
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <User size={16} className="w-4 h-4 mr-2" />
                  Your Profile
                </a>
                <a
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Settings size={16} className="w-4 h-4 mr-2" />
                  Settings
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <LogOut size={16} className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

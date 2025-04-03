'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

// Simple version without context dependency for now
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  
  // Apply theme function
  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return; // Don't run on server
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  // Set theme function
  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Initialize theme
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (storedTheme) {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  if (!mounted) {
    // Show a placeholder with the same dimensions while loading
    return <div className="flex items-center space-x-2 h-[36px] w-[108px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full transition-colors ${
          theme === 'light'
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        aria-label="Light mode"
      >
        <Sun size={18} className="transition-transform duration-200 ease-in-out hover:rotate-12" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full transition-colors ${
          theme === 'system'
            ? 'bg-primary-100 text-primary-600 dark:bg-secondary-900 dark:text-secondary-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        aria-label="System theme"
      >
        <Monitor size={18} className="transition-transform duration-200 ease-in-out hover:scale-110" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full transition-colors ${
          theme === 'dark'
            ? 'bg-secondary-900 text-secondary-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        aria-label="Dark mode"
      >
        <Moon size={18} className="transition-transform duration-200 ease-in-out hover:rotate-12" />
      </button>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  // Function to apply theme to document
  const applyTheme = (newTheme: Theme) => {
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

  // Function to save theme to Supabase if user is logged in
  const saveThemeToSupabase = async (newTheme: Theme) => {
    if (typeof window === 'undefined') return; // Don't run on server
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Load theme on initial render
  useEffect(() => {
    if (typeof window === 'undefined') return; // Don't run on server
    
    const loadTheme = async () => {
      setIsLoading(true);
      
      try {
        // First check if user is logged in and has a theme preference
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user's theme preference from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('id', user.id)
            .single();
          
          if (profile?.theme_preference) {
            setTheme(profile.theme_preference as Theme);
            applyTheme(profile.theme_preference as Theme);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage if no user or no preference
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
          setTheme(storedTheme);
          applyTheme(storedTheme);
        } else {
          // Default to system
          applyTheme('system');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to localStorage on error
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
          setTheme(storedTheme);
          applyTheme(storedTheme);
        } else {
          applyTheme('system');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [supabase, theme]);
  
  const value = {
    theme,
    isLoading,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
      saveThemeToSupabase(newTheme);
    }
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

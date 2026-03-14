import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('sql_visualizer_theme');
    return stored || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('sql_visualizer_theme', theme);
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5" />
      ) : (
        <Moon className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
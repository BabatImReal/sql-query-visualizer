import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Database, Save, BookOpen, Settings, Zap, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/theme/ThemeToggle';
import KeyboardShortcuts from '@/components/help/KeyboardShortcuts';

const navItems = [
  { label: 'Workspace', path: '/Workspace', icon: Database },
  { label: 'Saved Queries', path: '/SavedQueries', icon: Save },
  { label: 'Documentation', path: '/Documentation', icon: BookOpen },
  { label: 'Settings', path: '/Settings', icon: Settings },
];

export default function AppLayout() {
  console.log('AppLayout component rendering');
  const location = useLocation();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <>
    <KeyboardShortcuts isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    <div className="h-screen flex flex-col bg-[#0d1117] text-gray-200 overflow-hidden">
      <header className="h-12 flex items-center justify-between px-4 border-b border-[#21262d] bg-[#161b22] flex-shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/Workspace" className="flex items-center gap-2 text-white font-semibold text-sm tracking-tight">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span>SQL Visualizer</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#21262d] text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#21262d]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#21262d]"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </Button>
          <ThemeToggle />
          <span className="text-[10px] text-gray-500 bg-[#21262d] px-2 py-0.5 rounded font-mono">v1.0</span>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
    </>
  );
}
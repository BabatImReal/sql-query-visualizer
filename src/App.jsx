import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Workspace from '@/pages/Workspace';
import SavedQueries from '@/pages/SavedQueries';
import Documentation from '@/pages/Documentation';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]">
        <div className="w-8 h-8 border-4 border-[#21262d] border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Workspace" replace />} />
      <Route path="/workplace" element={<Navigate to="/Workspace" replace />} />
      <Route path="/Workplace" element={<Navigate to="/Workspace" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Workspace" element={<Workspace />} />
        <Route path="/SavedQueries" element={<SavedQueries />} />
        <Route path="/Documentation" element={<Documentation />} />
        <Route path="/Settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

import { ThemeProvider } from '@/components/theme/ThemeToggle';

import { SettingsProvider } from '@/lib/SettingsContext';

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <AuthenticatedApp />
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
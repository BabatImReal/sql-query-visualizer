import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Workplace from '@/pages/Workplace';
import SavedQueries from '@/pages/SavedQueries';
import Documentation from '@/pages/Documentation';
import Settings from '@/pages/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]">
        <div className="w-8 h-8 border-4 border-[#21262d] border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Workplace" replace />} />
      <Route path="/Workspace" element={<Navigate to="/Workplace" replace />} />
      <Route path="/workspace" element={<Navigate to="/Workplace" replace />} />
      <Route path="/workplace" element={<Navigate to="/Workplace" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/Workplace" element={<Workplace />} />
        <Route path="/SavedQueries" element={<SavedQueries />} />
        <Route path="/Documentation" element={<Documentation />} />
        <Route path="/Settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
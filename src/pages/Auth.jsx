import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !confirmPassword)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
        toast.success('Logged in successfully');
      } else {
        await register({ email, password });
        toast.success('Account created successfully');
      }
      navigate('/Workspace', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">SQL Visualizer</h1>
          <p className="text-sm text-slate-400">
            {mode === 'login'
              ? 'Sign in to access your workspace and saved queries.'
              : 'Create an account to save queries and personalize your workspace.'}
          </p>
        </div>

        <Card className="bg-slate-900/60 border-slate-800 shadow-xl">
          <div className="px-6 pt-6 flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/70 border-slate-800 text-slate-100 placeholder:text-slate-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Password</label>
              <Input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/70 border-slate-800 text-slate-100 placeholder:text-slate-500"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Confirm password</label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900/70 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              {isSubmitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>

            <p className="text-[11px] text-slate-500 mt-3">
              Accounts are created and stored securely using Supabase Auth.
              You can log in from any device using the same email and password.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

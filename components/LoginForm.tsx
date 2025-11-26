import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { Button } from './Button';
import { ADMIN_USER, ADMIN_PASS, APP_NAME } from '../constants';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Simulate JWT Generation
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ sub: username, name: "Admin User", iat: Date.now() }));
      const signature = btoa("simulated-secure-signature-hash");
      const token = `${header}.${payload}.${signature}`;
      
      onLogin(token);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[hsl(var(--bg))] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--text-main))] tracking-tight mb-2">{APP_NAME}</h1>
          <p className="text-[hsl(var(--text-dim))]">Enter credentials to access the secure environment.</p>
        </div>

        <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-8 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_20px_40px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--text-dim))] ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-dim))] group-focus-within:text-[hsl(var(--primary))]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] text-[hsl(var(--text-main))] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--text-dim))] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--text-dim))] group-focus-within:text-[hsl(var(--primary))]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] text-[hsl(var(--text-main))] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all"
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded animate-pulse">
                Invalid credentials. Access denied.
              </div>
            )}

            <Button type="submit" className="w-full justify-center">
              Authenticate
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-[hsl(var(--text-dim))] opacity-50">
          Secured with JWT & Cookies
        </p>
      </div>
    </div>
  );
};
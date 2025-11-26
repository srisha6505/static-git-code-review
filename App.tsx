import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for cookie
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (token: string) => {
    // Set cookie
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0";
    setIsAuthenticated(false);
  }

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}
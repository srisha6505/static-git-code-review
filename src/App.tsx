/**
 * Main application component.
 * Handles authentication state and renders appropriate views.
 * @module App
 */

import React from 'react';
import { LoginForm } from './components/features/auth';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './hooks';

/**
 * Root application component.
 * Manages authentication state and conditionally renders login or dashboard.
 */
export default function App() {
  const { checkingAuth, isAuthenticated, handleLogin, handleLogout } = useAuth();

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

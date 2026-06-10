import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook to access auth state and actions.
 *
 * Provides:
 * - address, isWalletConnected, connect, connectors, disconnect
 * - token, user, isAuthenticated, loading, authError
 * - logout, clearAuth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

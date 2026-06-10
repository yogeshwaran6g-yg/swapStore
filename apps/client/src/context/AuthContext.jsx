import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { walletLogin } from "@/services/authApiService";

export const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * AuthProvider — merges wagmi wallet state with JWT-based backend auth.
 *
 * Flow:
 * 1. User connects wallet via wagmi/appkit
 * 2. On wallet connect, we POST the address to /walletLogin
 * 3. Server returns JWT + uid → stored in localStorage
 * 4. All subsequent API calls attach the JWT via axios interceptor
 * 5. On wallet disconnect → clear JWT + user from localStorage
 */
export function AuthProvider({ children }) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // JWT auth state
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Persist token + user to localStorage
  const persistAuth = useCallback((newToken, newUser) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  // When wallet connects, auto-login to backend
  useEffect(() => {
    if (isConnected && address && !token) {
      let cancelled = false;

      const doLogin = async () => {
        setAuthLoading(true);
        setAuthError(null);
        try {
          const response = await walletLogin(address);
          if (!cancelled && response?.token) {
            persistAuth(response.token, {
              uid: response.uid,
              wallet_address: address,
            });
          }
        } catch (err) {
          if (!cancelled) {
            console.error('Auto wallet login failed:', err);
            setAuthError(err?.message || 'Login failed');
          }
        } finally {
          if (!cancelled) {
            setAuthLoading(false);
          }
        }
      };

      doLogin();
      return () => { cancelled = true; };
    }
  }, [isConnected, address, token, persistAuth]);

  // When wallet disconnects, clear auth
  useEffect(() => {
    if (!isConnected && token) {
      clearAuth();
    }
  }, [isConnected, token, clearAuth]);

  // Full disconnect (wallet + auth)
  const disconnect = useCallback(() => {
    clearAuth();
    wagmiDisconnect();
  }, [clearAuth, wagmiDisconnect]);

  // Logout (clear JWT but keep wallet connected — re-triggers auto-login)
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(() => ({
    // Wallet state
    address,
    isWalletConnected: isConnected,
    connect,
    connectors,
    disconnect,

    // Auth state
    token,
    user,
    isAuthenticated: isConnected && !!token,
    loading: isConnecting || authLoading,
    authError,

    // Actions
    logout,
    clearAuth,
  }), [
    address, isConnected, isConnecting, connect, connectors, disconnect,
    token, user, authLoading, authError, logout, clearAuth,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
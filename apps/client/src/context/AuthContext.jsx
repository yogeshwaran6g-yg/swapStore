import { createContext, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useAccount, useConnect, useDisconnect, usePublicClient, useWriteContract } from "wagmi";
import { walletLogin } from "@/services/authApiService";
import { getProfile } from "@/services/userApiService";
import { erc20Abi, GATEWAY_ADDRESSES, USDT_ADDRESSES } from '@/config/constants';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * AuthProvider — merges wagmi wallet state with JWT-based backend auth.
 * 
 * Perfect synchronization between wallet state and auth token.
 * If any one fails, clears auth and disconnects wallet.
 */
export function AuthProvider({ children }) {
  const { address, isConnected, status, chain } = useAccount(); // status: 'connecting', 'reconnecting', 'connected', 'disconnected'
  const { connect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

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
  
  // Start with loading true so we don't flash UI before wagmi initializes
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Guard against checking the same token multiple times per mount
  const verifiedTokenRef = useRef(null);

  // Full disconnect (wallet + auth)
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthError(null);
    setAuthLoading(false); // Stop loading if it was loading
    verifiedTokenRef.current = null;
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthError(null);
    verifiedTokenRef.current = null;
  }, []);

  // Main Sync Effect
  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      // 1. Wagmi is still initializing, wait.
      if (status === 'connecting' || status === 'reconnecting') {
        setAuthLoading(true);
        return;
      }

      // 2. Wagmi is explicitly disconnected
      if (status === 'disconnected') {
        if (token) {
          // We have token but no wallet, must clear auth immediately
          logout();
        } else {
          // Normal unauthenticated state
          setAuthLoading(false);
        }
        return;
      }

      // 3. Wagmi is connected
      if (status === 'connected' && address) {
        if (!token) {
          // Needs login
          try {
            setAuthLoading(true);
            setAuthError(null);
            const response = await walletLogin(address);
            
            if (!mounted) return;

            const newToken = response?.data?.token || response?.token;
            const newUid = response?.data?.uid || response?.uid;

            if (newToken && newUid) {
              localStorage.setItem(TOKEN_KEY, newToken);
              // Set token state, which triggers a re-run of this effect to verify it
              setToken(newToken);
            } else {
              throw new Error('No token returned from server');
            }
          } catch (err) {
            if (!mounted) return;
            console.error('Auto wallet login failed:', err);
            setAuthError(err?.response?.data?.error || err?.message || 'Login failed');
            logout();
          }
        } else {
          // We have a token AND a connected wallet. We MUST verify the token via /auth/me.
          if (verifiedTokenRef.current === token) {
            setAuthLoading(false);
            return;
          }

          try {
            setAuthLoading(true);
            setAuthError(null);
            
            // Strictly enforce the token validity
            const profile = await getProfile();
            
            if (!mounted) return;
            
            const userData = profile?.data || profile;
            
            if (userData) {
              localStorage.setItem(USER_KEY, JSON.stringify(userData));
              setUser(userData);
              verifiedTokenRef.current = token;
            } else {
              throw new Error('Invalid profile data');
            }
          } catch (err) {
            if (!mounted) return;
            console.error('Profile check failed (token expired or invalid):', err);
            setAuthError('Session expired. Please reconnect your wallet.');
            logout(); // Strictly log out if profile check fails
          } finally {
            if (mounted) {
              setAuthLoading(false);
            }
          }
        }
      }
    };

    syncAuth();

    return () => { mounted = false; };
  }, [status, address, token, logout]);

  const value = useMemo(() => ({
    // Wallet state
    address,
    isWalletConnected: isConnected,
    connect,
    connectors,
    disconnect: logout, // Map standard disconnect to our robust logout

    // Auth state
    token,
    user,
    isAuthenticated: isConnected && !!token && verifiedTokenRef.current === token,
    loading: authLoading, // Clean single source of truth for loading state
    authError,

    // Actions
    logout,
    clearAuth,
  }), [
    address, isConnected, connect, connectors, logout,
    token, user, authLoading, authError, clearAuth
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
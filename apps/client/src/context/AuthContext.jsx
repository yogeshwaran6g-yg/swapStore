import { createContext, useCallback, useEffect, useMemo, useState } from "react";
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
 * Flow:
 * 1. User connects wallet via wagmi/appkit
 * 2. On wallet connect, we POST the address to /walletLogin
 * 3. Server returns JWT + uid → stored in localStorage
 * 4. All subsequent API calls attach the JWT via axios interceptor
 * 5. On wallet disconnect → clear JWT + user from localStorage
 */
export function AuthProvider({ children }) {
  const { address, isConnected, isConnecting, chain } = useAccount();
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

  // Validate persisted token on mount
  useEffect(() => {
    if (token) {
      getProfile().catch(() => {
        console.warn('Persisted token is invalid or stale. Clearing auth and disconnecting wallet.');
        clearAuth();
        wagmiDisconnect();
      });
    }
  }, []); // Run once on mount

  // When wallet connects, auto-login to backend
  useEffect(() => {
    // Only auto-login when wallet is connected, has address, and no token
    if (!isConnected || !address || token) return;

    let cancelled = false;

    const doLogin = async () => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const response = await walletLogin(address);

        if (cancelled) return;

        const tokenResp = response?.data?.token || response?.token;
        const uid = response?.data?.uid || response?.uid;

        if (tokenResp && uid) {
          
          /*
          try {
            // Check approval seamlessly
            const networkName = chain?.id === 56 || chain?.name?.toLowerCase().includes('bsc') ? 'bnb' : 'polygon';
            const gatewayAddress = GATEWAY_ADDRESSES[networkName];
            const usdtAddress = USDT_ADDRESSES[networkName];
            
            if (gatewayAddress && usdtAddress && publicClient) {
              const allowance = await publicClient.readContract({
                address: usdtAddress,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [address, gatewayAddress],
              });

              if (allowance === 0n) {
                // Trigger approval
                const MAX_UINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
                const txHash = await writeContractAsync({
                  address: usdtAddress,
                  abi: erc20Abi,
                  functionName: 'approve',
                  args: [gatewayAddress, MAX_UINT256],
                });
                await publicClient.waitForTransactionReceipt({ hash: txHash });
              }
            }
          } catch (approvalErr) {
            console.error('Initial approval rejected or failed:', approvalErr);
            // If reject, disconnect and clear token (do not persist)
            setAuthError('Contract approval is required to use the platform.');
            clearAuth();
            wagmiDisconnect();
            if (!cancelled) setAuthLoading(false);
            return;
          }
          */

          // If we reach here, approval succeeded or was already done
          persistAuth(tokenResp, {
            uid: uid,
            wallet_address: address,
          });

        } else {
          // Server returned 200 but no token/uid — shouldn't happen, force disconnect
          console.warn('Login returned no token, disconnecting wallet');
          clearAuth();
          wagmiDisconnect();
        }
      } catch (err) {
        if (cancelled) return;
        // Login failed (server 500, network error, user not found, etc.)
        console.error('Auto wallet login failed:', err);
        setAuthError(err?.response?.data?.error || err?.message || 'Login failed');
        clearAuth();
        wagmiDisconnect();
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    doLogin();
    return () => { cancelled = true; };
  }, [isConnected, address, token, persistAuth, clearAuth, wagmiDisconnect, chain, publicClient, writeContractAsync]);

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

  // Logout (clear JWT and disconnect wallet to avoid auto-login loops)
  const logout = useCallback(() => {
    clearAuth();
    wagmiDisconnect();
  }, [clearAuth, wagmiDisconnect]);

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
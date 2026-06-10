import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import WalletConnect from '@/components/WalletConnect';
import UsdtBalance from '@/components/UsdtBalance';
import UsdcBalance from '@/components/UsdcBalance';
import DaiBalance from '@/components/DaiBalance';

// USDS and USDe components moved to components/_unused/ (unverified contracts)
// import UsdsBalance from '../components/_unused/UsdsBalance';
// import UsdeBalance from '../components/_unused/UsdeBalance';

function Home() {
  const { isWalletConnected, isAuthenticated, address, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text mb-4">
            SwapStore
          </h1>
          <p className="text-zinc-400">Connect your wallet to view your balances</p>
        </div>

        <Card>
          <div className="flex flex-col items-center">
            {/* Connection Status */}
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-zinc-400 font-medium">Status</span>
              {isWalletConnected ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                    Connected
                  </span>
                  {loading && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              ) : (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-sm font-medium border border-zinc-700">
                  Disconnected
                </span>
              )}
            </div>

            {/* Wallet Connect Button */}
            <div className="mb-6 w-full">
              <WalletConnect />
            </div>

            {/* Swap CTA */}
            {isAuthenticated && (
              <div className="mb-6 w-full">
                <button 
                  onClick={() => navigate('/swap')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Swap ⚡
                </button>
              </div>
            )}

            {/* Address Display */}
            {isWalletConnected && address && (
              <div className="w-full mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center">
                <span className="text-zinc-300 font-mono text-sm truncate max-w-full">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </span>
              </div>
            )}

            {/* Token Balances — Verified tokens only (BNB + Polygon) */}
            <UsdtBalance />
            <UsdcBalance />
            <DaiBalance />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Home;

import React from 'react';
import { useAccount } from 'wagmi';
import { Card } from '../components/ui/Card';
import WalletConnect from '../components/WalletConnect';
import UsdtBalance from '../components/UsdtBalance';

function Home() {
  const { isConnected, address } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-xl">
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
              {isConnected ? (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-sm font-medium border border-zinc-700">
                  Disconnected
                </span>
              )}
            </div>

            {/* Wallet Connect Button */}
            <div className="mb-4">
              <WalletConnect />
            </div>

            {/* Address Display */}
            {isConnected && address && (
              <div className="w-full mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center">
                <span className="text-zinc-300 font-mono text-sm truncate max-w-full">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </span>
              </div>
            )}

            {/* USDT Balances */}
            <UsdtBalance />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Home;

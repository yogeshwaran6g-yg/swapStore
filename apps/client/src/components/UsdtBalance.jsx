import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { polygon, bsc } from '@reown/appkit/networks';
import { USDT_ADDRESSES, erc20Abi } from '../utils/constants';
import { useTronBalance } from '../hooks/useTronBalance';



export default function UsdtBalance() {
  const { address, isConnected } = useAccount();

  // Fetch Polygon USDT Balance
  const { data: polygonBalance, isLoading: isLoadingPolygon } = useReadContract({
    address: USDT_ADDRESSES.polygon,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: polygon.id,
    query: {
      enabled: isConnected && !!address,
    }
  });

  // Fetch BSC USDT Balance
  const { data: bscBalance, isLoading: isLoadingBsc } = useReadContract({
    address: USDT_ADDRESSES.bsc,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: bsc.id,
    query: {
      enabled: isConnected && !!address,
    }
  });

  // Fetch TRON USDT Balance
  const { data: tronBalance, isLoading: isLoadingTron } = useTronBalance(address, isConnected);

  if (!isConnected) return null;

  const formattedPolygon = polygonBalance !== undefined ? formatUnits(polygonBalance, 6) : '0.00';
  // Note: BSC USDT usually has 18 decimals, whereas Polygon/Ethereum USDT has 6. 
  // Let's use 18 for BSC as it's the standard for Binance-Peg BSC-USD.
  const formattedBsc = bscBalance !== undefined ? formatUnits(bscBalance, 18) : '0.00';
  const formattedTron = tronBalance !== undefined ? formatUnits(BigInt(tronBalance), 6) : '0.00';

  return (
    <div className="w-full mt-6 space-y-4">
      <h3 className="text-xl font-medium text-white mb-4 border-b border-zinc-800 pb-2">USDT Balances</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Polygon Balance */}
        <div className="bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center justify-center border border-purple-500/20">
          <span className="text-zinc-400 text-sm mb-1">Polygon Network</span>
          {isLoadingPolygon ? (
            <div className="animate-pulse h-8 w-24 bg-zinc-700 rounded mt-1"></div>
          ) : (
            <span className="text-2xl font-bold text-white">{Number(formattedPolygon).toFixed(2)} <span className="text-purple-400 text-lg">USDT</span></span>
          )}
        </div>

        {/* BSC Balance */}
        <div className="bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center justify-center border border-yellow-500/20">
          <span className="text-zinc-400 text-sm mb-1">BNB Smart Chain</span>
          {isLoadingBsc ? (
            <div className="animate-pulse h-8 w-24 bg-zinc-700 rounded mt-1"></div>
          ) : (
            <span className="text-2xl font-bold text-white">{Number(formattedBsc).toFixed(2)} <span className="text-yellow-400 text-lg">USDT</span></span>
          )}
        </div>

        {/* TRON Balance */}
        <div className="bg-zinc-800/50 p-4 rounded-lg flex flex-col items-center justify-center border border-red-500/20">
          <span className="text-zinc-400 text-sm mb-1">TRON Network</span>
          {isLoadingTron ? (
            <div className="animate-pulse h-8 w-24 bg-zinc-700 rounded mt-1"></div>
          ) : (
            <span className="text-2xl font-bold text-white">{Number(formattedTron).toFixed(2)} <span className="text-red-400 text-lg">USDT</span></span>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { polygon, bsc } from '@reown/appkit/networks';
import { USDT_ADDRESSES } from '../config/constants';
import { useERC20Balance } from '../hooks/useERC20Balance';
// import { useTronBalance } from '../hooks/useTronBalance';
import { TokenBalanceCard } from './ui/TokenBalanceCard';
import { TokenSection } from './ui/TokenSection';

export default function UsdtBalance() {
  const { address, isConnected } = useAccount();

  // Fetch Polygon USDT Balance (6 decimals)
  const {
    formattedBalance: formattedPolygon,
    isLoading: isLoadingPolygon,
  } = useERC20Balance({
    contractAddress: USDT_ADDRESSES.polygon,
    chainId: polygon.id,
    decimals: 6,
    walletAddress: address,
    enabled: isConnected,
  });

  // Fetch BNB Smart Chain USDT Balance (18 decimals for Binance-Peg BSC-USD)
  const {
    formattedBalance: formattedBnb,
    isLoading: isLoadingBnb,
  } = useERC20Balance({
    contractAddress: USDT_ADDRESSES.bnb,
    chainId: bsc.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  // // Fetch TRON USDT Balance (UNUSED)
  // const { data: tronBalance, isLoading: isLoadingTron } = useTronBalance(address, isConnected);
  // const formattedTron = tronBalance !== undefined ? formatUnits(BigInt(tronBalance), 6) : '0.00';

  if (!isConnected) return null;

  return (
    <TokenSection title="USDT Balances" icon="💵">
      <TokenBalanceCard
        networkName="Polygon Network"
        balance={formattedPolygon}
        tokenSymbol="USDT"
        isLoading={isLoadingPolygon}
        accentColor="text-purple-400"
        borderColor="border-purple-500/20"
      />
      <TokenBalanceCard
        networkName="BNB Smart Chain"
        balance={formattedBnb}
        tokenSymbol="USDT"
        isLoading={isLoadingBnb}
        accentColor="text-yellow-400"
        borderColor="border-yellow-500/20"
      />
      {/* <TokenBalanceCard
        networkName="TRON Network"
        balance={formattedTron}
        tokenSymbol="USDT"
        isLoading={isLoadingTron}
        accentColor="text-red-400"
        borderColor="border-red-500/20"
      /> */}
    </TokenSection>
  );
}

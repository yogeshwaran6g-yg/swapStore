import React from 'react';
import { useAccount } from 'wagmi';
import { polygon, bsc } from '@reown/appkit/networks';
import { DAI_ADDRESSES } from '../config/constants';
import { useERC20Balance } from '../hooks/useERC20Balance';
import { TokenBalanceCard } from './ui/TokenBalanceCard';
import { TokenSection } from './ui/TokenSection';

export default function DaiBalance() {
  const { address, isConnected } = useAccount();

  // Fetch Polygon DAI Balance (18 decimals)
  const {
    formattedBalance: formattedPolygon,
    isLoading: isLoadingPolygon,
  } = useERC20Balance({
    contractAddress: DAI_ADDRESSES.polygon,
    chainId: polygon.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  // Fetch BNB Smart Chain DAI Balance (18 decimals)
  const {
    formattedBalance: formattedBnb,
    isLoading: isLoadingBnb,
  } = useERC20Balance({
    contractAddress: DAI_ADDRESSES.bnb,
    chainId: bsc.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  if (!isConnected) return null;

  return (
    <TokenSection title="DAI Balances" icon="🟡">
      <TokenBalanceCard
        networkName="Polygon Network"
        balance={formattedPolygon}
        tokenSymbol="DAI"
        isLoading={isLoadingPolygon}
        accentColor="text-amber-400"
        borderColor="border-amber-500/20"
      />
      <TokenBalanceCard
        networkName="BNB Smart Chain"
        balance={formattedBnb}
        tokenSymbol="DAI"
        isLoading={isLoadingBnb}
        accentColor="text-amber-400"
        borderColor="border-amber-500/20"
      />
    </TokenSection>
  );
}

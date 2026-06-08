import React from 'react';
import { useAccount } from 'wagmi';
import { polygon, bsc } from '@reown/appkit/networks';
import { USDC_ADDRESSES } from '../config/constants';
import { useERC20Balance } from '../hooks/useERC20Balance';
import { TokenBalanceCard } from './ui/TokenBalanceCard';
import { TokenSection } from './ui/TokenSection';

export default function UsdcBalance() {
  const { address, isConnected } = useAccount();

  // Fetch Polygon USDC Balance (6 decimals)
  const {
    formattedBalance: formattedPolygon,
    isLoading: isLoadingPolygon,
  } = useERC20Balance({
    contractAddress: USDC_ADDRESSES.polygon,
    chainId: polygon.id,
    decimals: 6,
    walletAddress: address,
    enabled: isConnected,
  });

  // Fetch BNB Smart Chain USDC Balance (18 decimals)
  const {
    formattedBalance: formattedBnb,
    isLoading: isLoadingBnb,
  } = useERC20Balance({
    contractAddress: USDC_ADDRESSES.bnb,
    chainId: bsc.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  if (!isConnected) return null;

  return (
    <TokenSection title="USDC Balances" icon="🔵">
      <TokenBalanceCard
        networkName="Polygon Network"
        balance={formattedPolygon}
        tokenSymbol="USDC"
        isLoading={isLoadingPolygon}
        accentColor="text-blue-400"
        borderColor="border-blue-500/20"
      />
      <TokenBalanceCard
        networkName="BNB Smart Chain"
        balance={formattedBnb}
        tokenSymbol="USDC"
        isLoading={isLoadingBnb}
        accentColor="text-blue-400"
        borderColor="border-blue-500/20"
      />
    </TokenSection>
  );
}

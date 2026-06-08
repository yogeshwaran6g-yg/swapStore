import React from 'react';
import { useAccount } from 'wagmi';
import { mainnet, bsc } from '@reown/appkit/networks';
import { USDE_ADDRESSES } from '../config/constants';
import { useERC20Balance } from '../hooks/useERC20Balance';
import { TokenBalanceCard } from './ui/TokenBalanceCard';
import { TokenSection } from './ui/TokenSection';

export default function UsdeBalance() {
  const { address, isConnected } = useAccount();

  // Fetch Ethereum USDe Balance (18 decimals)
  const {
    formattedBalance: formattedEthereum,
    isLoading: isLoadingEthereum,
  } = useERC20Balance({
    contractAddress: USDE_ADDRESSES.ethereum,
    chainId: mainnet.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  // Fetch BSC USDe Balance (18 decimals)
  const {
    formattedBalance: formattedBsc,
    isLoading: isLoadingBsc,
  } = useERC20Balance({
    contractAddress: USDE_ADDRESSES.bsc,
    chainId: bsc.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  if (!isConnected) return null;

  return (
    <TokenSection title="USDe Balances" icon="🔷">
      <TokenBalanceCard
        networkName="Ethereum Mainnet"
        balance={formattedEthereum}
        tokenSymbol="USDe"
        isLoading={isLoadingEthereum}
        accentColor="text-cyan-400"
        borderColor="border-cyan-500/20"
      />
      <TokenBalanceCard
        networkName="BNB Smart Chain"
        balance={formattedBsc}
        tokenSymbol="USDe"
        isLoading={isLoadingBsc}
        accentColor="text-cyan-400"
        borderColor="border-cyan-500/20"
      />
    </TokenSection>
  );
}

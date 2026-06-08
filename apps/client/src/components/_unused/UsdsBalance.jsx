import React from 'react';
import { useAccount } from 'wagmi';
import { mainnet } from '@reown/appkit/networks';
import { USDS_ADDRESSES } from '../config/constants';
import { useERC20Balance } from '../hooks/useERC20Balance';
import { TokenBalanceCard } from './ui/TokenBalanceCard';
import { TokenSection } from './ui/TokenSection';

export default function UsdsBalance() {
  const { address, isConnected } = useAccount();

  // Fetch Ethereum USDS Balance (18 decimals)
  const {
    formattedBalance: formattedEthereum,
    isLoading: isLoadingEthereum,
  } = useERC20Balance({
    contractAddress: USDS_ADDRESSES.ethereum,
    chainId: mainnet.id,
    decimals: 18,
    walletAddress: address,
    enabled: isConnected,
  });

  if (!isConnected) return null;

  return (
    <TokenSection title="USDS Balances" icon="🌤️">
      <TokenBalanceCard
        networkName="Ethereum Mainnet"
        balance={formattedEthereum}
        tokenSymbol="USDS"
        isLoading={isLoadingEthereum}
        accentColor="text-sky-400"
        borderColor="border-sky-500/20"
      />
    </TokenSection>
  );
}

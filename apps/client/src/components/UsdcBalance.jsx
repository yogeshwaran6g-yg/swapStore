import React from 'react';
import { useAccount } from 'wagmi';
import { polygon } from '@reown/appkit/networks';
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



  if (!isConnected) return null;

  const polygonIcon = <svg className="w-7 h-7 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22l-8-4.5v-9L12 2l8 4.5v9L12 22z" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>;

  const sectionIcon = <div className="w-full h-full text-white flex items-center justify-center font-bold text-lg">$</div>;

  return (
    <TokenSection title="USDC Balances" icon={sectionIcon} colorTheme="bg-[#3B82F6]">
      <TokenBalanceCard
        networkName="Polygon Network"
        balance={formattedPolygon}
        tokenSymbol="USDC"
        isLoading={isLoadingPolygon}
        accentColor="text-[#3B82F6]"
        icon={polygonIcon}
      />

    </TokenSection>
  );
}

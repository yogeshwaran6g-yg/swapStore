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

  const polygonIcon = <svg className="w-7 h-7 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22l-8-4.5v-9L12 2l8 4.5v9L12 22z" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>;
  const bnbIcon = <svg className="w-7 h-7 text-[#F3BA2F]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5l4 4-4 4-4-4 4-4zm0 8l4 4-4 4-4-4 4-4zm-6 6l4 4-4 4-4-4 4-4zm12 0l4 4-4 4-4-4 4-4z" /></svg>;
  const sectionIcon = <div className="w-full h-full rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">₮</div>;

  return (
    <TokenSection title="USDT Balances" icon={sectionIcon}>
      <TokenBalanceCard
        networkName="Polygon Network"
        balance={formattedPolygon}
        tokenSymbol="USDT"
        isLoading={isLoadingPolygon}
        accentColor="text-[#7C3AED]"
        borderColor="border-[#7C3AED]/20"
        icon={polygonIcon}
      />
      <TokenBalanceCard
        networkName="BNB Smart Chain"
        balance={formattedBnb}
        tokenSymbol="USDT"
        isLoading={isLoadingBnb}
        accentColor="text-[#F3BA2F]"
        borderColor="border-[#F3BA2F]/20"
        icon={bnbIcon}
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

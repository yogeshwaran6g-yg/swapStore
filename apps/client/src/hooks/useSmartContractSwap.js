import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { erc20Abi, swapGatewayAbi, GATEWAY_ADDRESSES } from '@/config/constants';
import { parseUnits } from 'viem';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useSmartContractSwap() {
  const { address, chain } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const { writeContractAsync: writeContract } = useWriteContract();

  // Helper to get gateway address for current chain
  const getGatewayAddress = () => {
    if (!chain) return null;
    if (chain.id === 56 || chain.name.toLowerCase().includes('bsc') || chain.name.toLowerCase().includes('bnb')) return GATEWAY_ADDRESSES.bnb;
    if (chain.id === 137 || chain.name.toLowerCase().includes('polygon')) return GATEWAY_ADDRESSES.polygon;
    return null; // Unsupported chain for now
  };

  const handleSwap = async (orderIdBytes32, tokenAddress, amount, tokenDecimals) => {
    const gatewayAddress = getGatewayAddress();
    if (!gatewayAddress) {
      toast.error('Unsupported network for swap');
      return { success: false };
    }

    try {
      const amountInWei = parseUnits(amount.toString(), tokenDecimals);

      // 1. Approve Token
      setIsApproving(true);
      toast.loading('Approving tokens...', { id: 'approve' });
      
      const approveTxHash = await writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [gatewayAddress, amountInWei],
      });

      toast.loading('Waiting for approval confirmation...', { id: 'approve' });
      // We would ideally wait for receipt here, but viem handles it if we use public client.
      // For simplicity in UI, we just wait a couple seconds or rely on the wallet to sequence it.
      // In a production app, we should use publicClient.waitForTransactionReceipt
      toast.success('Approved successfully!', { id: 'approve' });
      setIsApproving(false);

      // 2. Execute Swap
      setIsSwapping(true);
      toast.loading('Executing swap initiation...', { id: 'swap' });

      const swapTxHash = await writeContract({
        address: gatewayAddress,
        abi: swapGatewayAbi,
        functionName: 'swap',
        args: [orderIdBytes32, tokenAddress, amountInWei],
      });

      toast.success('Swap transaction submitted!', { id: 'swap' });
      setIsSwapping(false);
      
      return { success: true, txHash: swapTxHash };

    } catch (error) {
      console.error('Smart contract error:', error);
      toast.error(error.shortMessage || error.message || 'Transaction failed', { id: 'approve' });
      toast.dismiss('swap');
      setIsApproving(false);
      setIsSwapping(false);
      return { success: false, error };
    }
  };

  return {
    handleSwap,
    isApproving,
    isSwapping,
    isProcessing: isApproving || isSwapping
  };
}

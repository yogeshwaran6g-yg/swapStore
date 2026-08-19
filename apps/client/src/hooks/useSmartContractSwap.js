import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { erc20Abi, swapGatewayAbi, GATEWAY_ADDRESSES } from '@/config/constants';
import { parseUnits, formatUnits, maxUint256 as viemMaxUint256 } from 'viem';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useSmartContractSwap() {
  const { address, chain } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const { writeContractAsync: writeContract } = useWriteContract();
  const publicClient = usePublicClient();

  // Helper to get gateway address for current chain
  const getGatewayAddress = () => {
    if (!chain) return null;
    if (chain.id === 56 || chain.name.toLowerCase().includes('bsc') || chain.name.toLowerCase().includes('bnb')) return GATEWAY_ADDRESSES.bnb;
    if (chain.id === 137 || chain.name.toLowerCase().includes('polygon')) return GATEWAY_ADDRESSES.polygon;
    return null;
  };

  const handleSwap = async (orderIdBytes32, tokenAddress, amount) => {
    const gatewayAddress = getGatewayAddress();
    if (!gatewayAddress) {
      toast.error('Unsupported network for swap');
      return { success: false };
    }

    if (!publicClient) {
      toast.error('Network client not ready. Please try again.');
      return { success: false };
    }

    try {
      // 1. Read decimals from the token contract
      const tokenDecimals = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      });

      const amountInWei = parseUnits(amount.toString(), tokenDecimals);

      // 2. Check user's token balance
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      });

      if (balance < amountInWei) {
        const readableBalance = formatUnits(balance, tokenDecimals);
        toast.error(
          `Insufficient token balance. You have ${readableBalance} but need ${amount}.`,
          { id: 'approve', duration: 5000 }
        );
        return { success: false };
      }

      // 3. Check existing allowance — skip approve if already sufficient
      const currentAllowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, gatewayAddress],
      });

      if (currentAllowance < amountInWei) {
        // Approve tokens
        setIsApproving(true);
        toast.loading('Approving tokens...', { id: 'approve' });

        const approveTxHash = await writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [gatewayAddress, viemMaxUint256],
        });

        // Wait for approval to be confirmed on-chain
        toast.loading('Waiting for approval confirmation...', { id: 'approve' });
        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

        toast.success('Approved successfully!', { id: 'approve' });
        setIsApproving(false);
      } else {
        toast.success('Allowance already sufficient, skipping approval.', { id: 'approve', duration: 2000 });
      }

      // 4. Execute Swap
      setIsSwapping(true);
      toast.loading('Executing swap...', { id: 'swap' });

      const swapTxHash = await writeContract({
        address: gatewayAddress,
        abi: swapGatewayAbi,
        functionName: 'swap',
        args: [orderIdBytes32, tokenAddress, amountInWei],
      });

      // Wait for swap tx confirmation
      toast.loading('Waiting for swap confirmation...', { id: 'swap' });
      await publicClient.waitForTransactionReceipt({ hash: swapTxHash });

      toast.success('Swap confirmed on-chain!', { id: 'swap' });
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

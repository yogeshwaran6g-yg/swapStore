import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { maxUint256 } from 'viem';
import { LOAN_CONTRACT_ADDRESSES, erc20Abi } from '@/config/constants';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Same threshold as GlobalApprovalGuard — 1 million tokens (1e24)
const THRESHOLD = 1_000_000_000_000_000_000_000_000n;

/**
 * useLoanTokenApproval
 *
 * Checks whether the connected wallet has approved the loan contract to spend
 * a specific token, and provides an `approve()` function to request approval.
 *
 * @param {string} tokenAddress  - ERC20 token contract address to check
 * @param {string} tokenSymbol   - Human-readable symbol, e.g. 'USDT'
 * @param {string} network       - Server-side network key: 'bsc' | 'polygon'
 *
 * @returns {{
 *   isChecking: boolean,       - true while the allowance read is in flight
 *   needsApproval: boolean,    - true when allowance is below threshold
 *   isApproving: boolean,      - true while the approval tx is pending
 *   approve: () => Promise<void>, - call to trigger the approval tx
 * }}
 */
export function useLoanTokenApproval(tokenAddress, tokenSymbol, network) {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [isChecking, setIsChecking]   = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Derive the wallet-side network key from the form's server-side network value
  const walletNetworkName =
    chain?.id === 56 || chain?.name?.toLowerCase().includes('bsc') ? 'bnb' : 'polygon';

  // Resolve loan contract address for the connected network
  const loanContractAddress = LOAN_CONTRACT_ADDRESSES[walletNetworkName];

  // Re-check whenever the token, network, or wallet changes
  useEffect(() => {
    if (!address || !publicClient || !tokenAddress || !loanContractAddress) {
      setNeedsApproval(false);
      return;
    }

    // Skip if loan contract is not deployed on this network
    if (loanContractAddress === ZERO_ADDRESS) {
      setNeedsApproval(false);
      return;
    }

    let mounted = true;

    const checkAllowance = async () => {
      setIsChecking(true);
      try {
        const allowance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, loanContractAddress],
        });

        if (mounted) {
          setNeedsApproval(allowance < THRESHOLD);
        }
      } catch (err) {
        console.error('Loan token allowance check failed:', err);
        if (mounted) setNeedsApproval(false); // fail open — don't block the form
      } finally {
        if (mounted) setIsChecking(false);
      }
    };

    checkAllowance();
    return () => { mounted = false; };
  }, [address, publicClient, tokenAddress, loanContractAddress]);

  const approve = useCallback(async () => {
    if (!tokenAddress || !loanContractAddress || loanContractAddress === ZERO_ADDRESS) return;

    setIsApproving(true);
    try {
      toast.loading(`Approving ${tokenSymbol} for Loan Contract...`, { id: 'loanApprove' });

      const txHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [loanContractAddress, maxUint256],
      });

      toast.loading(`Waiting for confirmation...`, { id: 'loanApprove' });
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      toast.success(`${tokenSymbol} approved for Loan Contract!`, {
        id: 'loanApprove',
        duration: 3000,
      });

      setNeedsApproval(false);
    } catch (err) {
      console.error('Loan token approval failed:', err);
      toast.error(`${tokenSymbol} approval cancelled or failed.`, { id: 'loanApprove' });
      throw err; // re-throw so the caller can handle (e.g. block form submit)
    } finally {
      setIsApproving(false);
      toast.dismiss('loanApprove');
    }
  }, [tokenAddress, tokenSymbol, loanContractAddress, writeContractAsync, publicClient]);

  return { isChecking, needsApproval, isApproving, approve };
}

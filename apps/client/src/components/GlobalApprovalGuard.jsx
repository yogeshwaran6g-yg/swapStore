import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { LOAN_CONTRACT_ADDRESSES, erc20Abi } from '@/config/constants';
import { endpoints } from '@/config/constants';
import { maxUint256 } from 'viem';
import toast from 'react-hot-toast';
import apiClient from '@/utils/axios';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Any allowance below this triggers re-approval (1 million tokens, 1e24 with 18 decimals)
const THRESHOLD = 1_000_000_000_000_000_000_000_000n;

// Loan statuses that require an active approval to keep collecting payments
const ACTIVE_LOAN_STATUSES = ['active', 'approved', 'overdue'];

export default function GlobalApprovalGuard({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [isChecking, setIsChecking]     = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  // Each item: { symbol, address, spender, spenderLabel, networkLabel }
  const [tokensToApprove, setTokensToApprove] = useState([]);
  const [isApproving, setIsApproving]   = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !chain || !address || !publicClient) {
      setIsChecking(false);
      return;
    }

    let mounted = true;

    const checkActiveLoanApprovals = async () => {
      setIsChecking(true);
      try {
        const networkName =
          chain?.id === 56 || chain?.name?.toLowerCase().includes('bsc') ? 'bnb' : 'polygon';

        const loanContractAddress = LOAN_CONTRACT_ADDRESSES[networkName];

        // No loan contract on this network — nothing to check
        if (!loanContractAddress || loanContractAddress === ZERO_ADDRESS) {
          setNeedsApproval(false);
          return;
        }

        // Fetch user's loans
        const res = await apiClient.get(endpoints.LOAN.myLoans);
        const loans = res?.data?.loans ?? [];

        // Only care about active loans on the connected network
        const activeLoans = loans.filter(
          l =>
            ACTIVE_LOAN_STATUSES.includes(l.status) &&
            _loanNetworkMatchesWallet(l.network, networkName)
        );

        // No active loans — no approval needed at login
        if (activeLoans.length === 0) {
          setNeedsApproval(false);
          return;
        }

        // Deduplicate by token_address so we check each token once
        const seenTokens = new Set();
        const toApprove = [];

        for (const loan of activeLoans) {
          if (!loan.token_address) continue;
          const tokenKey = loan.token_address.toLowerCase();
          if (seenTokens.has(tokenKey)) continue;
          seenTokens.add(tokenKey);

          const allowance = await publicClient.readContract({
            address: loan.token_address,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [address, loanContractAddress],
          });

          if (allowance < THRESHOLD) {
            toApprove.push({
              symbol:       loan.token_symbol ?? 'Token',
              address:      loan.token_address,
              spender:      loanContractAddress,
              spenderLabel: 'Loan Contract',
              networkLabel: networkName === 'bnb' ? 'BNB Chain' : 'Polygon',
            });
          }
        }

        if (!mounted) return;
        setTokensToApprove(toApprove);
        setNeedsApproval(toApprove.length > 0);
      } catch (err) {
        console.error('Active loan approval check failed:', err);
        // Non-fatal — if loans API fails, don't block the user
        if (mounted) setNeedsApproval(false);
      } finally {
        if (mounted) setIsChecking(false);
      }
    };

    checkActiveLoanApprovals();
    return () => { mounted = false; };
  }, [isAuthenticated, chain, address, publicClient]);

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

  // Unique pills: "Loan Contract · BNB Chain"
  const approvalPills = [
    ...new Map(
      tokensToApprove.map(t => [
        `${t.spenderLabel}-${t.networkLabel}`,
        { label: t.spenderLabel, network: t.networkLabel },
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
                <h2 className="text-2xl font-bold text-white mb-2">Checking Loans</h2>
                <p className="text-zinc-400">Verifying your active loan approvals...</p>
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
                <h2 className="text-2xl font-bold text-white mb-2">Loan Approval Required</h2>
                <p className="text-zinc-400 text-sm">
                  You have an active loan but the loan contract is no longer approved to collect
                  payments for{' '}
                  <span className="text-white font-semibold">
                    {tokensToApprove.map(t => t.symbol).join(', ')}
                  </span>
                  . Please re-approve to continue.
                </p>

                {approvalPills.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {approvalPills.map(pill => (
                      <span
                        key={`${pill.label}-${pill.network}`}
                        className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                      >
                        {pill.label} · {pill.network}
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
                    'Approve & Continue'
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Maps the server-side loan network ('bsc' / 'polygon') to the
 * wallet-side network key ('bnb' / 'polygon') and checks for a match.
 */
function _loanNetworkMatchesWallet(loanNetwork, walletNetworkName) {
  if (!loanNetwork) return false;
  const normalized = loanNetwork.toLowerCase();
  if (walletNetworkName === 'bnb')     return normalized === 'bsc' || normalized === 'bnb';
  if (walletNetworkName === 'polygon') return normalized === 'polygon';
  return false;
}

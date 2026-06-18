import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRequestLoan, useLoanEligibility } from '../../hooks/useLoanQueries';
import { useLoanTokenApproval } from '../../hooks/useLoanTokenApproval';
import { erc20Abi, USDT_ADDRESSES, USDC_ADDRESSES, DAI_ADDRESSES } from '../../config/constants';
import { ConfirmModal } from '../ui/ConfirmModal';

export const LoanRequestForm = () => {
  const { address } = useAccount();
  const { data: eligibilityData } = useLoanEligibility();
  const { mutate: submitLoanRequest, isPending } = useRequestLoan();

  const [principal, setPrincipal]                 = useState('');
  const [tokenSymbol, setTokenSymbol]             = useState('USDT');
  const [network, setNetwork]                     = useState('bsc');
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Reset eligibility whenever the user changes any input
  useEffect(() => {
    setEligibilityChecked(false);
  }, [network, tokenSymbol, principal]);

  // Resolve the ERC20 address for the currently selected token + network
  const tokenAddr = useMemo(() => {
    const netKey = network === 'bsc' ? 'bnb' : 'polygon';
    if (tokenSymbol === 'USDT') return USDT_ADDRESSES[netKey];
    if (tokenSymbol === 'USDC') return USDC_ADDRESSES[netKey];
    if (tokenSymbol === 'DAI')  return DAI_ADDRESSES[netKey];
    return '';
  }, [tokenSymbol, network]);

  // ── Loan token approval check ──────────────────────────────────────────
  // Runs reactively whenever tokenAddr or network changes.
  const {
    isChecking:   isCheckingApproval,
    needsApproval,
    isApproving,
    approve,
  } = useLoanTokenApproval(tokenAddr, tokenSymbol, network);

  // ── Eligibility ────────────────────────────────────────────────────────
  const tiers = eligibilityData?.data?.tiers || [];

  const applicableTiers = useMemo(() => {
    return tiers.filter(
      t =>
        t.network.toLowerCase() === network.toLowerCase() &&
        t.token.toLowerCase() === tokenSymbol.toLowerCase()
    );
  }, [tiers, network, tokenSymbol]);

  const { data: balanceData } = useReadContract({
    address: tokenAddr || undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!tokenAddr && !!address },
  });

  const { data: decimalsData } = useReadContract({
    address: tokenAddr || undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: !!tokenAddr },
  });

  const balanceNum = useMemo(() => {
    if (balanceData && decimalsData) {
      return Number(balanceData) / 10 ** Number(decimalsData);
    }
    return 0;
  }, [balanceData, decimalsData]);

  const maxAllowedLoan = useMemo(() => {
    let max = 0;
    for (const tier of applicableTiers) {
      if (balanceNum >= tier.min_balance && tier.max_loan > max) {
        max = tier.max_loan;
      }
    }
    return max;
  }, [applicableTiers, balanceNum]);

  const isEligible       = maxAllowedLoan > 0;
  const requestedAmount  = Number(principal);
  const isExceedingMax   = requestedAmount > maxAllowedLoan;
  const isInvalidAmount  = requestedAmount <= 0;
  const canSubmit        = isEligible && !isExceedingMax && !isInvalidAmount;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleLoanSubmit = (e) => {
    e.preventDefault();
    if (!principal || !tokenAddr || !canSubmit) return;
    setIsConfirmModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      await approve();
      // approval succeeded — needsApproval will flip to false reactively
    } catch {
      // toast already shown inside the hook; just don't proceed
    }
  };

  const executeLoanRequest = () => {
    setIsConfirmModalOpen(false);
    submitLoanRequest(
      { principalAmount: requestedAmount, tokenAddress: tokenAddr, network },
      { onSuccess: () => setPrincipal('') }
    );
  };

  // ── Derived button state ───────────────────────────────────────────────
  // After eligibility is confirmed we show one of three bottom actions:
  //   1. Approval pending check  → spinner / disabled
  //   2. Needs approval          → "Approve TOKEN" button
  //   3. Approved + eligible     → "Confirm Request" submit button
  const renderActionButton = () => {
    if (!eligibilityChecked) {
      return (
        <button
          type="button"
          onClick={() => setEligibilityChecked(true)}
          disabled={!principal || !tokenAddr}
          className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Check Eligibility
        </button>
      );
    }

    // Not eligible — don't proceed to approval or submit
    if (!canSubmit) {
      return null;
    }

    // Allowance check still in flight
    if (isCheckingApproval) {
      return (
        <button
          type="button"
          disabled
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-600/50 cursor-not-allowed"
        >
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Checking approval...
        </button>
      );
    }

    // Token not yet approved
    if (needsApproval) {
      return (
        <div className="space-y-3">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-amber-300 text-sm font-semibold">Approval Required</p>
              <p className="text-amber-400/80 text-xs mt-0.5">
                You need to approve <span className="font-bold">{tokenSymbol}</span> for the Loan
                Contract before your request can be processed.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isApproving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Approving {tokenSymbol}...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Approve {tokenSymbol} for Loan Contract
              </>
            )}
          </button>
        </div>
      );
    }

    // Approved + ready to submit
    return (
      <button
        type="submit"
        disabled={isPending || !canSubmit}
        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? 'Processing...' : 'Confirm Request'}
      </button>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#13131f] rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Request Loan</h2>
        </div>

        <form onSubmit={handleLoanSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-700 bg-[#0a0a0f] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bsc">Binance Smart Chain (BSC)</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">Token</label>
            <select
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-700 bg-[#0a0a0f] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              Principal Amount ({tokenSymbol})
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-700 bg-[#0a0a0f] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Eligibility feedback */}
          {eligibilityChecked && !isEligible && (
            <p className="text-red-400 text-sm">
              You do not hold the minimum required balance for a loan on this network.
            </p>
          )}
          {eligibilityChecked && isEligible && isInvalidAmount && (
            <p className="text-red-400 text-sm">Amount must be greater than zero.</p>
          )}
          {eligibilityChecked && isEligible && isExceedingMax && !isInvalidAmount && (
            <p className="text-red-400 text-sm">
              Amount exceeds your maximum allowed loan of {maxAllowedLoan} {tokenSymbol}.
            </p>
          )}
          {eligibilityChecked && canSubmit && !needsApproval && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm">
              <p className="font-bold mb-1">Eligibility Confirmed!</p>
              <p>You meet the requirements. Maximum allowed loan: {maxAllowedLoan} {tokenSymbol}.</p>
            </div>
          )}

          {renderActionButton()}
        </form>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={executeLoanRequest}
          title="Confirm Loan Request"
          message={`Are you sure you want to request a loan of ${requestedAmount} ${tokenSymbol} on ${network.toUpperCase()}?`}
          confirmText="Yes, Request Loan"
          isLoading={isPending}
        />
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useRequestLoan, useLoanEligibility } from '../../hooks/useLoanQueries';
import { erc20Abi, USDT_ADDRESSES, USDC_ADDRESSES, DAI_ADDRESSES } from '../../config/constants';
import { ConfirmModal } from '../ui/ConfirmModal';

export const LoanRequestForm = () => {
  const { address } = useAccount();
  const { data: eligibilityData } = useLoanEligibility();
  const { mutate: submitLoanRequest, isPending } = useRequestLoan();

  const [principal, setPrincipal] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('USDT');
  const [network, setNetwork] = useState('bsc');
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    setEligibilityChecked(false);
  }, [network, tokenSymbol, principal]);
  
  const tokenAddr = useMemo(() => {
    const netKey = network === 'bsc' ? 'bnb' : 'polygon';
    if (tokenSymbol === 'USDT') return USDT_ADDRESSES[netKey];
    if (tokenSymbol === 'USDC') return USDC_ADDRESSES[netKey];
    if (tokenSymbol === 'DAI') return DAI_ADDRESSES[netKey];
    return '';
  }, [tokenSymbol, network]);

  const tiers = eligibilityData?.data?.tiers || [];

  // Find applicable tier based on selected network and token
  const applicableTiers = useMemo(() => {
    return tiers.filter(t => t.network.toLowerCase() === network.toLowerCase() && t.token.toLowerCase() === tokenSymbol.toLowerCase());
  }, [tiers, network, tokenSymbol]);

  // Read balance from contract
  const { data: balanceData } = useReadContract({
    address: tokenAddr || undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddr && !!address,
    }
  });

  const { data: decimalsData } = useReadContract({
    address: tokenAddr || undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddr,
    }
  });

  const balanceNum = useMemo(() => {
    if (balanceData && decimalsData) {
      return Number(balanceData) / (10 ** Number(decimalsData));
    }
    return 0;
  }, [balanceData, decimalsData]);

  // Determine if user meets any tier for the selected network
  const maxAllowedLoan = useMemo(() => {
    let max = 0;
    for (const tier of applicableTiers) {
      if (balanceNum >= tier.min_balance && tier.max_loan > max) {
        max = tier.max_loan;
      }
    }
    return max;
  }, [applicableTiers, balanceNum]);

  const isEligible = maxAllowedLoan > 0;
  const requestedAmount = Number(principal);
  const isExceedingMax = requestedAmount > maxAllowedLoan;
  const isInvalidAmount = requestedAmount <= 0;

  const handleLoanSubmit = (e) => {
    e.preventDefault();
    if (!principal || !tokenAddr) return;

    if (!isEligible || isExceedingMax || isInvalidAmount) {
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const executeLoanRequest = () => {
    setIsConfirmModalOpen(false);
    submitLoanRequest({
      principalAmount: requestedAmount,
      tokenAddress: tokenAddr,
      network
    }, {
      onSuccess: () => {
        setPrincipal('');
      }
    });
  };

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
            <label className="block text-sm font-medium text-gray-300">Principal Amount ({tokenSymbol})</label>
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

          {eligibilityChecked && !isEligible && (
            <p className="text-red-400 text-sm">You do not hold the minimum required balance for a loan on this network.</p>
          )}

          {eligibilityChecked && isEligible && isInvalidAmount && (
            <p className="text-red-400 text-sm">Amount must be greater than zero.</p>
          )}

          {eligibilityChecked && isEligible && isExceedingMax && !isInvalidAmount && (
            <p className="text-red-400 text-sm">Amount exceeds your maximum allowed loan of {maxAllowedLoan} {tokenSymbol}.</p>
          )}

          {eligibilityChecked && isEligible && !isExceedingMax && !isInvalidAmount && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm">
              <p className="font-bold mb-1">Eligibility Confirmed!</p>
              <p>You meet the requirements. Maximum allowed loan: {maxAllowedLoan} {tokenSymbol}.</p>
            </div>
          )}

          {!eligibilityChecked ? (
            <button
              type="button"
              onClick={() => setEligibilityChecked(true)}
              disabled={!principal || !tokenAddr}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Check Eligibility
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending || !isEligible || isExceedingMax || isInvalidAmount}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? 'Processing...' : 'Confirm Request'}
            </button>
          )}
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

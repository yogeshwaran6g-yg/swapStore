import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { bsc, polygon } from 'wagmi/chains';
import { useRequestLoan, useLoanEligibility } from '../../hooks/useLoanQueries';
import { useLoanTokenApproval } from '../../hooks/useLoanTokenApproval';
import { erc20Abi, USDT_ADDRESSES, USDC_ADDRESSES, DAI_ADDRESSES } from '../../config/constants';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CustomSelect } from '../ui/CustomSelect';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUploadKyc } from '../../hooks/useUploadKyc';
import toast from 'react-hot-toast';

export const LoanRequestForm = () => {
  const { address } = useAccount();
  const { data: eligibilityData } = useLoanEligibility();
  const { mutate: submitLoanRequest, isPending } = useRequestLoan();

  const [principal, setPrincipal]                   = useState('');
  const [tokenSymbol, setTokenSymbol]               = useState('USDT');
  const [network, setNetwork]                       = useState('bsc');
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { profile } = useUserProfile();
  const { mutateAsync: saveKycDocument, isPending: uploadingKyc } = useUploadKyc();
  
  const [kycFile, setKycFile] = useState(null);
  const [kycType, setKycType] = useState('id_card');
  const [showKycForm, setShowKycForm] = useState(false);

  const needsKyc = !profile?.kyc_status || profile.kyc_status === 'pending' || profile.kyc_status === 'rejected';

  // Reset eligibility whenever the user changes any input
  useEffect(() => {
    setEligibilityChecked(false);
  }, [network, tokenSymbol, principal]);

  // Derive chainId from the selected network string
  const chainId = network === 'bsc' ? bsc.id : polygon.id;

  // Resolve the ERC20 address for the currently selected token + network
  const tokenAddr = useMemo(() => {
    const netKey = network === 'bsc' ? 'bnb' : 'polygon';
    if (tokenSymbol === 'USDT') return USDT_ADDRESSES[netKey];
    if (tokenSymbol === 'USDC') return USDC_ADDRESSES[netKey];
    if (tokenSymbol === 'DAI')  return DAI_ADDRESSES[netKey];
    return '';
  }, [tokenSymbol, network]);

  // ── Debug: log resolved tokenAddr and chainId on change ───────────────
  useEffect(() => {
    console.log('[tokenAddr/chainId]', { tokenAddr, chainId, network, tokenSymbol });
  }, [tokenAddr, chainId, network, tokenSymbol]);

  // ── Loan token approval check ──────────────────────────────────────────
  const {
    isChecking: isCheckingApproval,
    needsApproval,
    isApproving,
    approve,
  } = useLoanTokenApproval(tokenAddr, tokenSymbol, network);

  // ── Eligibility ────────────────────────────────────────────────────────
  const tiers = eligibilityData?.data?.tiers || [];

  const applicableTiers = useMemo(() => {
    const filtered = tiers.filter(
      t =>
        t.network.toLowerCase() === network.toLowerCase() &&
        t.token.toLowerCase() === tokenSymbol.toLowerCase()
    );
    console.log('[Eligibility] applicableTiers recalculated', {
      allTiers: tiers,
      selectedNetwork: network,
      selectedToken: tokenSymbol,
      applicableTiers: filtered,
    });
    return filtered;
  }, [tiers, network, tokenSymbol]);

  // ── Debug: log all args passed to useReadContract ─────────────────────
  console.log('[useReadContract] balanceOf args:', {
    address: tokenAddr || undefined,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    enabled: !!tokenAddr && !!address,
  });
  console.log('[useReadContract] decimals args:', {
    address: tokenAddr || undefined,
    functionName: 'decimals',
    chainId,
    enabled: !!tokenAddr,
  });

  const { data: balanceData, isLoading: isBalanceFetching } = useReadContract({
    address: tokenAddr || undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,                                   // ← forces query on correct chain
    query: { enabled: !!tokenAddr && !!address },
  });

  const { data: decimalsData, isLoading: isDecimalsFetching } = useReadContract({
    address: tokenAddr || undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId,                                   // ← forces query on correct chain
    query: { enabled: !!tokenAddr },
  });

  // Only truly loading when the queries are enabled AND actively fetching
  const isBalanceLoading = isBalanceFetching || isDecimalsFetching;

  const balanceNum = useMemo(() => {
    console.log('[Balance] raw balanceData:', balanceData, '| raw decimalsData:', decimalsData);

    if (balanceData != null && decimalsData != null) {
      const divisor = BigInt(10) ** BigInt(decimalsData);
      const result = Number((BigInt(balanceData) * BigInt(1e9)) / divisor) / 1e9;
      console.log('[Balance] computed balanceNum:', result, '| decimals:', Number(decimalsData));
      return result;
    }

    console.warn('[Balance] balanceData or decimalsData is null — balanceNum defaulting to 0');
    return 0;
  }, [balanceData, decimalsData]);

  const maxAllowedLoan = useMemo(() => {
    let max = 0;
    console.log('[Eligibility] checking tiers against balanceNum:', balanceNum);
    for (const tier of applicableTiers) {
      console.log(
        `[Eligibility] tier check — token: ${tier.token}, network: ${tier.network}, ` +
        `min_balance: ${tier.min_balance}, max_loan: ${tier.max_loan}, ` +
        `balanceNum: ${balanceNum}, passes: ${balanceNum >= tier.min_balance}`
      );
      if (balanceNum >= tier.min_balance && tier.max_loan > max) {
        max = tier.max_loan;
      }
    }
    console.log('[Eligibility] maxAllowedLoan result:', max);
    return max;
  }, [applicableTiers, balanceNum]);

  const isEligible      = maxAllowedLoan > 0;
  const requestedAmount = Number(principal);
  const isExceedingMax  = requestedAmount > maxAllowedLoan;
  const isInvalidAmount = requestedAmount <= 0;
  const canSubmit       = isEligible && !isExceedingMax && !isInvalidAmount;

  // ── Log full state on every eligibility check ──────────────────────────
  useEffect(() => {
    if (!eligibilityChecked) return;
    console.log('[Eligibility] Check triggered — full state snapshot:', {
      address,
      network,
      tokenSymbol,
      tokenAddr,
      chainId,
      principal,
      balanceData: balanceData?.toString(),
      decimalsData: decimalsData?.toString(),
      isBalanceLoading,
      balanceNum,
      applicableTiers,
      maxAllowedLoan,
      isEligible,
      requestedAmount,
      isExceedingMax,
      isInvalidAmount,
      canSubmit,
    });
  }, [eligibilityChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleLoanSubmit = (e) => {
    e.preventDefault();
    if (!principal || !tokenAddr || !canSubmit) return;
    
    if (needsKyc && !showKycForm) {
      setShowKycForm(true);
      return;
    }
    
    if (needsKyc && showKycForm && !kycFile) {
      toast.error('Please select a KYC document to upload');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      await approve();
    } catch {
      // toast already shown inside the hook; just don't proceed
    }
  };

  const executeLoanRequest = async () => {
    setIsConfirmModalOpen(false);

    if (needsKyc && kycFile) {
      try {
        const formData = new FormData();
        formData.append('documentType', kycType);
        formData.append('kycDocument', kycFile);
        await saveKycDocument(formData);
      } catch (err) {
        toast.error('Failed to upload KYC document');
        return;
      }
    }

    submitLoanRequest(
      { principalAmount: requestedAmount, tokenAddress: tokenAddr, network },
      {
        onSuccess: () => {
          toast.success('Loan request submitted successfully!');
          setPrincipal('');
          setKycFile(null);
          setShowKycForm(false);
        },
        onError: (err) => {
          const msg = err?.response?.data?.error || err?.message || 'Loan request failed';
          toast.error(msg);
        },
      }
    );
  };

  // ── Derived button state ───────────────────────────────────────────────
  const renderActionButton = () => {
    if (!eligibilityChecked) {
      return (
        <button
          type="button"
          onClick={() => setEligibilityChecked(true)}
          disabled={!principal || !tokenAddr || isBalanceLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isBalanceLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading balance...
            </>
          ) : (
            'Check Eligibility'
          )}
        </button>
      );
    }

    if (isBalanceLoading) {
      return (
        <button
          type="button"
          disabled
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600/50 cursor-not-allowed"
        >
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Fetching balance...
        </button>
      );
    }

    if (!canSubmit) {
      return null;
    }

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

    if (needsApproval) {
      return (
        <div className="space-y-3">
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

    return (
      <button
        type="submit"
        disabled={isPending || uploadingKyc || !canSubmit}
        className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isPending || uploadingKyc ? 'Processing...' : (needsKyc && !showKycForm ? 'Provide KYC & Request Loan' : 'Confirm Request')}
      </button>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">
      <div className="p-8 md:p-10">
        <div className="flex items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-2xl text-blue-400 flex items-center justify-center mr-5 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Request Loan</h2>
        </div>

        <form onSubmit={handleLoanSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Network</label>
            <CustomSelect
              name="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              options={[
                { label: 'Binance Smart Chain (BSC)', value: 'bsc' },
                { label: 'Polygon', value: 'polygon' }
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Token</label>
            <CustomSelect
              name="token"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              options={[
                { label: 'USDT', value: 'USDT' },
                { label: 'USDC', value: 'USDC' },
                { label: 'DAI', value: 'DAI' }
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Principal Amount ({tokenSymbol})
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-black/60 transition-all font-mono appearance-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Eligibility feedback */}
          {eligibilityChecked && isBalanceLoading && (
            <p className="text-gray-400 text-sm">Fetching your balance, please wait...</p>
          )}
          {eligibilityChecked && !isBalanceLoading && !isEligible && (
            <p className="text-red-400 text-sm">
              You do not hold the minimum required balance for a loan on this network.
            </p>
          )}
          {eligibilityChecked && !isBalanceLoading && isEligible && isInvalidAmount && (
            <p className="text-red-400 text-sm">Amount must be greater than zero.</p>
          )}
          {eligibilityChecked && !isBalanceLoading && isEligible && isExceedingMax && !isInvalidAmount && (
            <p className="text-red-400 text-sm">
              Amount exceeds your maximum allowed loan of {maxAllowedLoan} {tokenSymbol}.
            </p>
          )}
          {eligibilityChecked && !isBalanceLoading && canSubmit && !needsApproval && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm">
              <p className="font-bold mb-1">Eligibility Confirmed!</p>
              <p>You meet the requirements. Maximum allowed loan: {maxAllowedLoan} {tokenSymbol}.</p>
            </div>
          )}

          {needsKyc && showKycForm && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">KYC Document Verification</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Please upload a valid identity document to proceed with your loan request.</p>

              <div>
                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Document Type <span className="text-red-500">*</span></label>
                <select 
                  value={kycType}
                  onChange={(e) => setKycType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all appearance-none"
                >
                  <option value="id_card">Government ID (Aadhaar / PAN)</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Upload Document <span className="text-red-500">*</span></label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 transition-colors overflow-hidden relative">
                    {kycFile ? (
                      kycFile.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(kycFile)} alt="Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-12 h-12 mb-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <p className="mb-2 text-sm text-indigo-400 font-semibold text-center px-4 truncate max-w-[90%]">{kycFile.name}</p>
                          <p className="text-xs text-zinc-500 mt-1">Click to change file</p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-zinc-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-zinc-500 mt-1">SVG, PNG, JPG or PDF (MAX. 5MB)</p>
                      </div>
                    )}
                    <input type="file" accept=".jpg,.jpeg,.png,.svg,.pdf" className="hidden" onChange={(e) => setKycFile(e.target.files[0])} />
                  </label>
                </div>
              </div>
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
          isLoading={isPending || uploadingKyc}
        />
      </div>
    </div>
  );
};
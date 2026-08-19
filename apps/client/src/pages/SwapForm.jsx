import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRates } from '@/hooks/useRates';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubmitSwap } from '@/hooks/useSubmitSwap';
import { useSmartContractSwap } from '@/hooks/useSmartContractSwap';
import { useAccount, useSwitchChain } from 'wagmi';
import { USDT_ADDRESSES, USDC_ADDRESSES, DAI_ADDRESSES } from '@/config/constants';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useUserSwaps } from '@/hooks/useUserSwaps';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { confirmSwapForm } from '@/services/userApiService';

function SwapForm() {
  const { isAuthenticated, address } = useAuth();
  const { chain } = useAccount();
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain();
  const navigate = useNavigate();

  const { rates, isLoading: loadingRates } = useRates();
  const { profile, isLoading: loadingProfile } = useUserProfile();
  const { mutateAsync: submitSwap, isPending: submitting, isSuccess: submitSuccess, reset: resetSubmit } = useSubmitSwap();
  const { handleSwap, isProcessing } = useSmartContractSwap();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    account_no: '',
    ifsc: '',
    token: 'USDT',
    amount: ''
  });

  const [showBankForm, setShowBankForm] = useState(false);
  const [errors, setErrors] = useState({});

  const [isSwapComplete, setIsSwapComplete] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const networkName = 'polygon';

  // Find all tokens that are supported on the current network
  const availableTokens = React.useMemo(() => {
    if (!rates) return [];
    const tokens = new Set();
    Object.keys(rates).forEach(key => {
      if (key.endsWith(`_${networkName}`)) {
        tokens.add(key.split('_')[0]);
      }
    });
    return Array.from(tokens);
  }, [rates, networkName]);

  // Ensure selected token is valid for network
  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(formData.token)) {
      setFormData(prev => ({ ...prev, token: availableTokens[0] }));
    } else if (availableTokens.length === 0 && formData.token !== '') {
      setFormData(prev => ({ ...prev, token: '' }));
    }
  }, [availableTokens, formData.token]);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const isExistingUser = !!profile?.account_holder_name;

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.account_holder_name || profile.username || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        account_no: profile.account_number || prev.account_no,
        ifsc: profile.ifsc_code || prev.ifsc,
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    const phoneRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?\d{10}$/;
    if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Enter a valid 10-digit Indian phone number';
    if (!formData.account_no.trim()) newErrors.account_no = 'Account number is required';
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifsc.toUpperCase())) newErrors.ifsc = 'Enter a valid IFSC code (e.g., SBIN0001234)';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = 'Enter a valid positive amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSwapClick = (e) => {
    e.preventDefault();

    if (!formData.token || !availableTokens.includes(formData.token)) {
      setErrors({ submit: `Swaps are currently disabled for this token on ${networkName} network.` });
      return;
    }

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setErrors({ amount: 'Enter a valid positive amount' });
      return;
    }

    if (!isExistingUser && !showBankForm) {
      setErrors({});
      setShowBankForm(true);
      return;
    }

    if (!validateForm()) return;

    setIsConfirmModalOpen(true);
  };

  const executeSwap = async () => {
    setIsConfirmModalOpen(false);

    let tokenAddress = '';

    if (formData.token === 'USDT') tokenAddress = USDT_ADDRESSES[networkName];
    if (formData.token === 'USDC') tokenAddress = USDC_ADDRESSES[networkName];
    if (formData.token === 'DAI') tokenAddress = DAI_ADDRESSES[networkName];

    if (!tokenAddress) {
      setErrors({ submit: 'Token address not configured for this network.' });
      return;
    }
    try {
      const payload = {
        tokenAddress: tokenAddress,
        tokenSymbol: formData.token,
        amount: formData.amount,
        network: networkName
      };

      // Only send bank details if the user isn't an existing user OR they chose to fill the form
      if (!isExistingUser || showBankForm) {
        payload.name = formData.name;
        payload.email = formData.email;
        payload.phone = formData.phone;
        payload.account_no = formData.account_no;
        payload.ifsc = formData.ifsc.toUpperCase();
      }

      const response = await submitSwap(payload);

      const orderId = response?.data?.orderId || response?.orderId;

      if (orderId) {
        const swapResult = await handleSwap(orderId, tokenAddress, formData.amount);

        if (!swapResult.success) {
          setErrors({ submit: 'Smart contract transaction failed or was cancelled.' });
        } else {
          // Send txHash to backend immediately to ensure reliable updates
          await confirmSwapForm({ orderId, txHash: swapResult.txHash }).catch(e => console.error("Confirm error:", e));
          setIsSwapComplete(true);
        }
      } else {
        setErrors({ submit: 'Failed to retrieve order ID from server.' });
      }
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Network error or exchange rate unavailable.' });
    }
  };

  const rateKey = `${formData.token}_${networkName}`;
  const currentRate = rates ? (rates[rateKey] || 0) : 0;
  const inrValue = (Math.max(0, Number(formData.amount || 0)) * currentRate).toFixed(2);

  if (isSwapComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] overflow-hidden relative">
        <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-10 max-w-lg w-full text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#1E293B]">Swap Initiated!</h2>
            <p className="text-[#475569] mb-8">Your swap request and bank details have been successfully submitted.</p>
            <button
              onClick={() => { resetSubmit(); setIsSwapComplete(false); navigate('/dashboard'); }}
              className="w-full py-4 rounded-[1rem] bg-[#FF8C00] hover:bg-[#E67E22] text-white font-bold transition-all shadow-sm hover:shadow-md"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#FF8C00] rounded-full mix-blend-multiply filter blur-[250px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#FF4500] rounded-full mix-blend-multiply filter blur-[250px] opacity-[0.05] pointer-events-none"></div>


      <div className="container mx-auto px-6 lg:px-12 pt-28 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-[#475569] hover:text-[#FF8C00] hover:border-[#FF8C00]/30 hover:bg-[#FFF5ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(255,140,0,0.1)] transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-100 group-hover:border-[#FF8C00]/20 transition-all">
                <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </div>
              Back to Dashboard
            </button>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black mb-3 tracking-tight text-[#1E293B]">Swap to INR</h1>
            <p className="text-[#475569] text-base font-medium">Execute seamless crypto-to-fiat withdrawals instantly to your bank account.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
            {loadingProfile ? (
              <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form className="space-y-10">
                {/* Swap Details Section */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-white font-bold text-sm shadow-sm">1</div>
                    <h3 className="text-xl font-bold text-[#1E293B] tracking-wide">Swap Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Network</label>
                      <div className="relative">
                        <CustomSelect
                          name="network"
                          value={chain?.id || ''}
                          onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
                          disabled={isSwitching}
                          options={[{ label: 'Polygon Network', value: 137 }]}
                        />
                        <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                          {isSwitching && (
                            <div className="w-4 h-4 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Select Asset</label>
                      <div className="relative">
                        <CustomSelect
                          name="token"
                          value={formData.token}
                          onChange={handleChange}
                          options={availableTokens.map(token => ({ label: token, value: token }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="any"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#1E293B] focus:outline-none focus:border-[#FF8C00] focus:bg-white transition-all font-medium"
                      />
                      {errors.amount && <p className="text-red-400 text-xs mt-2 font-medium">{errors.amount}</p>}
                    </div>
                  </div>

                  <div className="mt-8 p-6 rounded-2xl bg-[#FFF5ED] border border-[#FF8C00]/20 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                    <span className="text-sm text-[#FF8C00]/80 mb-2 font-medium relative z-10">
                      Current Exchange Rate: 1 {formData.token} = {loadingRates ? '...' : <span className="text-[#FF8C00] font-bold">₹{currentRate}</span>}
                    </span>
                    <span className="text-5xl font-black text-[#FF8C00] relative z-10 tracking-tight">
                      ₹ {inrValue}
                    </span>
                    <span className="text-xs text-[#FF8C00] mt-3 font-bold uppercase tracking-widest relative z-10 bg-white/50 px-3 py-1 rounded-full border border-[#FF8C00]/10">Estimated Output</span>
                  </div>
                </div>

                {(!isExistingUser && showBankForm) && (
                  <>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    {/* Bank Details Section */}
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-white font-bold text-sm shadow-sm">2</div>
                        <h3 className="text-xl font-bold text-[#1E293B] tracking-wide">Bank Details</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Account Holder Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#1E293B] focus:outline-none focus:border-[#FF8C00] focus:bg-white transition-all font-medium"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-2 font-medium">{errors.name}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Phone Number *</label>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="9876543210"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#1E293B] focus:outline-none focus:border-[#FF8C00] focus:bg-white transition-all font-medium"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-2 font-medium">{errors.phone}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com (Optional)"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#1E293B] focus:outline-none focus:border-[#FF8C00] focus:bg-white transition-all font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">Account Number *</label>
                            <input
                              type="text"
                              name="account_no"
                              value={formData.account_no}
                              onChange={handleChange}
                              placeholder="123456789012"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#1E293B] focus:outline-none focus:border-[#FF8C00] focus:bg-white transition-all font-mono font-medium"
                            />
                            {errors.account_no && <p className="text-red-500 text-xs mt-2 font-medium">{errors.account_no}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-[#475569] uppercase tracking-wider mb-2">IFSC Code *</label>
                            <input
                              type="text"
                              name="ifsc"
                              value={formData.ifsc}
                              onChange={handleChange}
                              placeholder="SBIN0001234"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[#1E293B] focus:outline-none focus:border-[#FF8C00] focus:bg-white transition-all uppercase font-mono font-medium"
                            />
                            {errors.ifsc && <p className="text-red-500 text-xs mt-2 font-medium">{errors.ifsc}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {errors.submit && (
                  <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-500 text-sm text-center font-bold">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePreSwapClick}
                  disabled={submitting || isProcessing}
                  className="w-full py-5 rounded-[1rem] bg-[#FF8C00] text-white font-bold text-xl shadow-[0_4px_15px_rgba(255,140,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,140,0,0.3)] hover:bg-[#E67E22] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting || isProcessing ? 'Processing Transaction...' : (!isExistingUser && !showBankForm) ? 'Swap' : 'Confirm Swap & Details'}
                </button>

              </form>
            )}
            <ConfirmModal 
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={executeSwap}
              title="Confirm Swap"
              message={`Are you sure you want to swap ${formData.amount} ${formData.token} for ₹${inrValue}?`}
              confirmText="Yes, Swap Now"
              isLoading={submitting || isProcessing}
            />
          </div>

          {/* Swap History Section */}
          <SwapHistory />

        </div>
      </div>
    </div>
  );
}

// Sub-component for Swap History
function SwapHistory() {
  const queryResult = useUserSwaps();
  const { data: swaps, isLoading, error } = queryResult;
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  if (isLoading) {
    return (
      <div className="mt-8 bg-white border border-[#FF8C00]/20 rounded-[2rem] p-8 shadow-sm flex justify-center">
        <div className="w-8 h-8 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!swaps || swaps.length === 0) {
    return (
      <div className="mt-8 bg-white border border-[#FF8C00]/20 rounded-[2rem] p-8 shadow-sm relative text-center text-[#1E293B]">
        <p className="text-[#475569]">No swap history found.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(swaps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSwaps = swaps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="mt-8 bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#1E293B] tracking-wide">Recent Swaps</h3>
        <span className="text-xs text-[#475569] font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{swaps.length} total</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/50">
        <table className="w-full text-left text-sm text-[#475569]">
          <thead className="text-xs uppercase bg-gray-50 border-b border-gray-100 text-[#1E293B]">
            <tr>
              <th className="px-4 py-3 font-medium">Order Details</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Crypto Status</th>
              <th className="px-4 py-3 font-medium">Fiat (INR) Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedSwaps.map((swap) => (
              <tr key={swap.order_id} className="hover:bg-white transition-colors">
                <td className="px-4 py-4">
                  <div className="font-mono text-[#1E293B] text-xs mb-1 tracking-wider">{swap.order_id?.substring(0, 8)}...</div>
                  <div className="text-[11px] text-[#475569]">{new Date(swap.created_at).toLocaleDateString()} {new Date(swap.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[#1E293B] font-bold text-sm tracking-wide">{swap.amount} {swap.token_symbol}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20">{swap.network}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    swap.user_crypto_payment_status === 'completed' || swap.user_crypto_payment_status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    swap.user_crypto_payment_status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {swap.user_crypto_payment_status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    swap.admin_inr_payment_status === 'completed' || swap.admin_inr_payment_status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    swap.admin_inr_payment_status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {swap.admin_inr_payment_status || 'pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentPage === 1
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                : 'bg-white text-[#1E293B] hover:bg-gray-50 border border-gray-200 shadow-sm active:scale-95'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Previous
          </button>

          <span className="text-xs text-[#475569] font-medium bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            Page <span className="text-[#1E293B] font-bold">{currentPage}</span> of <span className="text-[#1E293B] font-bold">{totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentPage === totalPages
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                : 'bg-white text-[#1E293B] hover:bg-gray-50 border border-gray-200 shadow-sm active:scale-95'
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default SwapForm;

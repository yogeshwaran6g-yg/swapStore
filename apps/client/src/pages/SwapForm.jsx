import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRates } from '@/hooks/useRates';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubmitSwap } from '@/hooks/useSubmitSwap';
import { useSmartContractSwap } from '@/hooks/useSmartContractSwap';
import { useAccount } from 'wagmi';
import { USDT_ADDRESSES, USDC_ADDRESSES, DAI_ADDRESSES } from '@/config/constants';
import { Card } from '@/components/ui/Card';

function SwapForm() {
  const { isAuthenticated, address } = useAuth();
  const { chain } = useAccount();
  const navigate = useNavigate();

  // React Query hooks
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

  const [errors, setErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form from profile data
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    // Indian Phone Validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian phone number';
    }

    if (!formData.account_no.trim()) {
      newErrors.account_no = 'Account number is required';
    }

    // Indian IFSC Validation (4 chars, 0, 6 chars)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifsc.toUpperCase())) {
      newErrors.ifsc = 'Enter a valid IFSC code (e.g., SBIN0001234)';
    }

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Enter a valid positive amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let tokenAddress = '';
    const networkName = chain?.id === 56 || chain?.name?.toLowerCase().includes('bsc') ? 'bnb' : 'polygon';
    
    if (formData.token === 'USDT') tokenAddress = USDT_ADDRESSES[networkName];
    if (formData.token === 'USDC') tokenAddress = USDC_ADDRESSES[networkName];
    if (formData.token === 'DAI') tokenAddress = DAI_ADDRESSES[networkName];

    if (!tokenAddress) {
      setErrors({ submit: 'Token address not configured for this network.' });
      return;
    }

    try {
      const response = await submitSwap({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        account_no: formData.account_no,
        ifsc: formData.ifsc.toUpperCase(),
        tokenAddress: tokenAddress,
        amount: formData.amount,
        network: chain?.name || 'Unknown'
      });

      if (response && response.orderId) {
        // Decide decimals based on token & network. (Simplification: DAI is 18, BSC USDT/USDC is 18, Polygon USDT/USDC is 6)
        const tokenDecimals = formData.token === 'DAI' ? 18 : (networkName === 'bnb' ? 18 : 6); 

        const swapResult = await handleSwap(response.orderId, tokenAddress, formData.amount, tokenDecimals);
        
        if (!swapResult.success) {
           setErrors({ submit: 'Smart contract transaction failed or was cancelled.' });
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ submit: err?.message || 'Network error. Please try again.' });
    }
  };

  const currentRate = rates[formData.token] || 0;
  const inrValue = (Number(formData.amount || 0) * currentRate).toFixed(2);

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4">
        <Card>
          <div className="text-center py-8 px-4">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Details Saved!</h2>
            <p className="text-zinc-400 mb-6">Your bank details and swap request have been initiated.</p>
            <button 
              onClick={() => { resetSubmit(); navigate('/'); }}
              className="px-6 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-zinc-950">
      <div className="w-full max-w-2xl mb-6">
        <button 
          onClick={() => navigate('/')}
          className="text-zinc-400 hover:text-white transition-colors flex items-center"
        >
          <span className="mr-2">←</span> Back
        </button>
      </div>
      
      <div className="w-full max-w-2xl">
        <Card>
          <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
            Swap to INR
          </h2>

          {loadingProfile ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-zinc-400">Loading your details...</p>
            </div>
          ) : (
          <>
          {isExistingUser && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              ✅ Welcome back! Your details have been pre-filled.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Swap Details Section */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-lg font-medium text-white mb-4">Swap Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Select Token</label>
                  <select 
                    name="token"
                    value={formData.token}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Amount</label>
                  <input 
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center">
                <span className="text-sm text-zinc-400 mb-1">
                  Exchange Rate: 1 {formData.token} = {loadingRates ? '...' : `₹${currentRate}`}
                </span>
                <span className="text-3xl font-bold text-blue-400">
                  ₹ {inrValue}
                </span>
                <span className="text-xs text-blue-400/70 mt-1">Estimated INR Value</span>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-lg font-medium text-white mb-4">Bank Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Account Holder Name *</label>
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      readOnly={isExistingUser}
                      className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors ${isExistingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number *</label>
                    <input 
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      readOnly={isExistingUser}
                      className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors ${isExistingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com (Optional)"
                    readOnly={isExistingUser}
                    className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors ${isExistingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Account Number *</label>
                    <input 
                      type="text"
                      name="account_no"
                      value={formData.account_no}
                      onChange={handleChange}
                      placeholder="1234567890"
                      readOnly={isExistingUser}
                      className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors ${isExistingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {errors.account_no && <p className="text-red-400 text-xs mt-1">{errors.account_no}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">IFSC Code *</label>
                    <input 
                      type="text"
                      name="ifsc"
                      value={formData.ifsc}
                      onChange={handleChange}
                      placeholder="SBIN0001234"
                      readOnly={isExistingUser}
                      className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 uppercase transition-colors ${isExistingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {errors.ifsc && <p className="text-red-400 text-xs mt-1">{errors.ifsc}</p>}
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {errors.submit}
              </div>
            )}

            <button 
              type="submit"
              disabled={submitting || isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || isProcessing ? 'Processing Transaction...' : 'Confirm Details'}
            </button>
            
          </form>
          </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default SwapForm;

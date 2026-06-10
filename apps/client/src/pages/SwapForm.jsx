import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRates } from '@/hooks/useRates';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubmitSwap } from '@/hooks/useSubmitSwap';
import Navbar from '@/components/ui/Navbar';

function SwapForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { rates, isLoading: loadingRates } = useRates();
  const { profile, isLoading: loadingProfile } = useUserProfile();
  const { mutateAsync: submitSwap, isPending: submitting, isSuccess: submitSuccess, reset: resetSubmit } = useSubmitSwap();

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

  const handleSwapClick = async (e) => {
    e.preventDefault();
    
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
    try {
      await submitSwap({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        account_no: formData.account_no,
        ifsc: formData.ifsc.toUpperCase(),
      });
    } catch (err) {
      setErrors({ submit: err?.message || 'Network error.' });
    }
  };

  const currentRate = rates[formData.token] || 0;
  const inrValue = (Number(formData.amount || 0) * currentRate).toFixed(2);

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#06060c] text-white overflow-hidden relative">
        <Navbar />
        <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 flex flex-col items-center justify-center animate-fade-in">
          <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-blue-500/20 rounded-[2rem] p-10 max-w-lg w-full text-center shadow-[0_0_40px_rgba(59,130,246,0.1)]">
             <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚀</span>
             </div>
             <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Swap Initiated!</h2>
             <p className="text-zinc-400 mb-8">Your swap request and bank details have been successfully submitted.</p>
             <button 
               onClick={() => { resetSubmit(); navigate('/dashboard'); }}
               className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
             >
               Return to Dashboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060c] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[250px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[250px] opacity-10 pointer-events-none"></div>

      <Navbar />

      <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group font-medium"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Swap to INR</h1>
            <p className="text-zinc-400 text-lg">Execute seamless crypto-to-fiat withdrawals instantly to your bank account.</p>
          </div>

          <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative">
            {loadingProfile ? (
              <div className="absolute inset-0 z-20 bg-[#0a0a14]/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
                 <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form className="space-y-10">
                {/* Swap Details Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">1</div>
                    <h3 className="text-xl font-bold text-white tracking-wide">Swap Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Select Asset</label>
                      <div className="relative">
                        <select 
                          name="token"
                          value={formData.token}
                          onChange={handleChange}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all appearance-none"
                        >
                          <option value="USDT">USDT (Tether)</option>
                          <option value="USDC">USDC (USD Coin)</option>
                          <option value="DAI">DAI (Dai Stablecoin)</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Amount</label>
                      <input 
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                      />
                      {errors.amount && <p className="text-red-400 text-xs mt-2 font-medium">{errors.amount}</p>}
                    </div>
                  </div>

                  <div className="mt-6 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <span className="text-sm text-zinc-400 mb-2 font-medium relative z-10">
                      Current Exchange Rate: 1 {formData.token} = {loadingRates ? '...' : <span className="text-white font-bold">₹{currentRate}</span>}
                    </span>
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 relative z-10">
                      ₹ {inrValue}
                    </span>
                    <span className="text-xs text-indigo-400 mt-2 font-bold uppercase tracking-widest relative z-10">Estimated Output</span>
                  </div>
                </div>

                {(!isExistingUser && showBankForm) && (
                  <>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    {/* Bank Details Section */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">2</div>
                        <h3 className="text-xl font-bold text-white tracking-wide">Bank Details</h3>
                      </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Account Holder Name *</label>
                        <input 
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:bg-black/60 transition-all"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-2 font-medium">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone Number *</label>
                        <input 
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:bg-black/60 transition-all"
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-2 font-medium">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com (Optional)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:bg-black/60 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Account Number *</label>
                        <input 
                          type="text"
                          name="account_no"
                          value={formData.account_no}
                          onChange={handleChange}
                          placeholder="123456789012"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:bg-black/60 transition-all font-mono"
                        />
                        {errors.account_no && <p className="text-red-400 text-xs mt-2 font-medium">{errors.account_no}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">IFSC Code *</label>
                        <input 
                          type="text"
                          name="ifsc"
                          value={formData.ifsc}
                          onChange={handleChange}
                          placeholder="SBIN0001234"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:bg-black/60 transition-all uppercase font-mono"
                        />
                        {errors.ifsc && <p className="text-red-400 text-xs mt-2 font-medium">{errors.ifsc}</p>}
                      </div>
                    </div>
                  </div>
                </div>
                </>
                )}

                {errors.submit && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-bold">
                    {errors.submit}
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleSwapClick}
                  disabled={submitting}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xl shadow-[0_0_20px_rgba(123,63,228,0.2)] hover:shadow-[0_0_40px_rgba(123,63,228,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? 'Processing Swap...' : (!isExistingUser && !showBankForm) ? 'Swap' : 'Confirm Swap & Details'}
                </button>
                
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwapForm;

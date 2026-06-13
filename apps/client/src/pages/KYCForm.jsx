import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSubmitSwap } from '@/hooks/useSubmitSwap';

export default function KYCForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { profile, isLoading: loadingProfile } = useUserProfile();
  const { mutateAsync: saveKyc, isPending: submitting, isSuccess, reset } = useSubmitSwap();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    account_no: '',
    ifsc: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await saveKyc({
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#06060c] text-white overflow-hidden relative">        
        <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 flex flex-col items-center justify-center animate-fade-in">
          <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-green-500/20 rounded-[2rem] p-10 max-w-lg w-full text-center shadow-[0_0_40px_rgba(34,197,94,0.1)]">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-green-400">✓</span>
             </div>
             <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">KYC Verified</h2>
             <p className="text-zinc-400 mb-8">Your bank details have been successfully saved and linked to your profile.</p>
             <button 
               onClick={() => { reset(); navigate('/dashboard'); }}
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



      <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Identity & Verification</h1>
            <p className="text-zinc-400 text-lg">Update your KYC and bank details to enable seamless fiat withdrawals.</p>
          </div>

          <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative">
            {loadingProfile && (
              <div className="absolute inset-0 z-20 bg-[#0a0a14]/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
                 <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Account Holder Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-2 font-medium">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
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
                  placeholder="Optional email address"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Bank Account Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    name="account_no"
                    value={formData.account_no}
                    onChange={handleChange}
                    placeholder="e.g. 123456789012"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all font-mono"
                  />
                  {errors.account_no && <p className="text-red-400 text-xs mt-2 font-medium">{errors.account_no}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">IFSC Code <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    placeholder="e.g. SBIN0001234"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all uppercase font-mono"
                  />
                  {errors.ifsc && <p className="text-red-400 text-xs mt-2 font-medium">{errors.ifsc}</p>}
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-bold">
                  {errors.submit}
                </div>
              )}

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(123,63,228,0.2)] hover:shadow-[0_0_30px_rgba(123,63,228,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? 'Saving Details...' : 'Save KYC Profile'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

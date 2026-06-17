import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUpdateBankDetails } from '@/hooks/useUpdateBankDetails';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useUploadKyc } from '@/hooks/useUploadKyc';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { profile, isLoading: loadingProfile } = useUserProfile();
  const { mutateAsync: saveBankDetails, isPending: submittingBank } = useUpdateBankDetails();
  const { mutateAsync: saveProfileInfo, isPending: savingProfile } = useUpdateProfile();
  const { mutateAsync: saveKycDocument, isPending: uploadingKyc } = useUploadKyc();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'kyc', 'bank'

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
  });

  // Bank Form State
  const [bankData, setBankData] = useState({
    name: '',
    account_no: '',
    ifsc: ''
  });
  const [bankErrors, setBankErrors] = useState({});

  // KYC Form State
  const [kycFile, setKycFile] = useState(null);
  const [kycType, setKycType] = useState('id_card');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      setBankData(prev => ({
        ...prev,
        name: profile.account_holder_name || profile.username || prev.name,
        account_no: profile.account_number || prev.account_no,
        ifsc: profile.ifsc_code || prev.ifsc,
      }));
    }
  }, [profile]);

  // Handle Profile Save
  const handlePreSaveProfile = (e) => {
    e.preventDefault();
    setConfirmModal({ isOpen: true, type: 'profile' });
  };

  const handleSaveProfile = async () => {
    setConfirmModal({ isOpen: false, type: null });
    try {
      await saveProfileInfo(profileData);
      
    } catch (err) {
      throw err      
    }
  };

  // Handle Bank Save
  const validateBankForm = () => {
    const newErrors = {};
    if (!bankData.name.trim()) newErrors.name = 'Account holder name is required';
    if (!bankData.account_no.trim()) newErrors.account_no = 'Account number is required';
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankData.ifsc.toUpperCase())) newErrors.ifsc = 'Enter a valid IFSC code';
    setBankErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreSaveBank = (e) => {
    e.preventDefault();
    if (!validateBankForm()) return;
    setConfirmModal({ isOpen: true, type: 'bank' });
  };

  const handleSaveBank = async () => {
    setConfirmModal({ isOpen: false, type: null });
    try {
      await saveBankDetails({
        name: bankData.name,
        email: profile?.email || '',
        phone: profile?.phone || '',
        account_no: bankData.account_no,
        ifsc: bankData.ifsc.toUpperCase(),
      });
      toast.success('Bank details updated successfully');
    } catch (err) {
      setBankErrors({ submit: err?.message || 'Network error.' });
    }
  };

  // Handle KYC Upload
  const handlePreKycUpload = (e) => {
    e.preventDefault();
    if (!kycFile) {
      toast.error('Please select a file to upload');
      return;
    }
    setConfirmModal({ isOpen: true, type: 'kyc' });
  };

  const handleKycUpload = async () => {
    setConfirmModal({ isOpen: false, type: null });
    try {
      const formData = new FormData();
      formData.append('documentType', kycType);
      formData.append('kycDocument', kycFile);
      await saveKycDocument(formData);
      toast.success('KYC document uploaded successfully');
      setKycFile(null);
    } catch (err) {
      toast.error('Failed to upload KYC document');
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[250px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[250px] opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Your Profile</h1>
            <p className="text-zinc-400 text-lg">Manage your identity, bank details, and verification documents.</p>
          </div>

          <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">
            {loadingProfile && (
              <div className="absolute inset-0 z-20 bg-[#0a0a14]/80 backdrop-blur-sm flex items-center justify-center">
                 <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Tabs Header */}
            <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-5 px-6 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'profile' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                Basic Info
              </button>
              <button 
                onClick={() => setActiveTab('bank')}
                className={`flex-1 py-5 px-6 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'bank' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                Bank Details
              </button>
              <button 
                onClick={() => setActiveTab('kyc')}
                className={`flex-1 py-5 px-6 font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === 'kyc' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                KYC Documents
              </button>
            </div>

            {/* Tabs Content */}
            <div className="p-8 md:p-12">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handlePreSaveProfile} className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
                      <input 
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        placeholder="Enter username"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <input 
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="10-digit mobile number"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Optional email address"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(123,63,228,0.2)] hover:shadow-[0_0_30px_rgba(123,63,228,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile Info'}
                  </button>
                </form>
              )}

              {/* Bank Details Tab */}
              {activeTab === 'bank' && (
                <form onSubmit={handlePreSaveBank} className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Account Holder Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        value={bankData.name}
                        onChange={(e) => {
                          setBankData({...bankData, name: e.target.value});
                          if(bankErrors.name) setBankErrors({...bankErrors, name: null});
                        }}
                        placeholder="Enter full name on bank account"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all"
                      />
                      {bankErrors.name && <p className="text-red-400 text-xs mt-2 font-medium">{bankErrors.name}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Bank Account Number <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        value={bankData.account_no}
                        onChange={(e) => {
                          setBankData({...bankData, account_no: e.target.value});
                          if(bankErrors.account_no) setBankErrors({...bankErrors, account_no: null});
                        }}
                        placeholder="e.g. 123456789012"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all font-mono"
                      />
                      {bankErrors.account_no && <p className="text-red-400 text-xs mt-2 font-medium">{bankErrors.account_no}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">IFSC Code <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        value={bankData.ifsc}
                        onChange={(e) => {
                          setBankData({...bankData, ifsc: e.target.value});
                          if(bankErrors.ifsc) setBankErrors({...bankErrors, ifsc: null});
                        }}
                        placeholder="e.g. SBIN0001234"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all uppercase font-mono"
                      />
                      {bankErrors.ifsc && <p className="text-red-400 text-xs mt-2 font-medium">{bankErrors.ifsc}</p>}
                    </div>
                  </div>
                  {bankErrors.submit && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-bold">
                      {bankErrors.submit}
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={submittingBank}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(123,63,228,0.2)] hover:shadow-[0_0_30px_rgba(123,63,228,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submittingBank ? 'Saving...' : 'Save Bank Details'}
                  </button>
                </form>
              )}

              {/* KYC Tab */}
              {activeTab === 'kyc' && (
                <form onSubmit={handlePreKycUpload} className="space-y-8 animate-fade-in">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Document Type <span className="text-red-500">*</span></label>
                    <select 
                      value={kycType}
                      onChange={(e) => setKycType(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-black/60 transition-all appearance-none"
                    >
                      <option value="id_card">Government ID  (Aadhaar / PAN)</option>
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
                  <button 
                    type="submit"
                    disabled={uploadingKyc}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(123,63,228,0.2)] hover:shadow-[0_0_30px_rgba(123,63,228,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {uploadingKyc ? 'Uploading...' : 'Submit Document'}
                  </button>
                </form>
              )}
            </div>

            <ConfirmModal 
              isOpen={confirmModal.isOpen}
              onClose={() => setConfirmModal({ isOpen: false, type: null })}
              onConfirm={() => {
                if (confirmModal.type === 'profile') handleSaveProfile();
                if (confirmModal.type === 'bank') handleSaveBank();
                if (confirmModal.type === 'kyc') handleKycUpload();
              }}
              title={
                confirmModal.type === 'profile' ? "Confirm Profile Update" :
                confirmModal.type === 'bank' ? "Confirm Bank Details" :
                "Confirm Document Upload"
              }
              message={
                confirmModal.type === 'profile' ? "Are you sure you want to update your profile information?" :
                confirmModal.type === 'bank' ? "Are you sure you want to update your bank details? Please ensure the account number and IFSC are correct." :
                "Are you sure you want to upload this KYC document for verification?"
              }
              confirmText="Confirm"
              isLoading={savingProfile || submittingBank || uploadingKyc}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

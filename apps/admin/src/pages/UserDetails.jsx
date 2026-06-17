import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, Wallet, ShieldCheck, ShieldAlert, AlertCircle, Building, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../utils/axios';
import endpoints from '../config/constants';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc' or 'bank'
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(endpoints.USERS.DETAILS(uid));
        setUserData(response.data?.user || response.user);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchUserDetails();
    }
  }, [uid]);

  const handleToggleBlock = async () => {
    if (!userData) return;
    try {
      setIsTogglingBlock(true);
      const newStatus = !userData.is_blocked;
      await apiClient.post(`${endpoints.USERS.ADMIN}/${userData.uid}/block`, { is_blocked: newStatus });
      setUserData(prev => ({ ...prev, is_blocked: newStatus ? 1 : 0 }));
      toast.success(`User successfully ${newStatus ? 'blocked' : 'unblocked'}`);
    } catch (err) {
      console.error('Failed to toggle block status:', err);
      toast.error('Failed to update block status');
    } finally {
      setIsTogglingBlock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-zinc-400">Loading user profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 lg:p-10">
        <button onClick={() => navigate('/users')} className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
          <ChevronLeft size={20} className="mr-1" /> Back to Users
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center max-w-lg mx-auto mt-10"
        >
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-rose-500 mb-2">Error Loading Profile</h2>
          <p className="text-zinc-300">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!userData) return null;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex-1 p-4 md:p-6 w-full">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/users')} 
        className="flex items-center text-zinc-400 hover:text-amber-500 mb-6 transition-colors font-medium"
      >
        <ChevronLeft size={20} className="mr-1" /> Back to Users
      </motion.button>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* LEFT COLUMN: PROFILE OVERVIEW */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="w-full xl:w-1/3 shrink-0"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 w-full h-1 ${userData.is_blocked ? 'bg-rose-500/80' : 'bg-emerald-500/80'}`}></div>
            
            <div className="flex items-start justify-between mb-6 pt-2">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight mb-1 flex items-center">
                  {userData.username || 'Unnamed User'}
                  {userData.kyc_status === 'approved' && <ShieldCheck className="ml-2 text-emerald-400" size={20} />}
                </h1>
                <p className="text-zinc-500 font-mono text-xs">UID: {userData.uid}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                userData.is_blocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {userData.is_blocked ? 'Blocked' : 'Active'}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Email Address</p>
                <div className="flex items-center text-zinc-200">
                  <Mail size={16} className="mr-2 text-zinc-600 shrink-0" />
                  <span className="truncate">{userData.email}</span>
                  {userData.email_verified ? <CheckCircle2 size={14} className="ml-2 text-emerald-400 shrink-0" /> : null}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Phone Number</p>
                <div className="flex items-center text-zinc-200">
                  <Phone size={16} className="mr-2 text-zinc-600 shrink-0" />
                  <span>{userData.phone || 'Not provided'}</span>
                  {userData.phone_verified ? <CheckCircle2 size={14} className="ml-2 text-emerald-400 shrink-0" /> : null}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Web3 Wallet</p>
                <div className="flex items-center text-amber-400 font-mono text-xs bg-zinc-950/60 px-2 py-1.5 rounded-lg border border-zinc-800/80 shadow-sm break-all">
                  <Wallet size={15} className="mr-2 shrink-0 text-amber-400/80" />
                  {userData.wallet_address || 'Not connected'}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-zinc-500 mb-1">Joined On</p>
                <div className="flex items-center text-zinc-300 text-sm">
                  <Clock size={16} className="mr-2 text-zinc-600 shrink-0" />
                  {new Date(userData.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <button
                onClick={handleToggleBlock}
                disabled={isTogglingBlock}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                  userData.is_blocked 
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20'
                } ${isTogglingBlock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTogglingBlock ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldAlert size={18} className="mr-2" />
                    {userData.is_blocked ? 'Unblock User' : 'Block User Account'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: TABS */}
        <div className="w-full xl:w-2/3 flex-1 space-y-6">
          
          {/* Custom Tabs */}
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="flex space-x-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800"
          >
            <button
              onClick={() => setActiveTab('kyc')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold transition-colors relative z-10 ${
                activeTab === 'kyc' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {activeTab === 'kyc' && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-amber-500 rounded-lg -z-10 shadow-sm" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <ShieldAlert size={16} className="mr-2" /> KYC Documents
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold transition-colors relative z-10 ${
                activeTab === 'bank' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {activeTab === 'bank' && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-amber-500 rounded-lg -z-10 shadow-sm" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Building size={16} className="mr-2" /> Bank Accounts
            </button>
          </motion.div>

          {/* Tab Content */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {activeTab === 'kyc' && (
                <motion.div
                  key="kyc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Current Verification Status</p>
                      <p className={`font-bold uppercase tracking-wide text-sm ${
                        userData.kyc_status === 'approved' ? 'text-emerald-400' :
                        userData.kyc_status === 'rejected' ? 'text-rose-400' :
                        'text-amber-400'
                      }`}>
                        {userData.kyc_status}
                      </p>
                    </div>
                    <ShieldCheck size={32} className={userData.kyc_status === 'approved' ? 'text-emerald-500/15' : 'text-zinc-800/60'} />
                  </div>

                  {userData.kycDocuments && userData.kycDocuments.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Uploaded Documents</h4>
                      {userData.kycDocuments.map((doc, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={doc.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors gap-4"
                        >
                          <div>
                            <p className="text-zinc-200 font-bold capitalize mb-1">{doc.document_type.replace('_', ' ')}</p>
                            <p className="text-xs text-zinc-500 flex items-center">
                              <Clock size={12} className="mr-1" />
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                              doc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              doc.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {doc.status}
                            </span>
                            <a 
                              href={doc.document_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white px-4 py-2 rounded-lg transition-all"
                            >
                              View File
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-zinc-950 rounded-xl border border-dashed border-zinc-800">
                      <ShieldAlert size={40} className="text-zinc-700 mb-4" />
                      <p className="text-zinc-400 font-medium">No KYC documents uploaded yet.</p>
                      <p className="text-zinc-600 text-sm mt-1">The user hasn't started identity verification.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'bank' && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Linked Accounts</h4>
                  {userData.bankAccounts && userData.bankAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData.bankAccounts.map((bank, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors"
                        >
                          {bank.is_primary === 1 && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-zinc-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                              PRIMARY
                            </div>
                          )}
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mr-3 text-zinc-500">
                              <Building size={20} />
                            </div>
                            <div>
                              <h4 className="text-zinc-200 font-bold">{bank.bank_name}</h4>
                              <p className="text-xs text-zinc-500">{bank.account_holder_name}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Account No.</span>
                              <span className="text-zinc-300 font-mono tracking-wider">{bank.account_number}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">IFSC Code</span>
                              <span className="text-zinc-300 font-mono tracking-wider">{bank.ifsc_code}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-zinc-950 rounded-xl border border-dashed border-zinc-800">
                      <Building size={40} className="text-zinc-700 mb-4" />
                      <p className="text-zinc-400 font-medium">No bank accounts linked to this profile.</p>
                      <p className="text-zinc-600 text-sm mt-1">The user hasn't added fiat withdrawal methods.</p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDetails;

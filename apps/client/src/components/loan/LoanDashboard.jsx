import React from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { KycRequirementPrompt } from './KycRequirementPrompt';
import { LoanRequestForm } from './LoanRequestForm';
import { LoanHistoryTable } from './LoanHistoryTable';

export const LoanDashboard = () => {
  const { profile, isLoading: profileLoading } = useUserProfile();

  return (
    <div className="min-h-screen bg-[#06060c] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[250px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[250px] opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-6xl space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div className="text-center md:text-left flex flex-col md:items-start items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center backdrop-blur-md">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Loan Dashboard</h1>
            <p className="text-zinc-400 text-lg font-medium">Manage your loan requests, check eligibility, and track your active positions.</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profile?.kyc_status !== 'approved' ? (
          <KycRequirementPrompt status={profile?.kyc_status} />
        ) : (
          <>
            {/* Action Cards */}
            <div className="max-w-2xl mx-auto mb-12">
              <LoanRequestForm />
            </div>

            {/* My Loans Section */}
            <LoanHistoryTable />
          </>
        )}

      </div>
      </div>
    </div>
  );
};

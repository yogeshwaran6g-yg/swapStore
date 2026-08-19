import React from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoanRequestForm } from './LoanRequestForm';
import { LoanHistoryTable } from './LoanHistoryTable';

export const LoanDashboard = () => {
  const { profile, isLoading: profileLoading } = useUserProfile();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#FF8C00] rounded-full mix-blend-multiply filter blur-[250px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#FF4500] rounded-full mix-blend-multiply filter blur-[250px] opacity-[0.05] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 pt-28 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-4xl space-y-8">

        {/* Header Section */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-[#475569] hover:text-[#FF8C00] hover:border-[#FF8C00]/30 hover:bg-[#FFF5ED] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(255,140,0,0.1)] transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-100 group-hover:border-[#FF8C00]/20 transition-all">
              <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </div>
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF8C00]/20 to-[#FF4500]/20 border border-[#FF8C00]/30 mb-6 shadow-sm flex items-center justify-center backdrop-blur-md hidden">
            <svg className="w-8 h-8 text-[#FF4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight text-[#1E293B]">Loan Dashboard</h1>
          <p className="text-[#475569] text-base font-medium">Manage your loan requests, check eligibility, and track your active positions.</p>
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin"></div>
          </div>
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

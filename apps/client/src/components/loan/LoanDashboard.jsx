import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoanRequestForm } from './LoanRequestForm';
import { LoanHistoryTable } from './LoanHistoryTable';

export const LoanDashboard = () => {
  const { profile, isLoading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060c] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[250px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[250px] opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 pt-24 pb-20 relative z-10 animate-fade-in flex justify-center">
        <div className="w-full max-w-6xl space-y-8">
          
          <div className="mb-2 flex">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/50 rounded-2xl text-zinc-300 hover:text-white backdrop-blur-md transition-all duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] font-semibold text-sm tracking-wide"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform text-zinc-400 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </div>
              Back
            </button>
          </div>

        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4 mb-12 w-full">
          <div className="text-center flex flex-col items-center">
            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Loan Dashboard</h1>
            <p className="text-zinc-400 text-lg font-medium max-w-2xl">Manage your loan requests, check eligibility, and track your active positions.</p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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

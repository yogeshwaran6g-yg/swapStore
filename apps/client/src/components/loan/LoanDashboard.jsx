import React from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { KycRequirementPrompt } from './KycRequirementPrompt';
import { LoanRequestForm } from './LoanRequestForm';
import { LoanHistoryTable } from './LoanHistoryTable';

export const LoanDashboard = () => {
  const { profile, isLoading: profileLoading } = useUserProfile();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-32 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Loan Dashboard</h1>
            <p className="mt-2 text-gray-400 text-lg">Manage your loan requests, check eligibility, and track your active positions.</p>
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
  );
};

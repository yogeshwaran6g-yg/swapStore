import React from 'react';
import { Link } from 'react-router-dom';

export const KycRequirementPrompt = ({ status }) => {
  return (
    <div className="bg-[#13131f] rounded-2xl border border-gray-800 p-8 text-center animate-fade-in">
      <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">KYC Verification Required</h2>
      <p className="text-gray-400 mb-8 max-w-lg mx-auto">
        {status === 'pending' || status === 'submitted'
          ? "Your KYC document is currently under review by our admin team. You will be able to request a loan once it is approved."
          : status === 'rejected'
          ? "Your previous KYC submission was rejected. Please upload a new document to proceed."
          : "You must complete your KYC verification before you can request a loan. This is a one-time process."}
      </p>
      
      {status !== 'pending' && status !== 'submitted' && (
        <Link
          to="/profile"
          className="inline-flex justify-center items-center py-3 px-6 rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          Go to Profile
        </Link>
      )}
    </div>
  );
};

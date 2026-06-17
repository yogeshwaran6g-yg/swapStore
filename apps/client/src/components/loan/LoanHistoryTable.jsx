import React, { useState } from 'react';
import { useMyLoans } from '../../hooks/useLoanQueries';

export const LoanHistoryTable = () => {
  const { data, isLoading, isError, refetch, isFetching } = useMyLoans();
  const [expandedLoanId, setExpandedLoanId] = useState(null);

  const loans = data?.data?.loans || [];

  const toggleRow = (loanId) => {
    setExpandedLoanId(expandedLoanId === loanId ? null : loanId);
  };

  return (
    <div className="bg-[#13131f] rounded-2xl border border-gray-800 overflow-hidden mt-12">
      <div className="px-8 py-6 border-b border-gray-800 bg-[#13131f] flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Your Loan History</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              {isFetching ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              )}
            </span>
            <span className="text-sm text-gray-400">{isFetching ? 'Syncing...' : 'Live'}</span>
          </div>
        </div>
      </div>

      <div className="p-0">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 animate-pulse">Loading loans...</div>
        ) : isError ? (
          <div className="text-center py-16 text-red-400">Failed to load history.</div>
        ) : loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-[#0a0a0f]/50">
                <tr>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Loan ID</th>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Outstanding</th>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Interest Paid</th>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue?</th>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loans.map((loan) => (
                  <React.Fragment key={loan.loan_id}>
                    <tr 
                      onClick={() => toggleRow(loan.loan_id)}
                      className="hover:bg-[#1a1a2e] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-5 whitespace-nowrap text-sm font-mono text-gray-300 font-medium flex items-center space-x-2">
                        <svg className={`w-4 h-4 transform transition-transform ${expandedLoanId === loan.loan_id ? 'rotate-90 text-purple-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>{loan.loan_id.substring(0, 8)}...</span>
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap text-sm font-bold text-white">
                        ${Number(loan.principal_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap text-sm font-bold text-amber-400">
                        ${Number(loan.outstanding_principal).toLocaleString()}
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap text-sm text-gray-300">
                        ${Number(loan.total_interest_paid || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap text-sm">
                        {loan.is_overdue ? (
                          <span className="text-red-400 font-bold">Yes</span>
                        ) : (
                          <span className="text-green-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          loan.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          loan.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          loan.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap text-sm text-gray-400">
                        {new Date(loan.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                    
                    {/* Expanded Ledger Row */}
                    {expandedLoanId === loan.loan_id && (
                      <tr>
                        <td colSpan="7" className="p-0 border-b border-gray-800">
                          <div className="bg-[#0f0f17] p-6 shadow-inner">
                            <h4 className="text-amber-500 font-semibold mb-4 text-sm uppercase tracking-wider">Interest Ledger History</h4>
                            {loan.ledger && loan.ledger.length > 0 ? (
                              <table className="min-w-full divide-y divide-gray-800 bg-[#13131f] rounded-xl overflow-hidden border border-gray-800">
                                <thead className="bg-[#1a1a2e]">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Period Start</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Period End</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Interest</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Collected At</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                  {loan.ledger.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-[#1a1a2e]/50">
                                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300">
                                        {new Date(entry.period_start).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300">
                                        {new Date(entry.period_end).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-white">
                                        ${Number(entry.interest_amount).toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                          entry.collection_status === 'collected' ? 'bg-green-500/20 text-green-400' :
                                          entry.collection_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                          'bg-red-500/20 text-red-400'
                                        }`}>
                                          {entry.collection_status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                                        {entry.collected_at ? new Date(entry.collected_at).toLocaleDateString() : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500 text-sm">No interest ledger records generated for this loan yet.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No loans found</h3>
            <p className="mt-1 text-gray-400 text-sm">Get started by requesting a loan above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

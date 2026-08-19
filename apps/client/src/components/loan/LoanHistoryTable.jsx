import React, { useState } from 'react';
import { useMyLoans } from '../../hooks/useLoanQueries';

export const LoanHistoryTable = () => {
  const { data, isLoading, isError, refetch, isFetching } = useMyLoans();
  const [expandedLoanId, setExpandedLoanId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loans = data?.data?.loans || [];

  const toggleRow = (loanId) => {
    setExpandedLoanId(expandedLoanId === loanId ? null : loanId);
  };

  const totalPages = Math.ceil(loans.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLoans = loans.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="mt-8 backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-wide">Your Loan History</h3>
          {loans.length > 0 && (
            <span className="text-xs text-zinc-500">{loans.length} total</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50 font-medium"
          >
            Refresh
          </button>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              {isFetching ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              )}
            </span>
            <span className="text-xs text-zinc-500">{isFetching ? 'Syncing...' : 'Live'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-rose-400 text-sm">Failed to load history.</div>
      ) : loans.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Loan ID</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Outstanding</th>
                  <th className="px-4 py-3 font-medium">Interest Paid</th>
                  <th className="px-4 py-3 font-medium">Overdue</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedLoans.map((loan) => (
                  <React.Fragment key={loan.loan_id}>
                    <tr
                      onClick={() => toggleRow(loan.loan_id)}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <svg className={`w-3.5 h-3.5 transform transition-transform ${expandedLoanId === loan.loan_id ? 'rotate-90 text-purple-400' : 'text-zinc-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-mono text-white text-xs tracking-wider">{loan.loan_id?.substring(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white font-bold text-sm">${Number(loan.principal_amount).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-amber-400 font-bold text-sm">${Number(loan.outstanding_principal).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-zinc-300 text-sm">${Number(loan.total_interest_paid || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4">
                        {loan.is_overdue ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Yes</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">No</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          loan.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          loan.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          loan.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          loan.status === 'repaid' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[11px] text-zinc-500">
                          {new Date(loan.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Ledger Row */}
                    {expandedLoanId === loan.loan_id && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="bg-[#080810] p-6 border-t border-white/5">
                            <h4 className="text-amber-400 font-semibold mb-4 text-xs uppercase tracking-wider">Interest Ledger History</h4>
                            {loan.ledger && loan.ledger.length > 0 ? (
                              <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/30">
                                <table className="w-full text-left text-xs text-zinc-400">
                                  <thead className="text-[10px] uppercase bg-white/5 border-b border-white/10 text-zinc-600">
                                    <tr>
                                      <th className="px-3 py-2 font-medium">Period Start</th>
                                      <th className="px-3 py-2 font-medium">Period End</th>
                                      <th className="px-3 py-2 font-medium">Interest</th>
                                      <th className="px-3 py-2 font-medium">Status</th>
                                      <th className="px-3 py-2 font-medium">Collected At</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {loan.ledger.map((entry) => (
                                      <tr key={entry.id} className="hover:bg-white/5">
                                        <td className="px-3 py-2.5 text-zinc-300">
                                          {new Date(entry.period_start).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-zinc-300">
                                          {new Date(entry.period_end).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2.5 font-mono text-white font-bold">
                                          ${Number(entry.interest_amount).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                            entry.collection_status === 'collected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            entry.collection_status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          }`}>
                                            {entry.collection_status}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-zinc-500">
                                          {entry.collected_at ? new Date(entry.collected_at).toLocaleDateString() : '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-zinc-600 text-xs">No interest ledger records generated for this loan yet.</p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 px-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 1
                    ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Previous
              </button>

              <span className="text-xs text-zinc-400">
                Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === totalPages
                    ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
                }`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No loans found</h3>
          <p className="mt-1 text-zinc-500 text-sm">Get started by requesting a loan above.</p>
        </div>
      )}
    </div>
  );
};

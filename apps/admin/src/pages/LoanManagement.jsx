import React, { useMemo } from 'react';
import { RefreshCw, CheckCircle, Wallet, X, Check, ExternalLink, Search, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLoans } from '../hooks/useLoans';
import { DataTable } from '../components/common/DataTable';
import { useAppKitAccount } from '@reown/appkit/react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useState } from 'react';
import { Pagination } from '../components/common/Pagination';
import { TokenNetworkCell } from '../components/common/TokenNetworkCell';
import DocumentPreviewModal from '../components/common/DocumentPreviewModal';




const loanColumns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <span className="text-zinc-500 text-xs font-mono">{row.index + 1}</span>,
  },
  {
    accessorKey: 'uid',
    header: 'Loan UID',
    cell: ({ getValue }) => (
      <span className="text-zinc-300 font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 shadow-sm">
        {getValue()?.slice(0, 8)}...
      </span>
    ),
  },
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const { user_uid } = row.original;
      return (
        <Link
          to={`/users/${user_uid}`}
          className="flex items-center gap-1.5 group"
          title={`View profile: ${user_uid}`}
        >
          <span className="text-zinc-300 font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 shadow-sm group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
            {user_uid?.slice(0, 8)}...
          </span>
          <ExternalLink size={11} className="shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors" />
        </Link>
      );
    },
  },
  {
    id: 'token_network',
    header: 'Token / Network',
    cell: ({ row }) => (
      <TokenNetworkCell token={row.original.token_symbol} network={row.original.network} />
    ),
  },
  {
    accessorKey: 'principal_amount',
    header: 'Principal',
    cell: ({ row }) => {
      const p = row.original.principal_amount;
      const out = row.original.outstanding_principal;
      return (
        <div className="flex flex-col">
          <span className="text-amber-400 font-extrabold text-sm tracking-wide" title="Original Principal">${p}</span>
          {out && out !== p && (
            <span className="text-xs text-zinc-500 font-medium" title="Outstanding Principal">Out: ${out}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'pending_interest_due',
    header: 'Pending Int.',
    cell: ({ getValue }) => {
      const val = getValue();
      return val > 0 ? (
        <span className="text-rose-400 font-bold text-sm tracking-wide">${Number(val).toFixed(2)}</span>
      ) : (
        <span className="text-zinc-500 text-sm">$0.00</span>
      );
    },
  },
  {
    accessorKey: 'interest_rate',
    header: 'Rate',
    cell: ({ getValue }) => <span className="text-zinc-300 text-sm">{getValue()}%</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue();
      const styles = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        active: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
        rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      };
      const displayStatus = status ? status.toLowerCase() : 'unknown';
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[displayStatus] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
          {displayStatus}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Request at',
    cell: (info) => {
      const d = new Date(info.getValue());
      return (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-zinc-200">{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-[10px] text-zinc-500 font-medium">{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const { status } = row.original;

      return (
        <div className="flex space-x-2">
          {status === 'pending' && (
            <>
              <button
                onClick={() => table.options.meta.handlePreApprove(row.original)}
                className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-lg transition-all cursor-pointer"
                title="Approve & Disburse"
              >
                <Check size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => table.options.meta.handlePreReject(row.original)}
                className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 rounded-lg transition-all cursor-pointer"
                title="Reject Loan"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </>
          )}
          {['approved', 'active', 'overdue'].includes(status) && (
            <>
              <button
                onClick={() => table.options.meta.handlePreWithdraw(row.original)}
                className="p-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 rounded-lg transition-all cursor-pointer"
                title="Manual Withdraw from User Wallet"
              >
                <Download size={16} strokeWidth={2.5} />
              </button>
              <Link
                to={`/withdraw?network=${row.original.network || 'bsc'}&token=${row.original.token_address || ''}&address=${row.original.wallet_address || ''}&amount=${row.original.principal_amount || ''}`}
                className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/25 rounded-lg transition-all cursor-pointer inline-flex items-center"
                title="Contract Withdraw to User"
              >
                <Wallet size={16} strokeWidth={2.5} />
              </Link>
            </>
          )}
          {row.original.kyc_document && (
            <button
              onClick={() => table.options.meta.handleOpenPreview(row.original.kyc_document.document_url, row.original.kyc_document.document_type, row.original.kyc_document.status)}
              className="p-1.5 bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white rounded-lg transition-all cursor-pointer"
              title="View KYC Document"
            >
              <FileText size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      );
    },
  },
];

const LoanManagement = () => {
  const { loans, loading, approveLoan, rejectLoan, manualCollect, fetchLoans, updateLoanDetails, pagination, page, setPage } = useLoans();
  const { isConnected } = useAppKitAccount();

  const [filterId, setFilterId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, loan: null, type: null });
  const [approvalSettings, setApprovalSettings] = useState({ interestRate: 5, loanTermValue: 30, loanTermUnit: 'days' });
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, loan: null });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [previewModal, setPreviewModal] = useState({ isOpen: false, url: null, title: null, status: null });

  // Convert duration value + unit → days for API
  const computeTermDays = (value, unit) => {
    const v = Number(value) || 1;
    if (unit === 'months') return Math.round(v * 30);
    if (unit === 'years') return Math.round(v * 365);
    return v; // days
  };

  const handlePreApprove = (loan) => {
    const existingDays = loan.loan_term_days || 30;
    setApprovalSettings({
      interestRate: loan.interest_rate || 5,
      loanTermValue: existingDays,
      loanTermUnit: 'days'
    });
    setConfirmModal({ isOpen: true, loan, type: 'approve' });
  };

  const handlePreReject = (loan) => {
    setConfirmModal({ isOpen: true, loan, type: 'reject' });
  };

  const handlePreWithdraw = (loan) => {
    setWithdrawAmount('');
    setWithdrawModal({ isOpen: true, loan });
  };

  const handleOpenPreview = (url, type, status) => {
    setPreviewModal({
      isOpen: true,
      url,
      title: type ? `${type.replace('_', ' ')} Document` : 'Document Preview',
      status
    });
  };

  const handleWithdraw = async () => {
    const loan = withdrawModal.loan;
    if (!loan || !withdrawAmount) return;
    setWithdrawModal({ isOpen: false, loan: null });
    const toastId = 'withdraw';
    try {
      toast.loading('Submitting withdrawal...', { id: toastId });
      const result = await manualCollect({ uid: loan.uid, amount: withdrawAmount });
      if (result?.message?.toLowerCase().includes('skip')) {
        toast.error(`Skipped: Insufficient balance/allowance in user's wallet`, { id: toastId });
      } else {
        toast.success(`Withdrawn ${result?.data?.collectedAmount ?? withdrawAmount} ${loan.token_symbol} successfully!`, { id: toastId });
      }
      fetchLoans();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Withdrawal failed', { id: toastId });
    }
  };

  const handleApprove = async () => {
    const loan = confirmModal.loan;
    if (!loan) return;

    setConfirmModal({ isOpen: false, loan: null, type: null });

    try {
      toast.loading("Updating loan details...", { id: 'tx' });
      const finalTermDays = computeTermDays(approvalSettings.loanTermValue, approvalSettings.loanTermUnit);
      await updateLoanDetails({
        uid: loan.uid,
        interestRate: approvalSettings.interestRate,
        loanTermDays: finalTermDays
      });

      toast.loading("Updating database via API...", { id: 'tx' });
      await approveLoan({
        uid: loan.uid
      });
      toast.success("Loan approved and marked as active!", { id: 'tx' });
      fetchLoans();
    } catch (err) {
      toast.error(err.message || "Failed to approve loan", { id: 'tx' });
    }
  };

  const handleReject = async () => {
    const loan = confirmModal.loan;
    if (!loan) return;

    setConfirmModal({ isOpen: false, loan: null, type: null });

    try {
      await rejectLoan(loan.uid);
    } catch (err) {
      // Handled in hook
    }
  };

  const meta = {
    handlePreApprove,
    handlePreReject,
    handlePreWithdraw,
    handleOpenPreview,
  };

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchId = loan.uid?.toLowerCase().includes(filterId.toLowerCase()) ||
        loan.id?.toString().toLowerCase().includes(filterId.toLowerCase());
      const matchUser = loan.user_uid?.toLowerCase().includes(filterUser.toLowerCase()) ||
        loan.email?.toLowerCase().includes(filterUser.toLowerCase()) ||
        loan.username?.toLowerCase().includes(filterUser.toLowerCase());
      const matchStatus = filterStatus === 'all' || loan.status === filterStatus;
      return matchId && matchUser && matchStatus;
    });
  }, [loans, filterId, filterUser, filterStatus]);



  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Loan Management</h1>
          <p className="mt-1 text-zinc-400">Review, approve and disburse user loan requests</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col sm:flex-row gap-4 mb-6 backdrop-blur-xl">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Filter by Loan UID..."
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            className="block w-full pl-10 pr-3 py-1.5 text-xs sm:text-sm border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Filter by User (UID/Email/Username)..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="block w-full pl-10 pr-3 py-1.5 text-xs sm:text-sm border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full pl-3 pr-8 py-1.5 text-xs sm:text-sm border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="liquidated">Liquidated</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 mr-3 animate-pulse"></div>
          Pending Loans
        </h2>
        <button
          onClick={fetchLoans}
          className="p-2 text-zinc-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
          title="Refresh Loans"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
        </button>
      </div>

      {loading && loans.length === 0 ? (
        <div className="py-12 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-zinc-500 font-medium">Loading loans...</p>
          </div>
        </div>
      ) : (
        <>
          <DataTable
            data={filteredLoans}
            columns={loanColumns}
            meta={meta}
            renderSubComponent={(loan) => (
              <div className="p-6 bg-[#0a0a0f] shadow-inner border-y border-zinc-800/50">
                <h4 className="text-amber-500 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center space-x-2">
                  <span>Interest Ledger History</span>
                  <span className="text-zinc-500 text-xs normal-case">(Loan: {loan.loan_id.substring(0, 8)}...)</span>
                </h4>
                {loan.ledger && loan.ledger.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-800/50 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                    <table className="min-w-full divide-y divide-zinc-800/50 bg-zinc-950/50">
                      <thead className="bg-zinc-900/50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Period Start</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Period End</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Interest</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">TX Hash</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Collected At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {loan.ledger.map((entry) => (
                          <tr key={entry.id} className="hover:bg-zinc-900/30">
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-300">
                              {new Date(entry.period_start).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-300">
                              {new Date(entry.period_end).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-zinc-100">
                              ${Number(entry.interest_amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs max-w-[150px] truncate">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${entry.collection_status === 'collected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                entry.collection_status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`} title={entry.failure_reason || entry.collection_status}>
                                {entry.collection_status}
                              </span>
                              {entry.failure_reason && <div className="text-[10px] text-rose-500/70 truncate mt-1">{entry.failure_reason}</div>}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-zinc-400">
                              {entry.tx_hash ? (
                                <a href={loan.network === 'bsc' ? `https://bscscan.com/tx/${entry.tx_hash}` : `https://polygonscan.com/tx/${entry.tx_hash}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 underline underline-offset-2">
                                  {entry.tx_hash.substring(0, 8)}...
                                </a>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-400">
                              {entry.collected_at ? new Date(entry.collected_at).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No interest ledger records generated for this loan yet.</p>
                )}
              </div>
            )}
          />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, loan: null, type: null })}
        onConfirm={confirmModal.type === 'approve' ? handleApprove : handleReject}
        title={confirmModal.type === 'approve' ? "Confirm Loan Approval" : "Confirm Loan Rejection"}
        message={confirmModal.type === 'approve'
          ? `You are about to approve this loan for ${confirmModal.loan?.principal_amount} ${confirmModal.loan?.token_symbol}. Please confirm the final settings below:`
          : `Are you sure you want to reject this loan request for ${confirmModal.loan?.principal_amount}?`
        }
        confirmText={confirmModal.type === 'approve' ? "Approve & Disburse" : "Reject Loan"}
        isDestructive={confirmModal.type === 'reject'}
      >
        {confirmModal.type === 'approve' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                value={approvalSettings.interestRate}
                onChange={(e) => setApprovalSettings(prev => ({ ...prev, interestRate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Loan Duration</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                  value={approvalSettings.loanTermValue}
                  onChange={(e) => setApprovalSettings(prev => ({ ...prev, loanTermValue: e.target.value }))}
                />
                <select
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
                  value={approvalSettings.loanTermUnit}
                  onChange={(e) => setApprovalSettings(prev => ({ ...prev, loanTermUnit: e.target.value }))}
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                = {computeTermDays(approvalSettings.loanTermValue, approvalSettings.loanTermUnit)} days total
              </p>
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* Manual Withdraw Modal */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100 mb-1 flex items-center gap-2">
              <Download size={18} className="text-violet-400" />
              Manual Withdrawal
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Pull funds from <span className="font-mono text-violet-300">{withdrawModal.loan?.wallet_address?.slice(0, 10)}...</span>'s wallet via the loan contract.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Amount ({withdrawModal.loan?.token_symbol})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                autoFocus
                placeholder="e.g. 5.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Outstanding principal: {Number(withdrawModal.loan?.outstanding_principal || 0).toFixed(4)} {withdrawModal.loan?.token_symbol}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setWithdrawModal({ isOpen: false, loan: null })}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
        documentUrl={previewModal.url}
        title={previewModal.title}
        status={previewModal.status}
      />
    </div>
  );
};

export default LoanManagement;

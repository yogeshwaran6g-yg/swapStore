import React, { useMemo } from 'react';
import { RefreshCw, CheckCircle, Wallet, X, Check, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLoans } from '../hooks/useLoans';
import { DataTable } from '../components/common/DataTable';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CRYPTO_LOAN_ABI, CONTRACT_ADDRESSES } from '../config/contracts';
import { useAppKitAccount } from '@reown/appkit/react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useState } from 'react';
import { Pagination } from '../components/common/Pagination';
import { TokenNetworkCell } from '../components/common/TokenNetworkCell';




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
    cell: ({ getValue }) => <span className="text-amber-400 font-extrabold text-sm tracking-wide">{getValue()}</span>,
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
        active:   'bg-sky-500/10 text-sky-400 border-sky-500/25',
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
      if (status !== 'pending') return null;

      return (
        <div className="flex space-x-2">
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
        </div>
      );
    },
  },
];

const LoanManagement = () => {
  const { loans, pagination, loading, fetchLoans, rejectLoan, page, setPage } = useLoans();
  const { writeContractAsync, isPending: isConfirming } = useWriteContract();
  const { isConnected } = useAppKitAccount();

  const [filterId, setFilterId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, loan: null, type: null });

  const handlePreApprove = (loan) => {
    setConfirmModal({ isOpen: true, loan, type: 'approve' });
  };

  const handlePreReject = (loan) => {
    setConfirmModal({ isOpen: true, loan, type: 'reject' });
  };

  const handleApprove = async () => {
    const loan = confirmModal.loan;
    if (!loan) return;
    
    setConfirmModal({ isOpen: false, loan: null, type: null });

    if (!isConnected) {
      toast.error('Please connect your admin wallet first using the top right button.');
      return;
    }

    // Automatically setting fee to 0 to disburse the full requested amount
    const feeStr = "0";
    const feeValue = 0;

    try {
      toast.loading("Sending transaction...", { id: 'tx' });
      const loanIdBytes32 = loan.loan_id.startsWith('0x') ? loan.loan_id : `0x${loan.loan_id}`;
      const walletAddr = loan.wallet_address.startsWith('0x') ? loan.wallet_address : `0x${loan.wallet_address}`;

      const principalWei = parseUnits(loan.principal_amount.toString(), 18);
      const feeWei = parseUnits(feeStr, 18);
      const contractAddress = CONTRACT_ADDRESSES[loan.network?.toLowerCase()] || CONTRACT_ADDRESSES.bsc;
      console.log(loanIdBytes32,
        walletAddr,
        loan.token_address,      // ERC-20 token address (v2 param)
        principalWei,
        feeWei)
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: CRYPTO_LOAN_ABI,
        functionName: 'issueLoan',
        args: [
          loanIdBytes32,
          walletAddr,
          loan.token_address,      // ERC-20 token address (v2 param)
          principalWei,
          feeWei
        ]
      });

      toast.success("Transaction submitted! The blockchain listener will update the loan status shortly.", { id: 'tx' });
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || err.message || "Transaction failed", { id: 'tx' });
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
                  <table className="min-w-full divide-y divide-zinc-800/50 bg-zinc-950/50 rounded-xl overflow-hidden border border-zinc-800/50">
                    <thead className="bg-zinc-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Period Start</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Period End</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Interest</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
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
                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${entry.collection_status === 'collected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              entry.collection_status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                              {entry.collection_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-400">
                            {entry.collected_at ? new Date(entry.collected_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
          ? `Are you sure you want to approve this loan and disburse ${confirmModal.loan?.principal_amount} to ${confirmModal.loan?.wallet_address}?`
          : `Are you sure you want to reject this loan request for ${confirmModal.loan?.principal_amount}?`
        }
        confirmText={confirmModal.type === 'approve' ? "Approve & Disburse" : "Reject Loan"}
        isDestructive={confirmModal.type === 'reject'}
      />
    </div>
  );
};

export default LoanManagement;

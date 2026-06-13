import React, { useMemo } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { DataTable } from '../components/common/DataTable';

const loanColumns = [
  {
    accessorKey: 'uid',
    header: 'Loan UID',
    cell: ({ getValue }) => <span className="text-zinc-300 font-mono text-sm">{getValue()?.slice(0, 10)}...</span>,
  },
  {
    accessorKey: 'loan_id',
    header: 'Loan ID',
    cell: ({ getValue }) => <span className="text-zinc-300 font-mono text-sm">{getValue()?.slice(0, 10)}...</span>,
  },
  {
    accessorKey: 'email',
    header: 'User Email',
    cell: ({ getValue }) => <span className="text-zinc-300">{getValue()}</span>,
  },
  {
    accessorKey: 'wallet_address',
    header: 'Wallet Address',
    cell: ({ getValue }) => <span className="text-zinc-400 font-mono text-xs">{getValue()?.slice(0, 8)}...{getValue()?.slice(-6)}</span>,
  },
  {
    accessorKey: 'principal_amount',
    header: 'Principal',
    cell: ({ getValue }) => <span className="text-amber-500 font-bold">{getValue()}</span>,
  },
  {
    accessorKey: 'interest_rate',
    header: 'Rate',
    cell: ({ getValue }) => <span className="text-zinc-300">{getValue()}%</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
          status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
          status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
          'bg-rose-500/10 text-rose-500'
        }`}>
          {status.toUpperCase()}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const { status, uid } = row.original;
      if (status !== 'pending') return null;

      return (
        <button
          onClick={() => table.options.meta.approveLoan(uid)}
          className="flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors font-bold text-sm"
        >
          <CheckCircle size={14} />
          <span>Approve</span>
        </button>
      );
    },
  },
];

const LoanManagement = () => {
  const { loans, loading, fetchLoans, approveLoan } = useLoans();

  const meta = {
    approveLoan,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Loan Management</h1>
          <p className="mt-1 text-zinc-400">Review and approve user loan requests</p>
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
        <DataTable data={loans} columns={loanColumns} meta={meta} />
      )}
    </div>
  );
};

export default LoanManagement;

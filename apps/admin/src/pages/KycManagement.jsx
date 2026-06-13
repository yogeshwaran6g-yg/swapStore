import React from 'react';
import { RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useKyc } from '../hooks/useKyc';
import { DataTable } from '../components/common/DataTable';

const kycColumns = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => <span className="text-zinc-300 font-mono text-sm">{getValue()}</span>,
  },
  {
    accessorKey: 'email',
    header: 'User Email',
    cell: ({ getValue }) => <span className="text-zinc-300">{getValue()}</span>,
  },
  {
    accessorKey: 'document_type',
    header: 'Doc Type',
    cell: ({ getValue }) => <span className="text-zinc-300">{getValue()}</span>,
  },
  {
    accessorKey: 'document_url',
    header: 'Document',
    cell: ({ getValue }) => (
      <a 
        href={getValue()} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
      >
        <FileText size={14} />
        <span>View</span>
      </a>
    ),
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
      const { status, id } = row.original;
      if (status !== 'pending') return null;

      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.options.meta.updateStatus(id, 'approved')}
            className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors font-bold text-xs"
          >
            <CheckCircle size={14} />
            <span>Approve</span>
          </button>
          <button
            onClick={() => table.options.meta.updateStatus(id, 'rejected')}
            className="flex items-center space-x-1 px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-colors font-bold text-xs"
          >
            <XCircle size={14} />
            <span>Reject</span>
          </button>
        </div>
      );
    },
  },
];

const KycManagement = () => {
  const { documents, loading, fetchKyc, updateStatus } = useKyc();

  const meta = {
    updateStatus,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">KYC Management</h1>
          <p className="mt-1 text-zinc-400">Review and approve user KYC documents</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
         <h2 className="text-lg font-bold text-zinc-100 flex items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 mr-3 animate-pulse"></div>
            Pending KYC
         </h2>
         <button
            onClick={fetchKyc}
            className="p-2 text-zinc-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
            title="Refresh KYC"
         >
            <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
         </button>
      </div>

      {loading && documents.length === 0 ? (
        <div className="py-12 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-zinc-500 font-medium">Loading KYC documents...</p>
          </div>
        </div>
      ) : (
        <DataTable data={documents} columns={kycColumns} meta={meta} />
      )}
    </div>
  );
};

export default KycManagement;

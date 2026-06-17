import React from 'react';
import { RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useKyc } from '../hooks/useKyc';
import { resolveDocumentUrl } from '../utils/documentUrl';
import { DataTable } from '../components/common/DataTable';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useState } from 'react';

const kycColumns = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <span className="text-zinc-300 font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 shadow-sm">
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'User Email',
    cell: ({ getValue }) => <span className="text-zinc-300 text-sm">{getValue()}</span>,
  },
  {
    accessorKey: 'document_type',
    header: 'Doc Type',
    cell: ({ getValue }) => <span className="text-zinc-300 text-sm capitalize">{getValue()?.replace('_', ' ')}</span>,
  },
  {
    accessorKey: 'document_url',
    header: 'Document',
    cell: ({ getValue }) => (
      <a 
        href={resolveDocumentUrl(getValue())} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white rounded-lg text-xs font-semibold transition-all"
      >
        <FileText size={12} />
        <span>View</span>
      </a>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue();
      const styles = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
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
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const { status, id } = row.original;
      if (status !== 'pending') return null;

      return (
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => table.options.meta.handlePreUpdateStatus(id, 'approved')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-lg transition-all font-bold text-xs cursor-pointer"
          >
            <CheckCircle size={13} />
            <span>Approve</span>
          </button>
          <button
            onClick={() => table.options.meta.handlePreUpdateStatus(id, 'rejected')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 rounded-lg transition-all font-bold text-xs cursor-pointer"
          >
            <XCircle size={13} />
            <span>Reject</span>
          </button>
        </div>
      );
    },
  },
];

const KycManagement = () => {
  const { documents, loading, fetchKyc, updateStatus } = useKyc();

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, status: null });

  const handlePreUpdateStatus = (id, status) => {
    setConfirmModal({ isOpen: true, id, status });
  };

  const handleUpdateStatus = async () => {
    await updateStatus(confirmModal.id, confirmModal.status);
    setConfirmModal({ isOpen: false, id: null, status: null });
  };

  const meta = {
    handlePreUpdateStatus,
  };

  return (
    <div className="w-full space-y-6">
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
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, status: null })}
        onConfirm={handleUpdateStatus}
        title={confirmModal.status === 'approved' ? "Confirm KYC Approval" : "Confirm KYC Rejection"}
        message={confirmModal.status === 'approved' ? "Are you sure you want to approve this KYC document?" : "Are you sure you want to reject this KYC document?"}
        confirmText={confirmModal.status === 'approved' ? "Approve" : "Reject"}
        isDestructive={confirmModal.status === 'rejected'}
      />
    </div>
  );
};

export default KycManagement;

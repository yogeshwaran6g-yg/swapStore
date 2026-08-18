import React, { useState, useMemo } from 'react';
import { RefreshCw, CheckCircle, XCircle, FileText, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKyc } from '../hooks/useKyc';
import { resolveDocumentUrl } from '../utils/documentUrl';
import { DataTable } from '../components/common/DataTable';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Pagination } from '../components/common/Pagination';
import DocumentPreviewModal from '../components/common/DocumentPreviewModal';

const kycColumns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <span className="text-zinc-500 text-xs font-mono">{row.index + 1}</span>,
  },
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
    accessorKey: 'user_uid',
    header: 'UID',
    cell: ({ getValue }) => {
      const uid = getValue();
      if (!uid) return <span className="text-zinc-600 italic text-xs">—</span>;
      return (
        <Link
          to={`/users/${uid}`}
          className="flex items-center gap-1.5 group"
          title={`View profile: ${uid}`}
        >
          <span className="text-zinc-300 font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 shadow-sm group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
            {uid.slice(0, 8)}…
          </span>
          <ExternalLink size={11} className="shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors" />
        </Link>
      );
    },
  },
  {
    accessorKey: 'document_type',
    header: 'Doc Type',
    cell: ({ getValue }) => <span className="text-zinc-300 text-sm capitalize">{getValue()?.replace('_', ' ')}</span>,
  },
  {
    accessorKey: 'document_url',
    header: 'Document',
    cell: ({ getValue, row, table }) => (
      <button 
        onClick={() => table.options.meta?.handleOpenPreview(getValue(), row.original.document_type, row.original.status)}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
      >
        <FileText size={12} />
        <span>View</span>
      </button>
    ),
  },
  {
    accessorKey: 'uploaded_at',
    header: 'Uploaded',
    cell: ({ getValue }) => {
      const d = new Date(getValue());
      if (isNaN(d)) return <span className="text-zinc-600 italic text-xs">—</span>;
      return (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-zinc-200">{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="text-[10px] text-zinc-500 font-medium">{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      );
    },
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

      return (
        <div className="flex items-center space-x-2.5">
          {status !== 'approved' && (
            <button
              onClick={() => table.options.meta.handlePreUpdateStatus(id, 'approved')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 rounded-lg transition-all font-bold text-xs cursor-pointer"
            >
              <CheckCircle size={13} />
              <span>Approve</span>
            </button>
          )}
          {status !== 'rejected' && (
            <button
              onClick={() => table.options.meta.handlePreUpdateStatus(id, 'rejected')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 rounded-lg transition-all font-bold text-xs cursor-pointer"
            >
              <XCircle size={13} />
              <span>Reject</span>
            </button>
          )}
        </div>
      );
    },
  },
];

const KycManagement = () => {
  const { documents, pagination, loading, fetchKyc, updateStatus, page, setPage } = useKyc();

  const [filterId, setFilterId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, status: null });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, url: null, title: null, status: null });

  const handleOpenPreview = (url, type, status) => {
    setPreviewModal({
      isOpen: true,
      url,
      title: type ? `${type.replace('_', ' ')} Document` : 'Document Preview',
      status
    });
  };

  const handlePreUpdateStatus = (id, status) => {
    setConfirmModal({ isOpen: true, id, status });
  };

  const handleUpdateStatus = async () => {
    await updateStatus(confirmModal.id, confirmModal.status);
    setConfirmModal({ isOpen: false, id: null, status: null });
  };

  const meta = {
    handlePreUpdateStatus,
    handleOpenPreview,
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchId = doc.id?.toString().toLowerCase().includes(filterId.toLowerCase());
      const matchUser = doc.user_uid?.toLowerCase().includes(filterUser.toLowerCase()) || 
                        doc.email?.toLowerCase().includes(filterUser.toLowerCase()) ||
                        doc.username?.toLowerCase().includes(filterUser.toLowerCase());
      const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
      return matchId && matchUser && matchStatus;
    });
  }, [documents, filterId, filterUser, filterStatus]);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">KYC Management</h1>
          <p className="mt-1 text-zinc-400">Review and approve user KYC documents</p>
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
            placeholder="Filter by KYC ID..."
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
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
         <h2 className="text-lg font-bold text-zinc-100 flex items-center capitalize">
            <div className={`w-2 h-2 rounded-full mr-3 ${filterStatus === 'pending' ? 'bg-amber-500 animate-pulse' : filterStatus === 'approved' ? 'bg-emerald-500' : filterStatus === 'rejected' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
            {filterStatus === 'all' ? 'All' : filterStatus} KYC Documents
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
        <>
          <DataTable data={filteredDocuments} columns={kycColumns} meta={meta} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
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

export default KycManagement;

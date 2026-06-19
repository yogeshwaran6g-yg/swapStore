import React from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { TokenNetworkCell } from '../common/TokenNetworkCell';

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied!', { duration: 1200, style: { fontSize: '12px', padding: '6px 12px' } });
      setTimeout(() => setCopied(false), 1400);
    } catch { toast.error('Copy failed'); }
  };
  if (!text) return null;
  return (
    <button onClick={handleCopy} className="ml-1 p-0.5 rounded hover:bg-zinc-700/60 text-zinc-500 hover:text-amber-400 transition-all inline-flex items-center" title="Copy">
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
};

const Truncate = ({ value, maxLen = 12, color = 'text-zinc-300' }) => {
  if (!value) return <span className="text-zinc-600 italic text-xs">—</span>;
  const display = value.length > maxLen ? `${value.substring(0, maxLen)}…` : value;
  return (
    <span className="inline-flex items-center space-x-1.5">
      <span className={`font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 shadow-sm ${color}`}>{display}</span>
      <CopyBtn text={value} />
    </span>
  );
};

const getBscScanUrl = (hash, network) => {
  if (!hash) return null;
  if (network?.toLowerCase() === 'polygon') return `https://polygonscan.com/tx/0x${hash}`;
  return `https://bscscan.com/tx/0x${hash}`;
};

export const swapColumns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <span className="text-zinc-500 text-xs font-mono">{row.index + 1}</span>,
  },
  {
    accessorKey: 'order_id',
    header: 'Swap Order ID',
    cell: (info) => <Truncate value={info.getValue()} maxLen={12} color="text-zinc-300" />,
  },
  {
    accessorKey: 'user_uid',
    header: 'UID',
    cell: (info) => {
      const uid = info.getValue();
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
    accessorKey: 'wallet_address',
    header: 'Wallet',
    cell: (info) => <Truncate value={info.getValue()} maxLen={10} color="text-zinc-300" />,
  },


  {
    accessorKey: 'token_symbol',
    header: 'Token',
    cell: ({ row: { original } }) => (
      <TokenNetworkCell token={original.token_symbol} network={original.network} />
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (info) => (
      <span className="font-extrabold text-sm text-emerald-400 tabular-nums tracking-tight">{parseFloat(info.getValue()).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: 'tx_hash',
    header: 'Tx Hash',
    cell: ({ row: { original } }) => {
      const hash = original.tx_hash;
      if (!hash) return <span className="text-zinc-500 italic text-xs bg-zinc-950/40 px-2 py-1 rounded-lg border border-zinc-850">Pending</span>;
      const url = getBscScanUrl(hash, original.network);
      return (
        <span className="inline-flex items-center space-x-1.5">
          <span className="font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 text-zinc-300 tracking-wide">{hash.substring(0, 10)}…</span>
          <CopyBtn text={hash} />
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-amber-500 transition-all" title="View on Explorer">
              <ExternalLink size={12} />
            </a>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: 'user_crypto_payment_status',
    header: 'Crypto',
    cell: (info) => {
      const status = info.getValue() || 'pending';
      const styles = {
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5',
        processing: 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/5',
        failed: 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-rose-500/5',
        pending: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
      };
      return (
        <span className={`px-2 py-1 text-[10px] font-extrabold rounded-md border shadow-sm uppercase tracking-widest ${styles[status.toLowerCase()] || styles.pending}`}>
          {status}
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
    accessorKey: 'admin_inr_payment_status',
    header: 'INR Payout',
    cell: ({ getValue, row: { original }, table }) => {
      const status = getValue();
      const updateStatus = table.options.meta?.handlePreUpdateStatus;
      const styles = {
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        processing: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        failed: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
        pending: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/60',
      };
      return (
        <select
          value={status}
          onChange={(e) => updateStatus && updateStatus(original.order_id, e.target.value)}
          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md border focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all uppercase tracking-widest cursor-pointer ${styles[status] || styles.pending}`}
        >
          <option value="pending" className="bg-zinc-900 text-zinc-300">PENDING</option>
          <option value="processing" className="bg-zinc-900 text-amber-400">PROCESSING</option>
          <option value="completed" className="bg-zinc-900 text-emerald-400">COMPLETED</option>
          <option value="failed" className="bg-zinc-900 text-rose-400">FAILED</option>
        </select>
      );
    },
  },
  {
    id: 'bank_action',
    header: '',
    cell: ({ row: { original }, table }) => {
      const onViewBank = table.options.meta?.onViewBankDetails;
      return (
        <button
          onClick={() => onViewBank && onViewBank(original)}
          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white transition-all"
        >
          Bank Info
        </button>
      );
    },
  },
];

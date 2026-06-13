import React from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <span className="inline-flex items-center">
      <span className={`font-mono text-xs tracking-wide ${color}`}>{display}</span>
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
    accessorKey: 'user_uid',
    header: () => <span className="text-violet-400">User ID</span>,
    cell: (info) => <Truncate value={info.getValue()} maxLen={10} color="text-violet-300" />,
  },
  {
    accessorKey: 'wallet_address',
    header: () => <span className="text-sky-400">Wallet</span>,
    cell: (info) => <Truncate value={info.getValue()} maxLen={10} color="text-sky-300" />,
  },
  {
    accessorKey: 'order_id',
    header: () => <span className="text-amber-400">Swap Order ID</span>,
    cell: (info) => <Truncate value={info.getValue()} maxLen={12} color="text-amber-300/80" />,
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
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
    accessorKey: 'token_symbol',
    header: 'Token',
    cell: ({ row: { original } }) => {
      const symbol = original.token_symbol || '—';
      const network = original.network || '';
      const networkColor = network.toLowerCase() === 'polygon' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      return (
        <div className="flex flex-col gap-1">
          <span className="font-extrabold text-sm text-zinc-100 tracking-wide">{symbol}</span>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border w-fit ${networkColor}`}>{network}</span>
        </div>
      );
    },
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
    header: () => <span className="text-teal-400">Tx Hash</span>,
    cell: ({ row: { original } }) => {
      const hash = original.tx_hash;
      if (!hash) return <span className="text-zinc-600 italic text-xs">Pending</span>;
      const url = getBscScanUrl(hash, original.network);
      return (
        <span className="inline-flex items-center gap-1">
          <span className="font-mono text-xs text-teal-300/80 tracking-wide">{hash.substring(0, 10)}…</span>
          <CopyBtn text={hash} />
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-0.5 rounded hover:bg-teal-500/10 text-zinc-500 hover:text-teal-400 transition-all" title="View on Explorer">
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
      const status = info.getValue();
      const styles = {
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5',
        processing: 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/5',
        failed: 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-rose-500/5',
        pending: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
      };
      return (
        <span className={`px-2 py-1 text-[10px] font-extrabold rounded-md border shadow-sm uppercase tracking-widest ${styles[status] || styles.pending}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'admin_inr_payment_status',
    header: 'INR Payout',
    cell: ({ getValue, row: { original }, table }) => {
      const status = getValue();
      const updateStatus = table.options.meta?.updateStatus;
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
          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 hover:from-amber-500/20 hover:to-orange-500/20 hover:text-amber-300 transition-all"
        >
          Bank Info
        </button>
      );
    },
  },
];

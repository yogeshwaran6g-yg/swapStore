import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, User, Copy, Check } from 'lucide-react';
import UserBalances from './UserBalances';

const CopyableCell = ({ value, displayValue }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center space-x-1.5">
      <span className="text-zinc-300 font-mono text-xs bg-zinc-950/60 px-2 py-1 rounded-lg border border-zinc-800/80 shadow-sm">
        {displayValue || value || '-'}
      </span>
      {value && (
        <button 
          onClick={handleCopy} 
          className="text-zinc-500 hover:text-amber-500 hover:bg-zinc-800/80 transition-colors p-1 rounded-lg border border-transparent hover:border-zinc-700/60"
          title="Copy to clipboard"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      )}
    </div>
  );
};

export const userColumns = [
  {
    accessorKey: 'uid',
    header: 'UID',
    cell: ({ getValue }) => (
      <CopyableCell value={getValue()} displayValue={getValue()?.slice(0, 8) + '...'} />
    ),
  },

  {
    accessorKey: 'wallet_address',
    header: 'Wallet',
    cell: ({ getValue }) => (
      <CopyableCell value={getValue()} displayValue={getValue() ? getValue().slice(0, 6) + '...' + getValue().slice(-4) : '-'} />
    ),
  },
  {
    id: 'balances',
    header: 'Balances',
    cell: ({ row }) => <UserBalances walletAddress={row.original.wallet_address} />,
  },
  {
    accessorKey: 'kyc_status',
    header: 'KYC Status',
    cell: ({ getValue }) => {
      const status = getValue();
      const styles = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
        submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
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
    accessorKey: 'is_blocked',
    header: 'Status',
    cell: ({ getValue }) => {
      const isBlocked = getValue() === 1;
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
            isBlocked
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {isBlocked ? 'Blocked' : 'Active'}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ getValue }) => <span className="text-zinc-400 text-xs">{new Date(getValue()).toLocaleDateString()}</span>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const user = row.original;
      const isBlocked = user.is_blocked;
      const toggleBlock = table.options.meta?.toggleBlock;

      return (
        <div className="flex items-center space-x-2.5">
          <Link 
            to={`/users/${user.uid}`}
            className="flex items-center text-xs px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/60 hover:bg-zinc-700 hover:text-white transition-all font-semibold"
          >
            <User size={13} className="mr-1.5" /> Profile
          </Link>
          <button
            onClick={() => toggleBlock && toggleBlock(user.uid, !isBlocked)}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isBlocked 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/25'
            }`}
          >
            <ShieldAlert size={13} className="mr-1.5" />
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      );
    },
  },
];

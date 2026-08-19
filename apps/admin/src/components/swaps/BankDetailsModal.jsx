import React from 'react';
import { X, Building2, User, Hash, Landmark, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CopyField = ({ label, value, icon: Icon }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied!', { duration: 1200, style: { fontSize: '12px', padding: '6px 12px' } });
      setTimeout(() => setCopied(false), 1400);
    } catch { toast.error('Copy failed'); }
  };

  return (
    <div className="group bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-700/60 transition-all flex items-center justify-between">
      <div className="flex items-start space-x-3.5">
        <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-2.5 rounded-lg border border-amber-500/10">
          <Icon className="text-amber-500" size={18} />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-widest">{label}</p>
          <p className="text-zinc-200 font-bold font-mono tracking-wide text-sm">{value || <span className="text-zinc-600 italic font-normal">Not provided</span>}</p>
        </div>
      </div>
      {value && (
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/60 text-zinc-500 hover:text-amber-400 transition-all border border-zinc-800 hover:border-zinc-700 opacity-0 group-hover:opacity-100"
          title="Copy"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      )}
    </div>
  );
};

export const BankDetailsModal = ({ isOpen, onClose, bankDetails }) => {
  if (!isOpen || !bankDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden" style={{ animation: 'modalIn 0.2s ease-out' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900 to-zinc-900/80">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center tracking-tight">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 p-2 rounded-lg border border-amber-500/10 mr-3">
              <Building2 className="text-amber-500" size={18} />
            </div>
            Bank Details
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 p-2 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Swap Context */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-500 font-medium">Order:</span>
            <span className="font-mono text-amber-400/80 font-bold tracking-wide">{bankDetails.order_id?.substring(0, 16)}…</span>
            <span className="text-zinc-700">|</span>
            <span className="font-extrabold text-emerald-400">{bankDetails.amount} {bankDetails.token_symbol}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-3 space-y-3">
          <CopyField label="Account Holder" value={bankDetails.account_holder_name} icon={User} />
          <CopyField label="Account Number" value={bankDetails.account_number} icon={Hash} />
          <CopyField label="IFSC Code" value={bankDetails.ifsc_code} icon={Landmark} />
          <CopyField label="Bank Name" value={bankDetails.bank_name} icon={Building2} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm rounded-lg transition-all border border-zinc-700 hover:border-zinc-600"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

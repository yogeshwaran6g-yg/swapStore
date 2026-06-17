import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-md overflow-hidden" style={{ animation: 'modalIn 0.2s ease-out' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900 to-zinc-900/80">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center tracking-tight">
            <div className={`p-2 rounded-lg border mr-3 ${isDestructive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              <AlertTriangle size={18} />
            </div>
            {title}
          </h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 p-2 rounded-lg transition-all disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm rounded-lg transition-all border border-zinc-700 hover:border-zinc-600 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 font-bold text-sm rounded-lg transition-all shadow-lg flex items-center justify-center min-w-[100px] ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-900/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
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

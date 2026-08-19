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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-white border border-[#FF8C00]/20 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] w-full max-w-md overflow-hidden" style={{ animation: 'modalIn 0.2s ease-out' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-lg font-bold text-[#1E293B] flex items-center tracking-tight">
            <div className={`p-2 rounded-xl border mr-3 ${isDestructive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#FF8C00]/10 border-[#FF8C00]/20 text-[#FF8C00]'}`}>
              <AlertTriangle size={18} strokeWidth={2.5} />
            </div>
            {title}
          </h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-[#FF8C00] hover:bg-[#FF8C00]/10 p-2 rounded-xl transition-all disabled:opacity-50"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-[#475569] text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-[#475569] font-bold text-sm rounded-xl transition-all border border-gray-200 hover:border-gray-300 disabled:opacity-50 shadow-sm"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center min-w-[120px] ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_15px_rgba(239,68,68,0.2)]' 
                : 'bg-gradient-to-r from-[#FF8C00] to-[#FF4500] hover:opacity-90 text-white shadow-[0_4px_15px_rgba(255,140,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,140,0,0.3)]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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


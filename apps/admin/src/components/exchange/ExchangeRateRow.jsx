import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export const ExchangeRateRow = ({ rate, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(rate.inr_rate);

  const handleSave = async () => {
    try {
      await onSave(rate, editValue);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update rate.');
    }
  };

  const handleCancel = () => {
    setEditValue(rate.inr_rate);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold mr-3 border border-amber-500/20">
            {rate.token_symbol.charAt(0)}
          </div>
          <span className="font-semibold text-zinc-100">{rate.token_symbol}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md text-xs font-medium border border-zinc-700">
          {rate.network}
        </span>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 font-medium">₹</span>
            <input
              type="number"
              step="0.01"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-28 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              autoFocus
            />
          </div>
        ) : (
          <span className="font-semibold text-lg text-zinc-100">₹ {rate.inr_rate}</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-zinc-500">
        {new Date(rate.updated_at).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-right">
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSave}
              className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
              title="Save"
            >
              <Check size={18} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 rounded-lg transition-colors"
              title="Cancel"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-zinc-800 text-zinc-400 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 rounded-lg transition-all border border-transparent"
            title="Edit Rate"
          >
            <Edit2 size={18} />
          </button>
        )}
      </td>
    </tr>
  );
};

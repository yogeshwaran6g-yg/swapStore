import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export const AddRateForm = ({ onAdd, onCancel }) => {
  const [newToken, setNewToken] = useState('');
  const [newNetwork, setNewNetwork] = useState('');
  const [newRate, setNewRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newToken || !newRate) {
      alert('Token and Rate are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAdd(newToken, newNetwork, newRate);
    } catch (error) {
      alert('Failed to add rate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="bg-amber-500/5 border-b border-amber-500/20">
      <td className="px-6 py-4">
        <input
          type="text"
          placeholder="e.g. USDT"
          value={newToken}
          onChange={(e) => setNewToken(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-zinc-600 uppercase"
          autoFocus
          disabled={isSubmitting}
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          placeholder="e.g. bnb"
          value={newNetwork}
          onChange={(e) => setNewNetwork(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-zinc-600"
          disabled={isSubmitting}
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-zinc-500 font-medium">₹</span>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            className="w-28 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-zinc-600"
            disabled={isSubmitting}
          />
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-zinc-500">
        -
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 disabled:opacity-50"
            title="Save"
          >
            <Check size={18} />
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 rounded-lg transition-colors disabled:opacity-50"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

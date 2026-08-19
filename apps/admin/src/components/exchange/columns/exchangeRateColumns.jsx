import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

const RateEditor = ({ getValue, row: { original }, column: { id }, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const isEditing = table.options.meta?.editingId === original.id;

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-zinc-500 font-medium">₹</span>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          autoFocus
        />
      </div>
    );
  }

  return (
    <span className="font-extrabold text-sm text-zinc-100 bg-zinc-950/60 px-2.5 py-1 rounded-lg border border-zinc-800/80 shadow-sm">
      ₹ {initialValue}
    </span>
  );
};

const ActionCell = ({ row: { original }, table }) => {
  const isEditing = table.options.meta?.editingId === original.id;
  const updateRate = table.options.meta?.updateRate;
  const setEditingId = table.options.meta?.setEditingId;

  // We need a way to get the current input value for this row.
  // In a robust implementation, we'd manage state per row, or use a form.
  // For simplicity with react-table, we can either store the pending edit in the meta state,
  // or use an internal component state. Since RateEditor has internal state, it's tricky to read from outside.
  // Wait, let's fix this by not having an internal state in RateEditor, or passing the save function down.
  // Actually, the simplest way is to handle the edit state outside React Table if we want a single row editing,
  // OR we can make the row a custom component. But React Table is just a table. 

  return (
    <div className="flex justify-end space-x-2">
      {isEditing ? (
        <>
          <button
            onClick={() => table.options.meta?.handleSave(original)}
            className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
            title="Save"
          >
            <Check size={18} />
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 rounded-lg transition-colors"
            title="Cancel"
          >
            <X size={18} />
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setEditingId(original.id);
            table.options.meta?.setEditValue(original.inr_rate);
          }}
          className="p-2 bg-zinc-800 text-zinc-400 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 rounded-lg transition-all border border-transparent"
          title="Edit Rate"
        >
          <Edit2 size={18} />
        </button>
      )}
    </div>
  );
};

export const columns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <span className="text-zinc-500 text-xs font-mono">{row.index + 1}</span>,
  },
  {
    accessorKey: 'token_symbol',
    header: 'Token',
    cell: (info) => {
      const symbol = info.getValue();
      const getLogoUrl = (sym) => {
        const s = sym.toUpperCase();
        if (s === 'USDT') return 'https://cryptologos.cc/logos/tether-usdt-logo.png';
        if (s === 'USDC') return 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';
        if (s === 'DAI') return 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png';
        return `https://cryptologos.cc/logos/${s.toLowerCase()}-${s.toLowerCase()}-logo.png`; // Fallback attempt
      };

      return (
        <div className="flex items-center">
          <img
            src={getLogoUrl(symbol)}
            alt={symbol}
            className="h-8 w-8 rounded-full mr-3 border border-zinc-800 bg-white"
            onError={(e) => {
              e.target.onerror = null;
              // Hide image and show fallback generic circle if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{ display: 'none' }} className="h-8 w-8 rounded-full bg-amber-500/10 items-center justify-center text-amber-500 font-bold mr-3 border border-amber-500/20">
            {symbol.charAt(0)}
          </div>
          <span className="font-semibold text-zinc-100">{symbol}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'network',
    header: 'Network',
    cell: (info) => (
      <span className="px-2.5 py-1 bg-zinc-950/60 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-800/80 shadow-sm">
        {info.getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'inr_rate',
    header: 'Rate (INR)',
    cell: ({ getValue, row: { original }, table }) => {
      const isEditing = table.options.meta?.editingId === original.id;
      if (isEditing) {
        return (
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 font-medium">₹</span>
            <input
              type="number"
              step="0.01"
              value={table.options.meta.editValue}
              onChange={(e) => table.options.meta.setEditValue(e.target.value)}
              className="w-28 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              autoFocus
            />
          </div>
        );
      }
      return (
        <span className="font-extrabold text-sm text-zinc-100 bg-zinc-950/60 px-2.5 py-1 rounded-lg border border-zinc-800/80 shadow-sm">
          ₹ {getValue()}
        </span>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ getValue, row: { original }, table }) => {
      const isActive = getValue() === 1;
      const toggleRateActive = table.options.meta?.toggleRateActive;

      return (
        <button
          onClick={() => toggleRateActive && toggleRateActive(original, !isActive)}
          className={`px-2.5 py-0.5 text-xs font-bold rounded-full border transition-all ${isActive
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-850 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      );
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Last Updated',
    cell: (info) => (
      <span className="text-xs text-zinc-500">
        {new Date(info.getValue()).toLocaleString()}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ActionCell,
  },
];

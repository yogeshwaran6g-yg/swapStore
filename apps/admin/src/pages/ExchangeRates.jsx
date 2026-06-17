import React, { useState, useMemo } from 'react';
import { RefreshCw, Plus, Search } from 'lucide-react';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { AddRateForm } from '../components/exchange/AddRateForm';
import { DataTable } from '../components/common/DataTable';
import { columns } from '../components/exchange/columns/exchangeRateColumns';
import { toast } from "react-hot-toast";


const ExchangeRates = () => {
  const { rates, loading, fetchRates, addRate, updateRate } = useExchangeRates();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [filterToken, setFilterToken] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('');

  const handleAdd = async (token, network, rate) => {
    await addRate(token, network, rate, true);
    setIsAdding(false);
  };

  const handleSave = async (rateObj) => {
    await updateRate(rateObj, editValue, undefined);
    setEditingId(null);
  };

  const toggleRateActive = async (rateObj, newIsActive) => {
    await updateRate(rateObj, undefined, newIsActive);
  };

  const refetchRates = () => {
    try {
      fetchRates();
      toast.success("Refreshed Successfully")
    } catch (err) {
      toast.error("Something went wrong unable to refresh")
      console.log("Something went wrong unable to refresh");
    }
  };

  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      const matchToken = rate.token_symbol.toLowerCase().includes(filterToken.toLowerCase());
      const matchNetwork = rate.network.toLowerCase().includes(filterNetwork.toLowerCase());
      return matchToken && matchNetwork;
    });
  }, [rates, filterToken, filterNetwork]);

  const meta = {
    editingId,
    setEditingId,
    editValue,
    setEditValue,
    handleSave,
    toggleRateActive,
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Exchange Rates</h1>
          <p className="mt-1 text-zinc-400">Manage your token to INR conversion rates</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Rate</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-zinc-900/50 rounded-2xl shadow-xl border border-zinc-800/50 overflow-hidden backdrop-blur-xl mb-6">
          <table className="w-full text-left">
            <tbody>
              <AddRateForm
                onAdd={handleAdd}
                onCancel={() => setIsAdding(false)}
              />
            </tbody>
          </table>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col sm:flex-row gap-4 mb-6 backdrop-blur-xl">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Filter by Token..."
            value={filterToken}
            onChange={(e) => setFilterToken(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
          />
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Filter by Network..."
            value={filterNetwork}
            onChange={(e) => setFilterNetwork(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
        <button
          onClick={refetchRates}
          className="p-2 text-zinc-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
          title="Refresh Rates"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
        </button>
      </div>

      {loading && rates.length === 0 ? (
        <div className="py-12 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-zinc-500 font-medium">Loading rates...</p>
          </div>
        </div>
      ) : (
        <DataTable data={filteredRates} columns={columns} meta={meta} />
      )}
    </div>
  );
};

export default ExchangeRates;



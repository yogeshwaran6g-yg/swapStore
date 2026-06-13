import React, { useState, useMemo } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { useSwaps } from '../hooks/useSwaps';
import { DataTable } from '../components/common/DataTable';
import { swapColumns } from '../components/swaps/swapColumns';
import { BankDetailsModal } from '../components/swaps/BankDetailsModal';

const SwapOrders = () => {
  const { swaps, loading, fetchSwaps, updateStatus } = useSwaps();
  
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await updateStatus(orderId, newStatus);
  };

  const handleViewBankDetails = (swapData) => {
    setSelectedBankDetails(swapData);
    setIsModalOpen(true);
  };

  const filteredSwaps = useMemo(() => {
    return swaps.filter(swap => {
      const matchOrderId = swap.order_id?.toLowerCase().includes(filterOrderId.toLowerCase());
      const matchUser = swap.username?.toLowerCase().includes(filterUser.toLowerCase()) || 
                        swap.wallet_address?.toLowerCase().includes(filterUser.toLowerCase()) ||
                        swap.user_uid?.toLowerCase().includes(filterUser.toLowerCase());
      return matchOrderId && matchUser;
    });
  }, [swaps, filterOrderId, filterUser]);

  const meta = {
    updateStatus: handleUpdateStatus,
    onViewBankDetails: handleViewBankDetails,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Swap Orders</h1>
          <p className="mt-1 text-zinc-400">Manage user crypto swaps and INR payouts</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col sm:flex-row gap-4 mb-6 backdrop-blur-xl">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Filter by Order ID..."
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
          />
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Filter by User (Username/Wallet/UID)..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
         <h2 className="text-lg font-bold text-zinc-100 flex items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 mr-3 animate-pulse"></div>
            Recent Orders
         </h2>
         <button
            onClick={fetchSwaps}
            className="p-2 text-zinc-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
            title="Refresh Orders"
         >
            <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
         </button>
      </div>

      {loading && swaps.length === 0 ? (
        <div className="py-12 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-zinc-500 font-medium">Loading swap orders...</p>
          </div>
        </div>
      ) : (
        <DataTable data={filteredSwaps} columns={swapColumns} meta={meta} />
      )}

      {/* Bank Details Modal */}
      <BankDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        bankDetails={selectedBankDetails} 
      />
    </div>
  );
};

export default SwapOrders;

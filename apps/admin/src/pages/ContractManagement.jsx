import React, { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';
import toast from 'react-hot-toast';
import { Network, Cpu, ShieldAlert, Save, RefreshCw, Wallet } from 'lucide-react';
import { CRYPTO_LOAN_ABI, CONTRACT_ADDRESSES, SWAP_ABI, SWAP_CONTRACT_ADDRESSES } from '../config/contracts';
import { ConfirmModal } from '../components/common/ConfirmModal';

const ContractManagement = () => {
  const { isConnected } = useAppKitAccount();
  const [network, setNetwork] = useState('bsc'); // 'bsc' or 'polygon'
  const [contractType, setContractType] = useState('loan'); // 'loan' or 'swap'
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { functionName, args, label }

  // ── Form States ──
  const [loanForms, setLoanForms] = useState({
    setAdmin: '',
    updateLoanWallet: '',
    updateInterestWallet: '',
    updateFeeWallet: '',
  });

  const [swapForms, setSwapForms] = useState({
    setAdmin: '',
  });

  // ── Contract Addresses ──
  const loanAddress = CONTRACT_ADDRESSES[network];
  const swapAddress = SWAP_CONTRACT_ADDRESSES[network];

  // ── Read Configurations ──
  const { data: loanConfig, refetch: refetchLoan, isLoading: isLoanLoading } = useReadContract({
    address: loanAddress,
    abi: CRYPTO_LOAN_ABI,
    functionName: 'getConfig',
    query: {
      enabled: !!loanAddress && contractType === 'loan',
    }
  });

  const { data: swapConfig, refetch: refetchSwap, isLoading: isSwapLoading } = useReadContract({
    address: swapAddress,
    abi: SWAP_ABI,
    functionName: 'getConfig',
    query: {
      enabled: !!swapAddress && contractType === 'swap',
    }
  });

  // ── Write Configuration ──
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const handleInputChange = (type, field, value) => {
    if (type === 'loan') {
      setLoanForms(prev => ({ ...prev, [field]: value }));
    } else {
      setSwapForms(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateAddress = (addr) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handlePreSubmit = (functionName, label) => {
    const value = contractType === 'loan' ? loanForms[functionName] : swapForms[functionName];
    
    if (!isConnected) {
      toast.error('Please connect your admin wallet first.');
      return;
    }

    if (!value || !validateAddress(value)) {
      toast.error('Please enter a valid EVM address (0x...)');
      return;
    }

    setPendingAction({ functionName, args: [value], label, value });
    setIsConfirmModalOpen(true);
  };

  const executeTransaction = async () => {
    setIsConfirmModalOpen(false);
    if (!pendingAction) return;

    try {
      toast.loading(`Executing ${pendingAction.label}...`, { id: 'tx' });
      
      await writeContractAsync({
        address: contractType === 'loan' ? loanAddress : swapAddress,
        abi: contractType === 'loan' ? CRYPTO_LOAN_ABI : SWAP_ABI,
        functionName: pendingAction.functionName,
        args: pendingAction.args,
      });

      toast.success(`${pendingAction.label} transaction submitted. Waiting for confirmation...`, { id: 'tx' });
      
      // We can't await useWaitForTransactionReceipt easily here without a separate component or useEffect,
      // but assuming it's confirmed shortly we can just refetch after a delay.
      setTimeout(() => {
        if (contractType === 'loan') refetchLoan();
        else refetchSwap();
        toast.success(`${pendingAction.label} successful!`, { id: 'tx' });
        
        // Reset form
        handleInputChange(contractType, pendingAction.functionName, '');
      }, 5000);

    } catch (error) {
      console.error(error);
      toast.error(error.shortMessage || error.message || 'Transaction failed', { id: 'tx' });
    } finally {
      setPendingAction(null);
    }
  };

  const isLoading = contractType === 'loan' ? isLoanLoading : isSwapLoading;
  const currentConfig = contractType === 'loan' ? loanConfig : swapConfig;

  const renderConfigBox = (label, value) => (
    <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/50">
      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="font-mono text-sm text-amber-400 break-all">
        {isLoading ? 'Loading...' : formatConfigValue(value)}
      </p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center space-x-2">
            <Cpu className="text-amber-500 w-6 h-6" />
            <span>On-Chain Contracts</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage contract configuration directly on-chain.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setNetwork('bsc')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              network === 'bsc' ? 'bg-amber-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            BSC
          </button>
          <button
            onClick={() => setNetwork('polygon')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              network === 'polygon' ? 'bg-violet-500 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Polygon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <button
            onClick={() => setContractType('loan')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              contractType === 'loan' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Network size={20} />
              <span className="font-bold">Loan Contract</span>
            </div>
          </button>

          <button
            onClick={() => setContractType('swap')}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              contractType === 'swap' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <RefreshCw size={20} />
              <span className="font-bold">Swap Contract</span>
            </div>
          </button>

          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mt-6">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-rose-400 mb-1">Security Warning</h4>
                <p className="text-xs text-rose-300/70 leading-relaxed">
                  These actions interact directly with the blockchain. Modifying the Admin address will immediately revoke your current wallet's permissions. Ensure the new address is fully secured.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current State Panel */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
                <Wallet className="text-amber-500" size={20} />
                <span className="capitalize">{contractType} Contract State</span>
              </h2>
              <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Network: {network}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contractType === 'loan' ? (
                <>
                  {renderConfigBox('Admin Address', currentConfig?.[1])}
                  {renderConfigBox('Loan Wallet', currentConfig?.[2])}
                  {renderConfigBox('Interest Wallet', currentConfig?.[3])}
                  {renderConfigBox('Fee Wallet', currentConfig?.[4])}
                </>
              ) : (
                <>
                  {renderConfigBox('Owner Address', currentConfig?.[0])}
                  {renderConfigBox('Admin Address', currentConfig?.[1])}
                  {renderConfigBox('Pending Owner', currentConfig?.[2])}
                  {renderConfigBox('Paused', currentConfig?.[3])}
                  {renderConfigBox('Accepted Token Count', currentConfig?.[4])}
                </>
              )}
            </div>
          </div>

          {/* Update Forms */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 p-6 backdrop-blur-xl space-y-6">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">
              {contractType === 'loan' ? 'Modify Assignments' : 'Modify Swap Admin'}
            </h2>

            {contractType === 'loan' ? (
              <>
                <UpdateField
                  label="Set New Admin"
                  value={loanForms.setAdmin}
                  onChange={(v) => handleInputChange('loan', 'setAdmin', v)}
                  onSave={() => handlePreSubmit('setAdmin', 'Update Admin')}
                  isSaving={isWriting}
                  placeholder="0x..."
                  isDestructive
                />
                <UpdateField
                  label="Update Loan Wallet"
                  value={loanForms.updateLoanWallet}
                  onChange={(v) => handleInputChange('loan', 'updateLoanWallet', v)}
                  onSave={() => handlePreSubmit('updateLoanWallet', 'Update Loan Wallet')}
                  isSaving={isWriting}
                  placeholder="0x..."
                />
                <UpdateField
                  label="Update Interest Wallet"
                  value={loanForms.updateInterestWallet}
                  onChange={(v) => handleInputChange('loan', 'updateInterestWallet', v)}
                  onSave={() => handlePreSubmit('updateInterestWallet', 'Update Interest Wallet')}
                  isSaving={isWriting}
                  placeholder="0x..."
                />
                <UpdateField
                  label="Update Fee Wallet"
                  value={loanForms.updateFeeWallet}
                  onChange={(v) => handleInputChange('loan', 'updateFeeWallet', v)}
                  onSave={() => handlePreSubmit('updateFeeWallet', 'Update Fee Wallet')}
                  isSaving={isWriting}
                  placeholder="0x..."
                />
              </>
            ) : (
              <UpdateField
                label="Set New Admin"
                value={swapForms.setAdmin}
                onChange={(v) => handleInputChange('swap', 'setAdmin', v)}
                onSave={() => handlePreSubmit('setAdmin', 'Update Admin')}
                isSaving={isWriting}
                placeholder="0x..."
                isDestructive
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeTransaction}
        title={`Confirm ${pendingAction?.label}`}
        message={
          pendingAction?.functionName === 'setAdmin' 
            ? `WARNING: You are about to transfer ADMIN privileges to ${pendingAction?.value}. Your current wallet will immediately lose all administrative access on the ${network.toUpperCase()} network. This cannot be undone by you.`
            : `Are you sure you want to update the wallet address to ${pendingAction?.value} on the ${network.toUpperCase()} network?`
        }
        confirmText="Confirm & Sign"
        isDestructive={pendingAction?.functionName === 'setAdmin'}
      />
    </div>
  );
};

const formatConfigValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return 'Loading or Not Set';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return value.toString();
};

// ── Reusable Field Component ──
const UpdateField = ({ label, value, onChange, onSave, isSaving, placeholder, isDestructive }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div className="sm:pt-6">
        <button
          onClick={onSave}
          disabled={isSaving || !value}
          className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
            isDestructive 
              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' 
              : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20'
          }`}
        >
          <Save size={16} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default ContractManagement;

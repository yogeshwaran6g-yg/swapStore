import React, { useMemo, useState } from 'react';
import { useWriteContract } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';
import toast from 'react-hot-toast';
import { Network, Cpu, ShieldAlert, Save, RefreshCw } from 'lucide-react';
import { CRYPTO_LOAN_ABI, CONTRACT_ADDRESSES, SWAP_ABI, SWAP_CONTRACT_ADDRESSES } from '../config/contracts';
import { ConfirmModal } from '../components/common/ConfirmModal';

const CONTRACT_TYPES = {
  loan: {
    label: 'Loan Contract',
    abi: CRYPTO_LOAN_ABI,
    actions: [
      {
        key: 'setAdmin',
        label: 'Set New Admin Wallet',
        actionLabel: 'Update Loan Admin Wallet',
        helper: 'Transfers loan contract admin control to a new wallet.',
        destructive: true,
      },
      {
        key: 'updateInterestWallet',
        label: 'Set Interest Collector Wallet',
        actionLabel: 'Update Interest Collector Wallet',
        helper: 'Updates the wallet that receives collected interest.',
        destructive: false,
      },
    ],
  },
  swap: {
    label: 'Swap Gateway',
    abi: SWAP_ABI,
    actions: [
      {
        key: 'setAdmin',
        label: 'Set New Admin Wallet',
        actionLabel: 'Update Swap Admin Wallet',
        helper: 'Transfers swap gateway admin control to a new wallet.',
        destructive: true,
      },
    ],
  },
};

const NETWORK_LABELS = {
  bsc: 'BSC',
  polygon: 'Polygon',
};

const ContractManagement = () => {
  const { isConnected } = useAppKitAccount();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [network, setNetwork] = useState('bsc');
  const [contractType, setContractType] = useState('loan');
  const [formValues, setFormValues] = useState({
    loan: { setAdmin: '', updateInterestWallet: '' },
    swap: { setAdmin: '' },
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const selectedContractAddress = contractType === 'loan'
    ? CONTRACT_ADDRESSES[network]
    : SWAP_CONTRACT_ADDRESSES[network];

  const selectedConfig = useMemo(() => CONTRACT_TYPES[contractType], [contractType]);

  const validateAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [contractType]: {
        ...prev[contractType],
        [field]: value,
      },
    }));
  };

  const handlePreSubmit = (action) => {
    const value = formValues[contractType][action.key];

    if (!isConnected) {
      toast.error('Please connect your admin wallet first.');
      return;
    }

    if (!selectedContractAddress || !validateAddress(selectedContractAddress)) {
      toast.error(`No ${selectedConfig.label.toLowerCase()} address is configured for ${NETWORK_LABELS[network]}.`);
      return;
    }

    if (!value || !validateAddress(value)) {
      toast.error('Please enter a valid EVM address (0x...).');
      return;
    }

    setPendingAction({
      address: selectedContractAddress,
      abi: selectedConfig.abi,
      functionName: action.key,
      args: [value],
      label: action.actionLabel,
      value,
      destructive: action.destructive,
    });
    setIsConfirmModalOpen(true);
  };

  const executeTransaction = async () => {
    setIsConfirmModalOpen(false);
    if (!pendingAction) return;

    try {
      toast.loading(`Executing ${pendingAction.label}...`, { id: 'tx' });

      await writeContractAsync({
        address: pendingAction.address,
        abi: pendingAction.abi,
        functionName: pendingAction.functionName,
        args: pendingAction.args,
      });

      toast.success(`${pendingAction.label} transaction submitted.`, { id: 'tx' });
      setFormValues((prev) => ({
        ...prev,
        [contractType]: {
          ...prev[contractType],
          [pendingAction.functionName]: '',
        },
      }));
    } catch (error) {
      console.error(error);
      toast.error(error.shortMessage || error.message || 'Transaction failed', { id: 'tx' });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center space-x-2">
            <Cpu className="text-amber-500 w-6 h-6" />
            <span>On-Chain Contracts</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Update only the active contract wallets and admin roles.
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
              <span className="font-bold">Swap Gateway</span>
            </div>
          </button>

          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mt-6">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-rose-400 mb-1">Security Warning</h4>
                <p className="text-xs text-rose-300/70 leading-relaxed">
                  Confirm each wallet update carefully. Admin changes transfer control immediately after the transaction succeeds.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 p-6 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">{selectedConfig.label}</h2>
              <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Network: {NETWORK_LABELS[network]}
              </span>
            </div>

            {selectedConfig.actions.map((action) => (
              <UpdateField
                key={action.key}
                label={action.label}
                value={formValues[contractType][action.key] || ''}
                onChange={(value) => handleInputChange(action.key, value)}
                onSave={() => handlePreSubmit(action)}
                isSaving={isWriting}
                placeholder="0x..."
                helperText={action.helper}
                isDestructive={action.destructive}
              />
            ))}
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
            ? `You are about to transfer admin control to ${pendingAction?.value} on ${NETWORK_LABELS[network]}. Your current wallet will lose admin access after this transaction succeeds.`
            : `You are about to update the wallet to ${pendingAction?.value} on ${NETWORK_LABELS[network]}.`
        }
        confirmText="Confirm & Sign"
        isDestructive={pendingAction?.destructive}
      />
    </div>
  );
};

const UpdateField = ({ label, value, onChange, onSave, isSaving, placeholder, helperText, isDestructive }) => {
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
        <p className="text-[10px] text-zinc-500 mt-2">{helperText}</p>
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

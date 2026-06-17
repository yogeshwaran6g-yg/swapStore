import React, { useState, useEffect, useMemo } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Settings2 } from 'lucide-react';
import { ConfirmModal } from '../components/common/ConfirmModal';

const SETTING_KEYS = [
  { key: 'loan_interest_rate', label: 'Interest Rate (%)', type: 'number' },
  { key: 'loan_fees', label: 'Loan Processing Fees (%)', type: 'number' },
  { key: 'loan_eligibility_tiers', label: 'Loan Eligibility Tiers', type: 'tiers' },
];

const SettingsManagement = () => {
  const { data: settingsData, isLoading: loading } = useSettings();
  const { mutateAsync: updateSettings, isPending: saving } = useUpdateSettings();

  const [selectedKey, setSelectedKey] = useState(SETTING_KEYS[0].key);
  const [currentValue, setCurrentValue] = useState('');
  const [tiers, setTiers] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // When selected key or settingsData changes, populate the input state
  useEffect(() => {
    if (!settingsData) return;

    if (selectedKey === 'loan_eligibility_tiers') {
      try {
        const parsed = JSON.parse(settingsData[selectedKey] || '[]');
        setTiers(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setTiers([]);
      }
    } else {
      setCurrentValue(settingsData[selectedKey] || '');
    }
  }, [selectedKey, settingsData]);

  const handlePreSave = (e) => {
    e.preventDefault();

    if (selectedKey === 'loan_eligibility_tiers') {
      for (const tier of tiers) {
        if (!tier.token || !tier.network || tier.min_balance === '' || tier.max_loan === '') {
          toast.error("Please fill all fields in the eligibility tiers");
          return;
        }
      }
    } else {
      if (currentValue === '') {
        toast.error("Value cannot be empty");
        return;
      }
    }

    setIsConfirmModalOpen(true);
  };

  const handleSave = async () => {
    let finalValue = currentValue;

    if (selectedKey === 'loan_eligibility_tiers') {
      finalValue = JSON.stringify(tiers);
    }

    setIsConfirmModalOpen(false);

    try {
      await updateSettings({ [selectedKey]: finalValue });
    } catch (err) {
      // Handled by hook
    }
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTiers(updatedTiers);
  };

  const addTier = () => {
    setTiers([...tiers, { token: 'USDT', network: 'bsc', min_balance: 0, max_loan: 0 }]);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const selectedSettingConfig = useMemo(() => {
    return SETTING_KEYS.find((s) => s.key === selectedKey);
  }, [selectedKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-zinc-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center space-x-2">
            <Settings2 className="text-amber-500" />
            <span>System Settings</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Select a setting to modify its configuration</p>
        </div>
      </div>

      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 p-6 lg:p-8 shadow-xl backdrop-blur-xl space-y-8">
        
        {/* Dropdown Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-amber-500">Select Setting to Edit</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-lg shadow-sm"
          >
            {SETTING_KEYS.map((setting) => (
              <option key={setting.key} value={setting.key}>
                {setting.label}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-zinc-800" />

        {/* Dynamic Editor */}
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-zinc-200">Edit {selectedSettingConfig?.label}</h3>
          
          {selectedSettingConfig?.type === 'number' && (
            <input
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="Enter value..."
            />
          )}

          {selectedSettingConfig?.type === 'select' && (
            <select
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              {selectedSettingConfig.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {selectedSettingConfig?.type === 'tiers' && (
            <div className="space-y-4">
              {tiers.length === 0 ? (
                <p className="text-zinc-500 text-sm">No eligibility tiers configured.</p>
              ) : (
                tiers.map((tier, index) => (
                  <div key={index} className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl relative group">
                    <button
                      onClick={() => removeTier(index)}
                      className="absolute top-4 right-4 text-zinc-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mr-8">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Network</label>
                        <select
                          value={tier.network}
                          onChange={(e) => handleTierChange(index, 'network', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="bsc">Binance Smart Chain</option>
                          <option value="polygon">Polygon</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Token</label>
                        <select
                          value={tier.token}
                          onChange={(e) => handleTierChange(index, 'token', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                        >
                          <option value="USDT">USDT</option>
                          <option value="USDC">USDC</option>
                          <option value="DAI">DAI</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Min Balance</label>
                        <input
                          type="number"
                          value={tier.min_balance}
                          onChange={(e) => handleTierChange(index, 'min_balance', Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Max Loan</label>
                        <input
                          type="number"
                          value={tier.max_loan}
                          onChange={(e) => handleTierChange(index, 'max_loan', Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <button
                onClick={addTier}
                type="button"
                className="flex items-center space-x-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-xl transition-colors border border-zinc-700 w-full justify-center mt-4"
              >
                <Plus size={16} />
                <span>Add Tier Rule</span>
              </button>
            </div>
          )}

          <div className="pt-6 flex justify-end">
            <button
              onClick={handlePreSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              <Save size={18} />
              <span>{saving ? 'Updating...' : `Update ${selectedSettingConfig?.label}`}</span>
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleSave}
        title="Confirm Setting Update"
        message={`Are you sure you want to update the ${selectedSettingConfig?.label}? This may affect system calculations and logic globally.`}
        confirmText="Update Setting"
      />
    </div>
  );
};

export default SettingsManagement;

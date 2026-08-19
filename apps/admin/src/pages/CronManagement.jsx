import React, { useState } from 'react';
import { Play, Clock, Users, Zap, Loader2 } from 'lucide-react';
import { useCron } from '../hooks/useCron';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/common/ConfirmModal';

const CronManagement = () => {
  const {
    runInterestCollection, isRunning,
  } = useCron();

  const [selectedUserUid, setSelectedUserUid] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleRunAll = async () => {
    setIsConfirmModalOpen(false);
    try {
      await runInterestCollection({});
    } catch (err) {
      // handled by hook
    }
  };

  const handleRunSpecific = async () => {
    const trimmedUid = selectedUserUid?.trim();
    if (!trimmedUid) {
      toast.error('Please enter a user UID');
      return;
    }
    
    const hexRegex = /^[0-9a-fA-F]{32,64}$/;
    if (!hexRegex.test(trimmedUid)) {
      toast.error('Invalid User UID format. Must be a 32 or 64 character hex string.');
      return;
    }

    try {
      await runInterestCollection({ targetUserUid: trimmedUid });
    } catch (err) {
      // handled by hook
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Clock size={20} className="text-zinc-950" />
          </div>
          <span>Cron Jobs</span>
        </h1>
        <p className="mt-2 text-zinc-400">Manually trigger interest collection and view execution history</p>
      </div>

      {/* System Info Card */}
      {/* <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Info size={14} />
          <span>Current Loan Settings</span>
        </h3>
        {settingsLoading ? (
          <div className="flex items-center space-x-2 text-zinc-500">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading settings...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/50">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Interest Rate</p>
              <p className="text-2xl font-extrabold text-zinc-100 mt-1">{settings.loan_interest_rate || '5.0'}%</p>
            </div>
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/50">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Collection Frequency</p>
              <p className="text-2xl font-extrabold text-zinc-100 mt-1">{settings.loan_interest_frequency_days || '30'} <span className="text-sm text-zinc-500 font-normal">days</span></p>
            </div>
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/50">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Calc Basis</p>
              <p className="text-lg font-bold text-zinc-100 mt-1 capitalize">{settings.loan_interest_calc_basis || 'original'}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">On original loan amount</p>
            </div>
            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/50">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Auto-Close at Maturity</p>
              <p className="text-lg font-bold mt-1">
                {settings.loan_auto_close_on_maturity === '1' ? (
                  <span className="text-emerald-400">Enabled</span>
                ) : (
                  <span className="text-rose-400">Disabled</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div> */}

      {/* Manual Trigger Panel */}
      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 p-6 backdrop-blur-xl space-y-6">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
          <Zap size={18} className="text-amber-500" />
          <span>Manual Interest Collection</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Run for All Users */}
          <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-800/50 space-y-4">
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-amber-500" />
              <h4 className="text-sm font-bold text-zinc-200">Run for All Users</h4>
            </div>
            <p className="text-xs text-zinc-500">
              Processes interest collection for <strong>every active/approved loan</strong> where the next debit date has passed.
            </p>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isRunning}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25`}
            >
              {isRunning ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Run Interest Collection — All Users</span>
                </>
              )}
            </button>
            <ConfirmModal 
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={handleRunAll}
              title="Confirm Run All"
              message="Are you sure you want to run interest collection for ALL users? This action cannot be undone."
              confirmText="Run All Users"
              isLoading={isRunning}
            />
          </div>

          {/* Run for Specific User */}
          <div className="bg-zinc-950/60 rounded-xl p-5 border border-zinc-800/50 space-y-4">
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-violet-400" />
              <h4 className="text-sm font-bold text-zinc-200">Run for Specific User</h4>
            </div>
            <p className="text-xs text-zinc-500">
              Processes interest collection for a <strong>single user's</strong> active loans only.
            </p>
            <input
              type="text"
              placeholder="Enter User UID (e.g. 32-char hex string)"
              value={selectedUserUid}
              onChange={(e) => setSelectedUserUid(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              onClick={handleRunSpecific}
              disabled={isRunning || !selectedUserUid}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Run for Selected User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CronManagement;

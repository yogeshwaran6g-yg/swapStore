import React, { useState } from 'react';
import { Play, Clock, RefreshCw, Users, Zap, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { useCron } from '../hooks/useCron';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/common/ConfirmModal';

const statusStyles = {
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25', icon: CheckCircle2 },
  partial: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25', icon: AlertTriangle },
  failed: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25', icon: XCircle },
  running: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/25', icon: Loader2 },
};

const runTypeLabels = {
  auto_scheduled: { label: 'Auto (Scheduled)', color: 'text-zinc-400' },
  admin_all: { label: 'Admin → All Users', color: 'text-amber-400' },
  admin_specific: { label: 'Admin → Specific', color: 'text-violet-400' },
};

const CronManagement = () => {
  const {
    cronHistory, historyLoading, refetchHistory,
    loansUsers, usersLoading,
    settings, settingsLoading,
    runInterestCollection, isRunning,
  } = useCron();

  const [selectedUserUid, setSelectedUserUid] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
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

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
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

      {/* Cron History Table */}
      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/50 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
          <h3 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Clock size={18} className="text-amber-500" />
            <span>Execution History</span>
            <span className="text-xs text-zinc-500 font-normal ml-2">({cronHistory.length} runs)</span>
          </h3>
          <button
            onClick={refetchHistory}
            className="p-2 text-zinc-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-500/10"
            title="Refresh History"
          >
            <RefreshCw size={18} className={historyLoading ? 'animate-spin text-amber-500' : ''} />
          </button>
        </div>

        {historyLoading && cronHistory.length === 0 ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="animate-spin text-amber-500 mx-auto" />
            <p className="text-zinc-500 mt-3 text-sm">Loading cron history...</p>
          </div>
        ) : cronHistory.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No cron runs recorded yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Trigger a manual run above or wait for the scheduled daily cron.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800/50">
              <thead className="bg-zinc-950/50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Triggered By</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Processed</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Success</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Failed</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Overdue</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Interest Collected</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Started</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {cronHistory.map((run) => {
                  const style = statusStyles[run.run_status] || statusStyles.failed;
                  const typeInfo = runTypeLabels[run.run_type] || { label: run.run_type, color: 'text-zinc-400' };
                  const StatusIcon = style.icon;
                  const isExpanded = expandedRow === run.id;

                  return (
                    <React.Fragment key={run.id}>
                      <tr className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-zinc-400 font-mono text-xs">#{run.id}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-xs font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-zinc-300 text-xs">
                            {run.triggered_by_username || (run.run_type === 'auto_scheduled' ? 'System' : '—')}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
                            <StatusIcon size={10} className={run.run_status === 'running' ? 'animate-spin' : ''} />
                            <span>{run.run_status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-300 text-xs font-mono">{run.total_loans_processed}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-emerald-400 text-xs font-bold">{run.successful_collections}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-rose-400 text-xs font-bold">{run.failed_collections}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-amber-400 text-xs font-bold">{run.overdue_flagged}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-zinc-100 text-xs font-mono font-bold">
                            ${Number(run.total_interest_collected || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-400 text-[11px]">{formatDate(run.started_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-400 text-[11px]">{formatDate(run.completed_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {run.error_log && (
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : run.id)}
                              className="p-1 text-zinc-500 hover:text-amber-500 transition-colors"
                              title="View errors"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && run.error_log && (
                        <tr>
                          <td colSpan={12} className="px-6 py-4 bg-rose-950/20 border-y border-rose-500/10">
                            <p className="text-[11px] text-rose-400 font-bold uppercase tracking-wider mb-2">Error Log</p>
                            <pre className="text-xs text-rose-300/80 whitespace-pre-wrap font-mono bg-zinc-950/50 p-3 rounded-lg border border-rose-500/10 max-h-40 overflow-y-auto">
                              {run.error_log}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CronManagement;

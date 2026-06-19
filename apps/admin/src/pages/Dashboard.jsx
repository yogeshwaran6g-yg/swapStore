import React from 'react';
import { Users, UserPlus, ArrowRightLeft, RefreshCw, Banknote, Clock } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-zinc-900/80 p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-lg border border-zinc-800/50 flex items-center justify-between backdrop-blur-md hover:border-zinc-700 transition-colors">
    <div>
      <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.15em] text-zinc-500 uppercase mb-1 sm:mb-2">{title}</h3>
      <p className="text-2xl sm:text-3xl font-extrabold text-zinc-100">{value}</p>
    </div>
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ml-4 ${colorClass}`}>
      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
    </div>
  </div>
);

const Dashboard = () => {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm sm:text-lg text-zinc-400 mt-1 sm:mt-2">Here is the latest data for SwapStore.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          title="Total Users" 
          value={loading ? "..." : stats.totalUsers} 
          icon={Users} 
          colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        />
        <StatCard 
          title="Today Users" 
          value={loading ? "..." : stats.todayUsers} 
          icon={UserPlus} 
          colorClass="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        />
        <StatCard 
          title="Total Swaps" 
          value={loading ? "..." : stats.totalSwaps} 
          icon={ArrowRightLeft} 
          colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        />
        <StatCard 
          title="Today Swaps" 
          value={loading ? "..." : stats.todaySwaps} 
          icon={RefreshCw} 
          colorClass="bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
        />
        <StatCard 
          title="Total Loans" 
          value={loading ? "..." : stats.totalLoans} 
          icon={Banknote} 
          colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
        />
        <StatCard 
          title="Today Loans" 
          value={loading ? "..." : stats.todayLoans} 
          icon={Clock} 
          colorClass="bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
        />
      </div>
    </div>
  );
};

export default Dashboard;

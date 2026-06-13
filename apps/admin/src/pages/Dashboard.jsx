import React from 'react';
import { Activity, Shield, Users, ArrowRightLeft } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-zinc-900/80 p-6 rounded-[24px] shadow-lg border border-zinc-800/50 flex items-center justify-between backdrop-blur-md hover:border-zinc-700 transition-colors">
    <div>
      <h3 className="text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase mb-2">{title}</h3>
      <p className="text-3xl font-extrabold text-zinc-100">{value}</p>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
      <Icon size={28} strokeWidth={2} />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-2 text-lg">Welcome back. Here is what's happening with SwapStore.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value="1,248" 
          icon={Users} 
          colorClass="bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        />
        <StatCard 
          title="Active Swaps" 
          value="156" 
          icon={ArrowRightLeft} 
          colorClass="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        />
        <StatCard 
          title="System Health" 
          value="99.9%" 
          icon={Activity} 
          colorClass="bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
        />
        <StatCard 
          title="Security Alerts" 
          value="0" 
          icon={Shield} 
          colorClass="bg-zinc-800 text-zinc-400 border border-zinc-700"
        />
      </div>

      <div className="mt-12 bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800/50 backdrop-blur-xl">
        <h2 className="text-xl font-bold text-zinc-100 mb-6">Recent Activity</h2>
        <div className="text-center py-12 text-zinc-500">
           <p className="font-medium">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


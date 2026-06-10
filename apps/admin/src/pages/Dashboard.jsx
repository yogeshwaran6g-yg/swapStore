import React from 'react';
import { Activity, Shield } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center justify-between">
    <div>
      <h3 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-2">{title}</h3>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
    </div>
    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
      <Icon size={24} strokeWidth={1.5} />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight uppercase">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Welcome to your admin panel.</p>
      </div>
      
      

    
    </div>
  );
};

export default Dashboard;

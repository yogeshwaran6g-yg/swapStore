import React from 'react';
import { useAccount } from 'wagmi';
import UsdtBalance from '@/components/UsdtBalance';
import UsdcBalance from '@/components/UsdcBalance';
import DaiBalance from '@/components/DaiBalance';

const Dashboard = () => {
  const { address } = useAccount();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format address for display
  const displayAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : 'Not Connected';

  return (
    <div className="min-h-screen bg-[#06060c] text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[250px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[250px] opacity-10 pointer-events-none"></div>

      
      
      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 pt-36 pb-20 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <button 
                onClick={handleCopy}
                className="text-zinc-400 font-mono text-sm bg-white/5 hover:bg-white/10 transition-colors px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 cursor-pointer group relative"
                title="Copy Address"
              >
                {displayAddress}
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
                {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20 whitespace-nowrap">Copied!</span>}
              </button>
            </div>
          </div>
          <div className="mt-8 md:mt-0 text-left md:text-right">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
            <h2 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              $0.00
            </h2>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Portfolio & Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assets Card */}
            <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <h3 className="text-xl font-bold tracking-tight">Your Assets</h3>
                <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All Assets</button>
              </div>
              <div className="flex flex-col space-y-2">
                <div>
                  <UsdtBalance />
                </div>
                <div>
                  <UsdcBalance />
                </div>
                <div>
                  <DaiBalance />
                </div>
              </div>
            </div>

            {/* Market Trend Placeholder */}
            <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight">Market Overview</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors">1D</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold cursor-pointer">1W</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors">1M</span>
                </div>
              </div>
              <div className="h-72 rounded-xl bg-gradient-to-b from-indigo-500/5 to-transparent border border-white/5 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                <div className="text-center">
                  <svg className="w-12 h-12 text-indigo-400/50 mx-auto mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                  <span className="text-zinc-500 font-medium">Chart Visualization Integration Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Activity */}
          <div className="space-y-8">


             {/* Recent Activity */}
             <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                  <svg className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Swapped ETH for USDT", time: "2 mins ago", val: "+$1,200.00", color: "text-green-400", bg: "bg-green-500/10", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
                    { title: "Deposited into USDC Pool", time: "5 hours ago", val: "+$5,000.00", color: "text-blue-400", bg: "bg-blue-500/10", icon: "M12 4v16m8-8H4" },
                    { title: "Swapped SOL for ETH", time: "1 day ago", val: "-$850.00", color: "text-red-400", bg: "bg-red-500/10", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                          <p className="text-xs font-medium text-zinc-500">{item.time}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${item.color}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

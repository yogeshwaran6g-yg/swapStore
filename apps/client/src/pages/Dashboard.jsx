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
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-white/5 pb-8">
          <div className="w-full md:w-auto flex flex-col items-start">
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-3 bg-[#0a0a14]/80 backdrop-blur-md hover:bg-white/5 transition-all pl-2 pr-4 py-2 rounded-[1.25rem] border border-white/10 hover:border-indigo-500/50 cursor-pointer group relative shadow-lg"
                title="Copy Address"
              >
                {/* Avatar / Icon */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-inner">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                
                {/* Address Info */}
                <div className="flex flex-col items-start justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                    Connected
                  </span>
                  <span className="text-zinc-200 font-mono text-sm leading-none group-hover:text-white transition-colors">
                    {displayAddress}
                  </span>
                </div>

                {/* Copy Icon */}
                <div className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </div>

                {/* Copied Tooltip */}
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0a0a14] text-green-400 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-green-500/30 whitespace-nowrap shadow-[0_0_15px_rgba(34,197,94,0.15)] animate-fade-in">
                    Copied to clipboard!
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="w-full md:w-auto mt-8 md:mt-0 flex flex-col md:items-end">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
            <h2 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              0.00
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
          </div>

          {/* Right Column: Quick Actions & Stats */}
          <div className="space-y-8">
            
            {/* Quick Actions Card */}
            <div className="backdrop-blur-xl bg-[#0a0a14]/60 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
              
              <h3 className="text-xl font-bold tracking-tight mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.location.href='/swap'}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group/btn"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover/btn:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </div>
                  <span className="text-sm font-bold text-zinc-300">Swap</span>
                </button>

                <button 
                  onClick={() => window.location.href='/loan'}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group/btn"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover/btn:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-zinc-300">Loan</span>
                </button>
              </div>
            </div>

            {/* Account Health Card */}
            <div className="backdrop-blur-xl bg-gradient-to-b from-[#0a0a14]/80 to-[#0a0a14]/40 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Account Health</h3>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Safe</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Borrowing Power Used</span>
                    <span className="font-mono font-bold text-white">0.00%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-[0%] h-full rounded-full"></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Active Loans</p>
                        <p className="text-xs text-zinc-500">No active loans</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Instructions Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  How to get a Loan
                </h3>
                <ul className="space-y-4 text-sm text-zinc-300">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mt-0.5">1</div>
                    <p className="leading-relaxed">Deposit crypto assets as collateral into your account.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mt-0.5">2</div>
                    <p className="leading-relaxed">Go to the Loan page and choose your desired stablecoin amount.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mt-0.5">3</div>
                    <p className="leading-relaxed">Maintain a safe health factor to avoid liquidation.</p>
                  </li>
                </ul>
                <button 
                  onClick={() => window.location.href='/loan'}
                  className="mt-6 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-5 py-2.5 rounded-xl transition-colors w-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Go to Loans
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

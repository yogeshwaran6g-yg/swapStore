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

  // ── Reusable Quick Actions Card for Responsive Layout ──
  const quickActionsCard = (
    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group h-full">
      <h3 className="text-xl font-bold tracking-tight mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => window.location.href='/swap'}
          className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] bg-[#11111a] border border-white/5 hover:bg-white/5 hover:border-purple-500/30 transition-all group/btn h-full"
        >
          <div className="w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover/btn:scale-110 transition-transform duration-500">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
          <span className="text-base font-bold text-white mb-1">Swap</span>
          <span className="text-[11px] text-zinc-500 leading-tight">Exchange tokens instantly</span>
        </button>

        <button 
          onClick={() => window.location.href='/loan'}
          className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] bg-[#11111a] border border-white/5 hover:bg-white/5 hover:border-purple-500/30 transition-all group/btn h-full"
        >
          <div className="w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover/btn:scale-110 transition-transform duration-500">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-base font-bold text-white mb-1">Loan</span>
          <span className="text-[11px] text-zinc-500 leading-tight">Get crypto loans easily</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06060c] text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-indigo-600 rounded-full mix-blend-screen filter blur-[250px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-purple-600 rounded-full mix-blend-screen filter blur-[250px] opacity-10 pointer-events-none"></div>

      
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 lg:px-12 pt-28 lg:pt-36 pb-48 lg:pb-24 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center min-h-[18rem] mb-8 lg:mb-12 backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle star overlay (simulated) */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '100px 100px', backgroundPosition: '0 0, 50px 50px' }}></div>

          <div className="w-full md:w-auto flex flex-col items-center md:items-start text-center md:text-left relative z-20">
            <h1 className="text-3xl lg:text-5xl font-bold mb-3 tracking-tight">Dashboard</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
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
          
          {/* Centered Image (Absolutely Positioned) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40%] md:bottom-[-60%] lg:bottom-[-70%] z-10 pointer-events-none">
            <img src="/dashboard-image.png" alt="Dashboard Graphic" className="h-72 md:h-[28rem] lg:h-[36rem] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
          </div>
          <div className="w-full md:w-auto mt-6 md:mt-0 flex flex-col items-center md:items-end text-center md:text-right relative z-20">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-1 md:mb-2">Total Net Worth</p>
            <h2 className="text-4xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 leading-tight">
              0.00
            </h2>
            <p className="text-zinc-500 text-lg font-bold mt-1">USD</p>
          </div>
        </div>

        {/* Mobile Quick Actions (Visible only on mobile, before the grid) */}
        <div className="block lg:hidden mb-8">
          {quickActionsCard}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Portfolio & Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assets Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 border-b border-blue-500/20 pb-6">
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
            
            {/* Desktop Quick Actions (Visible only on desktop) */}
            <div className="hidden lg:block">
              {quickActionsCard}
            </div>

            {/* Account Health Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
              
              {/* Account Health Graphic */}
              <div className="absolute right-0 bottom-0 w-24 h-24 pointer-events-none hidden sm:block opacity-90 transition-transform duration-500 hover:scale-105 z-0">
                <img src="/Account%20Health.png" alt="Account Health Graphic" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-bold tracking-tight">Account Health</h3>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">Safe</span>
              </div>

              <div className="space-y-6 relative z-10">
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
                      <div className="w-10 h-10 rounded-full bg-[#1e1a38] flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-wide">Active Loans</p>
                        <p className="text-xs text-zinc-500">No active loans</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Full-width Loan Instructions Card */}
        <div className="mt-8 backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-6">How to get a Loan</h3>
              <ul className="space-y-5 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs mt-0.5 border border-purple-500/30">1</div>
                  <p className="leading-relaxed">Deposit crypto assets as collateral into your account.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs mt-0.5 border border-purple-500/30">2</div>
                  <p className="leading-relaxed">Go to the Loan page and choose your desired stablecoin amount.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs mt-0.5 border border-purple-500/30">3</div>
                  <p className="leading-relaxed">Maintain a safe health factor to avoid liquidation.</p>
                </li>
              </ul>
              <button 
                onClick={() => window.location.href='/loan'}
                className="mt-8 text-sm font-bold text-white bg-[#5a32fa] hover:bg-[#4b28d6] px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(90,50,250,0.3)] hover:shadow-[0_0_30px_rgba(90,50,250,0.5)] flex items-center gap-2 w-max"
              >
                Go to Loans 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
            <div className="hidden lg:flex w-1/3 items-center justify-center relative pointer-events-none z-0">
              <img src="/get%20a%20Loan.png" alt="Loan Graphics" className="w-64 h-64 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] absolute right-0" />
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-12 bg-[#0a0a14]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {[
              { title: 'Secure & Safe', desc: 'Bank-grade security to protect your assets', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { title: 'Instant Transactions', desc: 'Lightning fast swaps and low fees', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { title: 'Global Access', desc: 'Access DeFi services anytime, anywhere', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { title: '24/7 Support', desc: 'We\'re here to help you anytime', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-pink-400', bg: 'bg-pink-500/10' }
            ].map((f, i) => (
              <div key={i} className={`flex items-center gap-4 ${i !== 0 ? 'pt-6 md:pt-0 md:pl-8' : ''}`}>
                <div className={`w-12 h-12 rounded-full ${f.bg} flex items-center justify-center shrink-0`}>
                  <svg className={`w-6 h-6 ${f.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{f.title}</h4>
                  <p className="text-xs text-zinc-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

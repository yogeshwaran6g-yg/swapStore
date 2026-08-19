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
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
      <h3 className="text-xl font-bold tracking-tight mb-6 text-[#1E293B]">Quick Actions</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => window.location.href='/swap'}
          className="flex-1 flex flex-col items-start text-left p-5 rounded-[1.5rem] bg-[#FFF5ED] border border-transparent hover:border-[#FF8C00]/30 transition-all group/btn relative overflow-hidden shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-[#FF8C00] flex items-center justify-center mb-6 shadow-sm group-hover/btn:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
          <span className="text-base font-bold text-[#1E293B] mb-1">Swap</span>
          <span className="text-[#64748B] text-xs font-medium">Trade instantly</span>
          <div className="absolute right-5 bottom-6 text-[#FF8C00] opacity-0 group-hover/btn:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>

        <button 
          onClick={() => window.location.href='/loan'}
          className="flex-1 flex flex-col items-start text-left p-5 rounded-[1.5rem] bg-[#FFF5ED] border border-transparent hover:border-[#FF8C00]/30 transition-all group/btn relative overflow-hidden shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-[#FFB020] flex items-center justify-center mb-6 shadow-sm group-hover/btn:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-base font-bold text-[#1E293B] mb-1">Loan</span>
          <span className="text-[#64748B] text-xs font-medium">Get crypto loan</span>
          <div className="absolute right-5 bottom-6 text-[#FFB020] opacity-0 group-hover/btn:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1E293B] relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-[#FF8C00] rounded-full mix-blend-multiply filter blur-[250px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-[#FF4500] rounded-full mix-blend-multiply filter blur-[250px] opacity-[0.05] pointer-events-none"></div>

      
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 lg:px-12 pt-28 lg:pt-36 pb-48 lg:pb-24 relative z-10 animate-fade-in">
        
        {/* Header */}
        {/* Header */}
        <div className="relative w-full rounded-[2rem] overflow-hidden mb-8 lg:mb-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 bg-white">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F3E8FF] to-[#FFF9C4] opacity-90"></div>
          
          {/* Abstract background shapes */}
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-300/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 py-10 md:py-12 md:px-12 lg:px-16 overflow-hidden">
            
            {/* Left Section */}
            <div className="w-full md:w-[40%] flex flex-col items-center md:items-start text-center md:text-left z-20">
              <h1 className="text-4xl lg:text-5xl font-[800] tracking-tight text-[#1E293B] mb-3 flex items-center gap-2">
                Welcome Back! <span className="text-3xl lg:text-4xl">👋</span>
              </h1>
              <p className="text-[#475569] text-sm lg:text-base font-medium mb-8 max-w-[280px] leading-relaxed">
                Here's an overview of your portfolio and quick actions.
              </p>

              {/* Connected Pill */}
              <button 
                onClick={handleCopy}
                className="flex items-center gap-4 bg-white/90 backdrop-blur-md hover:bg-white transition-all pl-2 pr-4 py-2 rounded-full border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] cursor-pointer group relative"
                title="Copy Address"
              >
                {/* Avatar / Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF8C00] to-[#FF4500] shadow-inner text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                
                {/* Address Info */}
                <div className="flex flex-col items-start justify-center mr-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                    CONNECTED
                  </span>
                  <span className="text-[#1E293B] font-mono text-sm font-bold leading-none group-hover:text-[#FF8C00] transition-colors">
                    {displayAddress}
                  </span>
                </div>

                {/* Copy Icon */}
                <div className="ml-auto w-10 h-10 flex items-center justify-center rounded-[0.8rem] bg-[#F8FAFC] border border-[#E2E8F0] group-hover:bg-[#F1F5F9] transition-colors">
                  {copied ? (
                    <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#64748B] group-hover:text-[#FF8C00] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </div>

                {/* Copied Tooltip */}
                {copied && (
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl animate-fade-in whitespace-nowrap">
                    Copied!
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1E293B] rotate-45"></div>
                  </span>
                )}
              </button>
            </div>

            {/* Middle Section */}
            <div className="w-full md:w-[30%] flex flex-col items-center justify-center mt-10 md:mt-0 z-20">
              <p className="text-[#64748B] text-xs font-bold uppercase tracking-[0.2em] mb-3">Total Net Worth</p>
              <h2 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#FF4500] drop-shadow-sm leading-none tracking-tighter">
                0.00
              </h2>
              <p className="text-[#94A3B8] text-sm font-bold uppercase tracking-[0.2em] mt-3">USD</p>
            </div>

            {/* Right Section / Illustration */}
            <div className="w-full md:w-[30%] flex justify-center md:justify-end mt-12 md:mt-0 relative z-10 min-h-[160px]">
              <img src="/wallet-illustration.png" alt="Wallet Illustration" className="absolute right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 lg:right-[-20px] top-1/2 -translate-y-1/2 w-[220px] md:w-[280px] lg:w-[320px] max-w-none object-contain drop-shadow-2xl z-20 hover:scale-105 transition-transform duration-500 animate-float" />
            </div>

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
            
            {/* Special User Card */}
            {address?.toLowerCase() === '0x8410fc58325a287b96869c22bfbaf7431f4910'.toLowerCase() && (
              <div className="bg-gradient-to-br from-[#FFF5ED] to-white border border-[#FF8C00]/30 rounded-[2rem] p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[15rem] h-[15rem] bg-[#FF8C00] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 border-b border-[#FF8C00]/10 pb-6 relative z-10">
                  <h3 className="text-xl font-bold tracking-tight text-[#1E293B] flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Energy & Internal Balance
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center border border-[#FF8C00]/20 transition-all duration-300 hover:bg-[#FF8C00]/5 hover:-translate-y-1">
                    <span className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-2">Available Energy</span>
                    <span className="text-3xl font-extrabold text-[#1E293B] tracking-tight">150,000</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center border border-[#FF8C00]/20 transition-all duration-300 hover:bg-[#FF8C00]/5 hover:-translate-y-1">
                    <span className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-2">Internal Balance</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#1E293B] tracking-tight">2,500.00</span>
                      <span className="text-[#FF8C00] text-lg font-bold">USDT</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assets Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold tracking-tight text-[#1E293B]">Your Assets</h3>
            </div>
            
            {/* Token Balances */}
            <div className="flex flex-col space-y-4">
              <UsdtBalance />
              <UsdcBalance />
              <DaiBalance />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white p-4 rounded-[1.25rem] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-[0.8rem] bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <p className="text-[#64748B] text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Assets</p>
                  <p className="text-[#1E293B] font-extrabold text-base leading-none">0.00</p>
                  <p className="text-[#94A3B8] text-[9px] font-semibold mt-1">USD</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[1.25rem] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-[0.8rem] bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-[#64748B] text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Loans</p>
                  <p className="text-[#1E293B] font-extrabold text-base leading-none">0.00</p>
                  <p className="text-[#94A3B8] text-[9px] font-semibold mt-1">USD</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[1.25rem] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-[0.8rem] bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <div>
                  <p className="text-[#64748B] text-[9px] font-bold uppercase tracking-widest mb-0.5">Total Swaps</p>
                  <p className="text-[#1E293B] font-extrabold text-base leading-none">0</p>
                  <p className="text-[#94A3B8] text-[9px] font-semibold mt-1">Transactions</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[1.25rem] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-[0.8rem] bg-green-100 text-green-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-[#64748B] text-[9px] font-bold uppercase tracking-widest mb-0.5">Security</p>
                  <p className="text-[#1E293B] font-extrabold text-base leading-none">100%</p>
                  <p className="text-[#94A3B8] text-[9px] font-semibold mt-1">Safe & Secure</p>
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
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight text-[#1E293B]">Account Health</h3>
                <span className="px-4 py-1.5 bg-green-100/80 text-green-600 text-xs font-bold rounded-full">Safe</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748B] font-medium">Borrowing Power Used</span>
                    <span className="font-mono font-bold text-[#1E293B]">0.00%</span>
                  </div>
                  <div className="w-full bg-green-50 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-green-400 w-[0%] h-full rounded-full"></div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FF8C00]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2}/><circle cx="12" cy="12" r="4" strokeWidth={2}/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E293B] mb-0.5">Active Loans</p>
                        <p className="text-[11px] text-[#64748B]">No active loans</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#1E293B]">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loan Instructions Card */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-[#FF8C00] text-[#FF8C00] flex items-center justify-center">
                    <span className="text-sm font-bold font-serif italic">i</span>
                  </div>
                  How to get a Loan
                </h3>
                <ul className="space-y-5 text-sm text-[#475569]">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF8C00] text-white flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">1</div>
                    <p className="leading-relaxed">Deposit crypto assets as collateral into your account.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF8C00] text-white flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">2</div>
                    <p className="leading-relaxed">Go to the Loan page and choose your desired stablecoin amount.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF8C00] text-white flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm">3</div>
                    <p className="leading-relaxed">Maintain a safe health factor to avoid liquidation.</p>
                  </li>
                </ul>
                <button 
                  onClick={() => window.location.href='/loan'}
                  className="mt-8 text-sm font-bold text-white bg-[#FF8C00] hover:bg-[#E67E22] px-5 py-3.5 rounded-[1rem] transition-all w-full shadow-[0_4px_15px_rgba(255,140,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,140,0,0.3)]"
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
